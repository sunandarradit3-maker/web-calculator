// app/api/ai/explain/route.ts
import { NextRequest, NextResponse } from "next/server";
import { explainQuestion } from "@/lib/ai/gemini";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { question, subject } = await req.json();

    if (!question || !subject) {
      return NextResponse.json({ error: "question dan subject wajib diisi" }, { status: 400 });
    }

    const explanation = await explainQuestion(question, subject);
    return NextResponse.json({ success: true, data: explanation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
