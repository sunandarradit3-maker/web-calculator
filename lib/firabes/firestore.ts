// lib/firebase/firestore.ts
import {
  collection, doc, getDoc, getDocs, addDoc, setDoc,
  updateDoc, deleteDoc, query, where, orderBy, limit,
  serverTimestamp, Timestamp, onSnapshot,
  startAfter, QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import type {
  User, Quiz, QuizResult, Question, Subject,
  TutorSession, DailyProgress, TopicMastery, LeaderboardEntry
} from "@/types";

// ============================================
// COLLECTIONS
// ============================================
export const COLLECTIONS = {
  USERS:         "users",
  SUBJECTS:      "subjects",
  QUESTIONS:     "questions",
  QUIZZES:       "quizzes",
  QUIZ_RESULTS:  "quiz_results",
  TUTOR_SESSIONS:"tutor_sessions",
  EXAMS:         "exams",
  PROGRESS:      "daily_progress",
  LEADERBOARD:   "leaderboard",
} as const;

// ============================================
// USER
// ============================================
export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function updateUser(uid: string, data: Partial<User>) {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    ...data,
    lastActive: serverTimestamp(),
  });
}

export async function addXP(uid: string, xp: number) {
  const user = await getUser(uid);
  if (!user) return;
  const newXP = user.xp + xp;
  const newLevel = Math.floor(newXP / 1000) + 1;
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    xp: newXP,
    level: newLevel,
  });
  return { newXP, newLevel, leveledUp: newLevel > user.level };
}

// ============================================
// SUBJECTS
// ============================================
export async function getSubjects(): Promise<Subject[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.SUBJECTS));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
}

export async function getSubject(id: string): Promise<Subject | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.SUBJECTS, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Subject) : null;
}

// ============================================
// QUESTIONS
// ============================================
export async function getQuestions(
  subjectId: string,
  topicId?: string,
  difficulty?: string,
  count = 10
): Promise<Question[]> {
  let q = query(
    collection(db, COLLECTIONS.QUESTIONS),
    where("subjectId", "==", subjectId),
    limit(count)
  );
  if (topicId)    q = query(q, where("topicId", "==", topicId));
  if (difficulty) q = query(q, where("difficulty", "==", difficulty));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question));
}

export async function createQuestion(data: Omit<Question, "id" | "createdAt" | "stats">) {
  return addDoc(collection(db, COLLECTIONS.QUESTIONS), {
    ...data,
    createdAt: serverTimestamp(),
    stats: { totalAttempts: 0, correctAttempts: 0, avgTimeSeconds: 0, difficulty_rating: 3 },
  });
}

// ============================================
// QUIZZES
// ============================================
export async function getPublicQuizzes(subjectId?: string, count = 20): Promise<Quiz[]> {
  let q = query(
    collection(db, COLLECTIONS.QUIZZES),
    where("isPublic", "==", true),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  if (subjectId) q = query(q, where("subjectId", "==", subjectId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quiz));
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.QUIZZES, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Quiz) : null;
}

export async function createQuiz(data: Omit<Quiz, "id" | "createdAt" | "stats">) {
  return addDoc(collection(db, COLLECTIONS.QUIZZES), {
    ...data,
    createdAt: serverTimestamp(),
    stats: { totalAttempts: 0, avgScore: 0, completionRate: 0 },
  });
}

// ============================================
// QUIZ RESULTS
// ============================================
export async function saveQuizResult(data: Omit<QuizResult, "id">) {
  return addDoc(collection(db, COLLECTIONS.QUIZ_RESULTS), {
    ...data,
    completedAt: serverTimestamp(),
  });
}

export async function getUserResults(uid: string, count = 20): Promise<QuizResult[]> {
  const q = query(
    collection(db, COLLECTIONS.QUIZ_RESULTS),
    where("userId", "==", uid),
    orderBy("completedAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizResult));
}

// ============================================
// TUTOR SESSIONS
// ============================================
export async function getTutorSessions(uid: string): Promise<TutorSession[]> {
  const q = query(
    collection(db, COLLECTIONS.TUTOR_SESSIONS),
    where("userId", "==", uid),
    orderBy("updatedAt", "desc"),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TutorSession));
}

export async function createTutorSession(uid: string, title: string, subjectId?: string) {
  return addDoc(collection(db, COLLECTIONS.TUTOR_SESSIONS), {
    userId: uid,
    title,
    subjectId: subjectId || null,
    messages: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTutorSession(id: string, messages: TutorSession["messages"]) {
  await updateDoc(doc(db, COLLECTIONS.TUTOR_SESSIONS, id), {
    messages,
    updatedAt: serverTimestamp(),
  });
}

// ============================================
// LEADERBOARD
// ============================================
export async function getLeaderboard(period: "weekly" | "alltime" = "weekly", count = 50): Promise<LeaderboardEntry[]> {
  const field = period === "weekly" ? "stats.rankWeekly" : "stats.rankGlobal";
  const q = query(
    collection(db, COLLECTIONS.USERS),
    orderBy("xp", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => {
    const user = d.data() as User;
    return {
      rank: i + 1,
      userId: d.id,
      displayName: user.displayName,
      photoURL: user.photoURL,
      score: user.xp,
      level: user.level,
      badge: user.stats.badges[0],
      change: "same",
    } as LeaderboardEntry;
  });
}

// ============================================
// PROGRESS
// ============================================
export async function saveDailyProgress(uid: string, data: Omit<DailyProgress, "userId">) {
  const id = `${uid}_${data.date}`;
  await setDoc(doc(db, COLLECTIONS.PROGRESS, id), {
    ...data,
    userId: uid,
  }, { merge: true });
}

export async function getWeeklyProgress(uid: string): Promise<DailyProgress[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().split("T")[0];

  const q = query(
    collection(db, COLLECTIONS.PROGRESS),
    where("userId", "==", uid),
    where("date", ">=", dateStr),
    orderBy("date", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DailyProgress);
}
