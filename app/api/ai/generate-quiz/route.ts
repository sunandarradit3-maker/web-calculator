// app/api/ai/generate-quiz/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateQuizQuestions } from "@/lib/ai/gemini";
import type { GenerateQuizRequest } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body: GenerateQuizRequest = await req.json();

    const { subjectId, topic, difficulty, count } = body;

    if (!subjectId || !topic || !difficulty || !count) {
      return NextResponse.json(
        { error: "subjectId, topic, difficulty, dan count wajib diisi" },
        { status: 400 }
      );
    }

    if (count > 20) {
      return NextResponse.json({ error: "Maksimal 20 soal per request" }, { status: 400 });
    }

    const questions = await generateQuizQuestions(body);

    return NextResponse.json({ success: true, data: questions, count: questions.length });
  } catch (err: any) {
    console.error("[Generate Quiz Error]", err);
    return NextResponse.json({ error: err.message || "Gagal generate soal" }, { status: 500 });
  }
}
