// lib/utils/index.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";

// --- Tailwind class merger ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- XP to Level ---
export function xpToLevel(xp: number) {
  return Math.floor(xp / 1000) + 1;
}

export function xpForNextLevel(xp: number) {
  const currentLevel = xpToLevel(xp);
  return currentLevel * 1000;
}

export function xpProgress(xp: number) {
  const currentLevel = xpToLevel(xp);
  const baseXP = (currentLevel - 1) * 1000;
  const nextXP = currentLevel * 1000;
  return ((xp - baseXP) / (nextXP - baseXP)) * 100;
}

// --- Score to Grade ---
export function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function scoreToGradeColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 80) return "text-blue-400";
  if (score >= 70) return "text-yellow-400";
  if (score >= 60) return "text-orange-400";
  return "text-red-400";
}

// --- Time formatting ---
export function formatTimestamp(ts: Timestamp | Date | null) {
  if (!ts) return "-";
  const date = ts instanceof Timestamp ? ts.toDate() : ts;
  return formatDistanceToNow(date, { addSuffix: true, locale: localeId });
}

export function formatDate(ts: Timestamp | Date | null, fmt = "dd MMM yyyy") {
  if (!ts) return "-";
  const date = ts instanceof Timestamp ? ts.toDate() : ts;
  return format(date, fmt, { locale: localeId });
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
}

// --- Difficulty ---
export function difficultyLabel(d: string): string {
  const map: Record<string, string> = {
    easy: "Mudah", medium: "Sedang", hard: "Sulit", expert: "Ahli",
  };
  return map[d] || d;
}

export function difficultyColor(d: string): string {
  const map: Record<string, string> = {
    easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    hard: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    expert: "text-red-400 bg-red-400/10 border-red-400/20",
  };
  return map[d] || "text-gray-400";
}

// --- Shuffle array ---
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Truncate text ---
export function truncate(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : text.slice(0, maxLength) + "…";
}

// --- Generate avatar fallback initials ---
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// --- XP reward calculation ---
export function calculateXPReward(
  score: number,
  difficulty: string,
  timeTakenSeconds: number,
  totalTimeSeconds: number
): number {
  const base = 50;
  const scoreBonus = Math.floor(score / 10) * 5;
  const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2, expert: 3 }[difficulty] ?? 1;
  const speedBonus = timeTakenSeconds < totalTimeSeconds * 0.6 ? 20 : 0;
  return Math.round((base + scoreBonus + speedBonus) * difficultyMultiplier);
}

// --- Local storage helpers (safe) ---
export function safeLocalGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function safeLocalSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silently fail
  }
    }
