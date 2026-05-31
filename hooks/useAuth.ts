// hooks/useAuth.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { onAuthChange, signInWithGoogle, signInWithGithub, signUpWithEmail, signInWithEmail, logOut } from "@/lib/firebase/auth";
import { getUser, updateUser } from "@/lib/firebase/firestore";
import type { User } from "@/types";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      if (fbUser) {
        const userData = await getUser(fbUser.uid);
        setState({ firebaseUser: fbUser, user: userData, loading: false, error: null });
      } else {
        setState({ firebaseUser: null, user: null, loading: false, error: null });
      }
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, []);

  const loginWithGithub = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await signInWithGithub();
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await signInWithEmail(email, password);
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, []);

  const registerWithEmail = useCallback(async (email: string, password: string, name: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await signUpWithEmail(email, password, name);
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, []);

  const logout = useCallback(async () => {
    await logOut();
    setState({ firebaseUser: null, user: null, loading: false, error: null });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.firebaseUser) return;
    const userData = await getUser(state.firebaseUser.uid);
    setState((s) => ({ ...s, user: userData }));
  }, [state.firebaseUser]);

  return {
    ...state,
    isAuthenticated: !!state.firebaseUser,
    loginWithGoogle,
    loginWithGithub,
    loginWithEmail,
    registerWithEmail,
    logout,
    refreshUser,
  };
}
