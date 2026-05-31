// ============================================
// EXAMBOOST AI 2026 — Global Types
// ============================================

import { Timestamp } from "firebase/firestore";

// --- USER ---
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "student" | "teacher" | "admin";
  level: number;
  xp: number;
  streak: number;
  lastActive: Timestamp;
  createdAt: Timestamp;
  stats: UserStats;
  settings: UserSettings;
}

export interface UserStats {
  totalQuizzes: number;
  totalCorrect: number;
  totalWrong: number;
  accuracy: number;         // percentage 0–100
  avgScore: number;
  bestScore: number;
  totalStudyMinutes: number;
  badges: Badge[];
  rankGlobal: number;
  rankWeekly: number;
}

export interface UserSettings {
  theme: "dark" | "light" | "system";
  language: "id" | "en";
  notifications: boolean;
  soundEffects: boolean;
  timerEnabled: boolean;
}

// --- BADGE / ACHIEVEMENT ---
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Timestamp;
  rarity: "common" | "rare" | "epic" | "legendary";
}

// --- SUBJECT ---
export interface Subject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  totalTopics: number;
  difficulty: "SD" | "SMP" | "SMA" | "Universitas" | "Umum";
  createdAt: Timestamp;
}

// --- QUESTION ---
export type QuestionType = "multiple_choice" | "true_false" | "essay" | "fill_blank";
export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface Question {
  id: string;
  subjectId: string;
  topicId: string;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  options?: string[];           // for multiple_choice
  correctAnswer: string | number; // index or string
  explanation: string;
  hints: string[];
  imageUrl?: string;
  tags: string[];
  aiGenerated: boolean;
  createdBy: string;            // uid or "ai"
  createdAt: Timestamp;
  stats: QuestionStats;
}

export interface QuestionStats {
  totalAttempts: number;
  correctAttempts: number;
  avgTimeSeconds: number;
  difficulty_rating: number;    // 1–5 from user feedback
}

// --- QUIZ ---
export type QuizMode = "practice" | "timed" | "exam" | "ai_adaptive" | "challenge";

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  topicIds: string[];
  mode: QuizMode;
  difficulty: Difficulty;
  questionCount: number;
  questionIds: string[];
  timeLimitSeconds?: number;
  passingScore: number;         // percentage
  isPublic: boolean;
  createdBy: string;
  createdAt: Timestamp;
  stats: QuizStats;
}

export interface QuizStats {
  totalAttempts: number;
  avgScore: number;
  completionRate: number;
}

// --- QUIZ SESSION (in progress) ---
export interface QuizSession {
  id: string;
  userId: string;
  quizId: string;
  mode: QuizMode;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string | number>;  // questionId → answer
  startedAt: Timestamp;
  timeRemainingSeconds?: number;
  status: "in_progress" | "completed" | "abandoned";
}

// --- QUIZ RESULT ---
export interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  subjectId: string;
  answers: AnswerRecord[];
  score: number;              // percentage
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeTakenSeconds: number;
  xpEarned: number;
  passed: boolean;
  completedAt: Timestamp;
  aiAnalysis?: AIAnalysis;
}

export interface AnswerRecord {
  questionId: string;
  question: string;
  userAnswer: string | number;
  correctAnswer: string | number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  explanation: string;
}

// --- AI ANALYSIS ---
export interface AIAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  studyPlan: StudyPlanItem[];
  generatedAt: Timestamp;
}

export interface StudyPlanItem {
  topic: string;
  priority: "high" | "medium" | "low";
  estimatedMinutes: number;
  resources: string[];
}

// --- AI TUTOR ---
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Timestamp;
  subjectId?: string;
  attachments?: MessageAttachment[];
  isLoading?: boolean;
}

export interface MessageAttachment {
  type: "image" | "question" | "quiz";
  url?: string;
  data?: Question | Quiz;
}

export interface TutorSession {
  id: string;
  userId: string;
  title: string;
  subjectId?: string;
  messages: ChatMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// --- EXAM ---
export interface Exam {
  id: string;
  title: string;
  description: string;
  type: "UTBK" | "UN" | "SNBT" | "Custom" | "Midterm" | "Final";
  subjectIds: string[];
  totalQuestions: number;
  timeLimitMinutes: number;
  passingScore: number;
  instructions: string[];
  isPublic: boolean;
  scheduledAt?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
}

// --- LEADERBOARD ---
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  photoURL?: string;
  score: number;
  level: number;
  badge?: Badge;
  change: "up" | "down" | "same" | "new";
}

// --- PROGRESS ---
export interface DailyProgress {
  date: string;               // YYYY-MM-DD
  userId: string;
  xpEarned: number;
  quizzesCompleted: number;
  minutesStudied: number;
  accuracy: number;
  streak: number;
}

export interface TopicMastery {
  topicId: string;
  topicName: string;
  subjectId: string;
  mastery: number;            // 0–100
  lastPracticed: Timestamp;
  totalAttempts: number;
  accuracy: number;
}

// --- API RESPONSES ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateQuizRequest {
  subjectId: string;
  topic: string;
  difficulty: Difficulty;
  count: number;
  type?: QuestionType;
  context?: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  subjectId?: string;
  history?: { role: "user" | "model"; parts: string[] }[];
}
