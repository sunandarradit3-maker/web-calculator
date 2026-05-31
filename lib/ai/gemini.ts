// lib/ai/gemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { GenerateQuizRequest, Question, AIAnalysis, QuizResult } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

function getModel(streaming = false) {
  return genAI.getGenerativeModel({
    model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-1.5-pro",
    safetySettings,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  });
}

// ============================================
// GENERATE QUIZ QUESTIONS
// ============================================
export async function generateQuizQuestions(req: GenerateQuizRequest): Promise<Question[]> {
  const model = getModel();

  const prompt = `
Kamu adalah pembuat soal ujian profesional Indonesia.
Buat ${req.count} soal ${req.type || "pilihan_ganda"} tentang:
- Mata pelajaran: ${req.subjectId}
- Topik: ${req.topic}
- Tingkat kesulitan: ${req.difficulty}
${req.context ? `- Konteks tambahan: ${req.context}` : ""}

Format WAJIB JSON array berikut (tanpa penjelasan lain):
[
  {
    "type": "multiple_choice",
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correctAnswer": 0,
    "explanation": "Penjelasan lengkap mengapa jawaban ini benar...",
    "hints": ["Petunjuk 1...", "Petunjuk 2..."],
    "tags": ["tag1", "tag2"],
    "difficulty": "${req.difficulty}"
  }
]

Aturan:
- Soal dalam Bahasa Indonesia yang baik dan benar
- Jawaban benar bervariasi (bukan selalu A)
- Penjelasan minimal 2 kalimat, informatif dan mendidik
- Pilihan jawaban plausible (pengecoh yang baik)
- Tidak ada soal duplikat
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse JSON — strip markdown fences if present
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  return parsed.map((q: Partial<Question>, i: number) => ({
    ...q,
    id: `ai_${Date.now()}_${i}`,
    subjectId: req.subjectId,
    topicId: req.topic,
    aiGenerated: true,
    createdBy: "ai",
    createdAt: new Date() as any,
    stats: { totalAttempts: 0, correctAttempts: 0, avgTimeSeconds: 0, difficulty_rating: 3 },
  })) as Question[];
}

// ============================================
// AI TUTOR CHAT
// ============================================
export async function chatWithTutor(
  message: string,
  history: { role: "user" | "model"; parts: string[] }[] = [],
  subjectId?: string
) {
  const model = getModel();

  const systemPrompt = `
Kamu adalah ExamBoost AI Tutor — asisten belajar cerdas untuk pelajar Indonesia.
${subjectId ? `Fokus pada mata pelajaran: ${subjectId}.` : ""}

Karaktermu:
- Sabar, supportif, dan encouraging
- Jelaskan konsep dengan analogi dan contoh nyata
- Gunakan Bahasa Indonesia yang baku namun tetap ramah
- Jika ada soal, bantu step-by-step tanpa langsung memberi jawaban
- Gunakan emoji secukupnya untuk membuat percakapan lebih hidup
- Format jawaban dengan markdown (bold, bullet, code block) jika perlu
- Selalu motivasi pelajar di akhir respons
`;

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Halo! Saya ExamBoost AI Tutor. Siap membantu belajar kamu! 🚀 Ada yang ingin ditanyakan?" }] },
      ...history.map((h) => ({
        role: h.role,
        parts: h.parts.map((p) => ({ text: p })),
      })),
    ],
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}

// ============================================
// STREAMING TUTOR CHAT
// ============================================
export async function* streamChatWithTutor(
  message: string,
  history: { role: "user" | "model"; parts: string[] }[] = [],
  subjectId?: string
) {
  const model = getModel(true);

  const chat = model.startChat({
    history: history.map((h) => ({
      role: h.role,
      parts: h.parts.map((p) => ({ text: p })),
    })),
  });

  const result = await chat.sendMessageStream(message);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

// ============================================
// AI ANALYSIS OF QUIZ RESULT
// ============================================
export async function analyzeQuizResult(result: QuizResult): Promise<AIAnalysis> {
  const model = getModel();

  const wrongQuestions = result.answers
    .filter((a) => !a.isCorrect)
    .map((a) => `- Soal: "${a.question}" | Jawaban kamu: ${a.userAnswer} | Benar: ${a.correctAnswer}`)
    .join("\n");

  const prompt = `
Analisis hasil ujian berikut dan berikan feedback yang konstruktif dalam Bahasa Indonesia:

Skor: ${result.score}%
Benar: ${result.correctCount} | Salah: ${result.wrongCount} | Skip: ${result.skippedCount}
Waktu: ${Math.round(result.timeTakenSeconds / 60)} menit

Soal yang salah:
${wrongQuestions || "Tidak ada soal yang salah — sempurna!"}

Berikan response dalam format JSON:
{
  "summary": "Ringkasan performa dalam 2-3 kalimat...",
  "strengths": ["Kelebihan 1...", "Kelebihan 2..."],
  "weaknesses": ["Kelemahan 1...", "Kelemahan 2..."],
  "recommendations": ["Saran 1...", "Saran 2...", "Saran 3..."],
  "studyPlan": [
    {
      "topic": "Nama topik yang perlu diperbaiki",
      "priority": "high|medium|low",
      "estimatedMinutes": 30,
      "resources": ["Sumber belajar 1...", "Sumber belajar 2..."]
    }
  ]
}
`;

  const resp = await model.generateContent(prompt);
  const text = resp.response.text().replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(text);

  return {
    ...parsed,
    generatedAt: new Date() as any,
  } as AIAnalysis;
}

// ============================================
// EXPLAIN A QUESTION
// ============================================
export async function explainQuestion(question: string, subject: string): Promise<string> {
  const model = getModel();
  const prompt = `
Jelaskan konsep di balik soal berikut dalam Bahasa Indonesia secara detail dan mudah dipahami:

Mata pelajaran: ${subject}
Soal: "${question}"

Berikan penjelasan yang mencakup:
1. Konsep dasar yang diuji
2. Rumus/teori yang relevan (jika ada)
3. Cara berpikir untuk menjawab soal seperti ini
4. Contoh serupa dengan pembahasan
`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
