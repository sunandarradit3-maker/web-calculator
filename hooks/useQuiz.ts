// hooks/useQuiz.ts
"use client";

import { useState, useCallback, useRef } from "react";
import type { Question, QuizSession, QuizResult, AnswerRecord } from "@/types";
import { saveQuizResult } from "@/lib/firebase/firestore";
import { addXP, calculateXPReward } from "@/lib/utils";

interface QuizState {
  session: QuizSession | null;
  status: "idle" | "in_progress" | "completed";
  timeElapsed: number;
  isSubmitting: boolean;
}

export function useQuiz(userId: string) {
  const [state, setState] = useState<QuizState>({
    session: null,
    status: "idle",
    timeElapsed: 0,
    isSubmitting: false,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startQuiz = useCallback((
    quizId: string,
    questions: Question[],
    mode: QuizSession["mode"],
    timeLimitSeconds?: number
  ) => {
    startTimeRef.current = Date.now();

    const session: QuizSession = {
      id: `session_${Date.now()}`,
      userId,
      quizId,
      mode,
      questions,
      currentIndex: 0,
      answers: {},
      startedAt: new Date() as any,
      timeRemainingSeconds: timeLimitSeconds,
      status: "in_progress",
    };

    setState({ session, status: "in_progress", timeElapsed: 0, isSubmitting: false });

    // Start timer
    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev.session) return prev;
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

        // Countdown timer
        if (timeLimitSeconds) {
          const remaining = timeLimitSeconds - elapsed;
          if (remaining <= 0) {
            clearInterval(timerRef.current!);
            return {
              ...prev,
              timeElapsed: elapsed,
              session: { ...prev.session, timeRemainingSeconds: 0 },
            };
          }
          return {
            ...prev,
            timeElapsed: elapsed,
            session: { ...prev.session, timeRemainingSeconds: remaining },
          };
        }

        return { ...prev, timeElapsed: elapsed };
      });
    }, 1000);
  }, [userId]);

  const answerQuestion = useCallback((questionId: string, answer: string | number) => {
    setState((prev) => {
      if (!prev.session) return prev;
      return {
        ...prev,
        session: {
          ...prev.session,
          answers: { ...prev.session.answers, [questionId]: answer },
        },
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (!prev.session) return prev;
      const next = prev.session.currentIndex + 1;
      if (next >= prev.session.questions.length) return prev;
      return { ...prev, session: { ...prev.session, currentIndex: next } };
    });
  }, []);

  const prevQuestion = useCallback(() => {
    setState((prev) => {
      if (!prev.session) return prev;
      const prev_idx = prev.session.currentIndex - 1;
      if (prev_idx < 0) return prev;
      return { ...prev, session: { ...prev.session, currentIndex: prev_idx } };
    });
  }, []);

  const submitQuiz = useCallback(async (quizTitle: string, subjectId: string) => {
    const { session } = state;
    if (!session) return null;

    clearInterval(timerRef.current!);
    setState((prev) => ({ ...prev, isSubmitting: true }));

    const answerRecords: AnswerRecord[] = session.questions.map((q) => {
      const userAnswer = session.answers[q.id] ?? "";
      const isCorrect = String(userAnswer) === String(q.correctAnswer);
      return {
        questionId: q.id,
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        timeSpentSeconds: 0,
        explanation: q.explanation,
      };
    });

    const correctCount = answerRecords.filter((a) => a.isCorrect).length;
    const score = Math.round((correctCount / session.questions.length) * 100);
    const xpEarned = calculateXPReward(score, session.questions[0]?.difficulty || "medium", state.timeElapsed, session.timeRemainingSeconds ? session.timeRemainingSeconds + state.timeElapsed : state.timeElapsed);

    const result: Omit<QuizResult, "id"> = {
      userId,
      quizId: session.quizId,
      quizTitle,
      subjectId,
      answers: answerRecords,
      score,
      correctCount,
      wrongCount: session.questions.length - correctCount - 0,
      skippedCount: session.questions.filter((q) => !(q.id in session.answers)).length,
      timeTakenSeconds: state.timeElapsed,
      xpEarned,
      passed: score >= 70,
      completedAt: new Date() as any,
    };

    await saveQuizResult(result);
    await addXP(userId, xpEarned);

    setState((prev) => ({ ...prev, status: "completed", isSubmitting: false }));
    return { ...result, id: `result_${Date.now()}` } as QuizResult;
  }, [state, userId]);

  const resetQuiz = useCallback(() => {
    clearInterval(timerRef.current!);
    setState({ session: null, status: "idle", timeElapsed: 0, isSubmitting: false });
  }, []);

  const currentQuestion = state.session?.questions[state.session.currentIndex] ?? null;
  const currentAnswer = state.session ? state.session.answers[currentQuestion?.id ?? ""] : undefined;
  const progress = state.session ? ((state.session.currentIndex + 1) / state.session.questions.length) * 100 : 0;
  const answeredCount = state.session ? Object.keys(state.session.answers).length : 0;

  return {
    ...state,
    currentQuestion,
    currentAnswer,
    progress,
    answeredCount,
    startQuiz,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    resetQuiz,
  };
}
