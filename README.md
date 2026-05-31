# ⚡ ExamBoost AI 2026

> Platform belajar cerdas berbasis AI untuk persiapan ujian — Quiz adaptif, Tutor AI, Analisis performa real-time.

---

## 🏗️ Tech Stack

| Layer        | Teknologi                                      |
|-------------|------------------------------------------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Animation**| Framer Motion                                  |
| **Auth**     | Firebase Authentication (Google, GitHub, Email)|
| **Database** | Firebase Firestore                             |
| **Storage**  | Firebase Storage                               |
| **AI**       | Google Gemini 1.5 Pro                          |
| **Hosting**  | Vercel                                         |

---

## 📁 Struktur Proyek

```
examboost-ai-2026/
├── app/
│   ├── (auth)/
│   │   ├── login/           ← Halaman login
│   │   └── register/        ← Halaman registrasi
│   ├── (dashboard)/
│   │   ├── layout.tsx       ← Sidebar + navigation
│   │   ├── dashboard/       ← Dashboard utama
│   │   ├── quiz/            ← Quiz adaptif
│   │   │   ├── [id]/        ← Detail & main quiz
│   │   │   └── new/         ← Buat quiz baru
│   │   ├── exam/            ← Simulasi ujian (UTBK, UN)
│   │   │   ├── [id]/
│   │   │   └── results/
│   │   ├── tutor/           ← AI Tutor (chat streaming)
│   │   ├── leaderboard/     ← Papan peringkat
│   │   └── progress/        ← Analisis & grafik progres
│   ├── api/
│   │   ├── ai/
│   │   │   ├── chat/        ← Streaming SSE endpoint
│   │   │   ├── generate-quiz/← Generate soal AI
│   │   │   └── explain/     ← Jelaskan soal
│   │   └── progress/        ← Progress tracking
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                  ← Reusable UI (Button, Modal, dll)
│   ├── auth/                ← Auth form components
│   ├── quiz/                ← Quiz UI components
│   ├── exam/                ← Exam UI components
│   ├── tutor/               ← Chat UI components
│   └── dashboard/           ← Dashboard widgets
├── lib/
│   ├── firebase/
│   │   ├── config.ts        ← Firebase init
│   │   ├── auth.ts          ← Auth helpers
│   │   └── firestore.ts     ← DB helpers (CRUD)
│   ├── ai/
│   │   └── gemini.ts        ← Gemini AI client
│   └── utils/
│       └── index.ts         ← Helper functions
├── hooks/
│   ├── useAuth.ts           ← Auth state hook
│   └── useQuiz.ts           ← Quiz engine hook
├── types/
│   └── index.ts             ← Semua TypeScript types
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Cara Menjalankan

### 1. Clone & Install
```bash
cd examboost-ai-2026
npm install
```

### 2. Setup Environment
```bash
cp .env.local.example .env.local
# Edit .env.local dan isi semua variabel
```

### 3. Setup Firebase
1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan **Authentication** (Google, GitHub, Email/Password)
3. Buat **Firestore Database** (mode production)
4. Aktifkan **Storage**
5. Salin konfigurasi ke `.env.local`

### 4. Setup Google Gemini AI
1. Buka [Google AI Studio](https://aistudio.google.com)
2. Buat API key baru
3. Masukkan ke `GEMINI_API_KEY` di `.env.local`

### 5. Jalankan
```bash
npm run dev
# Buka http://localhost:3000
```

---

## 🗃️ Firestore Collections

| Collection      | Deskripsi                        |
|----------------|----------------------------------|
| `users`         | Profil user, XP, level, stats   |
| `subjects`      | Mata pelajaran                   |
| `questions`     | Bank soal                        |
| `quizzes`       | Definisi quiz                    |
| `quiz_results`  | Hasil quiz per user              |
| `tutor_sessions`| Riwayat chat AI tutor            |
| `daily_progress`| Progress harian user             |

---

## ✨ Fitur Lengkap

- [x] Auth (Google, GitHub, Email)
- [x] Dashboard dengan statistik real-time
- [x] Quiz adaptif dengan timer
- [x] Generate soal otomatis dengan AI
- [x] AI Tutor chat (streaming)
- [x] Analisis hasil quiz dengan AI
- [x] Leaderboard global & mingguan
- [x] Sistem XP, level, streak
- [x] Progress tracking & grafik
- [x] Simulasi ujian (UTBK, UN, SNBT)
- [ ] Notifikasi reminder belajar
- [ ] Fitur belajar bersama (multiplayer quiz)
- [ ] Ekspor hasil belajar ke PDF

---

## 📄 Lisensi

MIT © ExamBoost AI 2026
