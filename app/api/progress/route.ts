// app/api/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveDailyProgress, getWeeklyProgress } from "@/lib/firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...data } = body;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    await saveDailyProgress(userId, data);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const progress = await getWeeklyProgress(userId);
    return NextResponse.json({ success: true, data: progress });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
