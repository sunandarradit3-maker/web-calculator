// app/(dashboard)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, FileText, Bot, Trophy,
  TrendingUp, Settings, LogOut, Zap, Menu, X, ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn, xpProgress, xpToLevel, xpForNextLevel, getInitials } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/quiz",         label: "Quiz",          icon: BookOpen },
  { href: "/exam",         label: "Ujian",         icon: FileText },
  { href: "/tutor",        label: "AI Tutor",      icon: Bot },
  { href: "/leaderboard",  label: "Leaderboard",   icon: Trophy },
  { href: "/progress",     label: "Progres",       icon: TrendingUp },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand animate-pulse-glow" />
          <p className="text-white/40 text-sm animate-pulse">Memuat...</p>
        </div>
      </div>
    );
  }

  const level = xpToLevel(user.xp);
  const progress = xpProgress(user.xp);
  const nextLevelXP = xpForNextLevel(user.xp);

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-surface-secondary border-r border-white/[0.06] z-50 flex flex-col",
          "lg:relative lg:translate-x-0 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white gradient-brand-text">ExamBoost</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-ghost p-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User card */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="glass-card p-3 flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-glow-sm">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                getInitials(user.displayName)
              )}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center text-[10px] font-bold text-brand-400">
                {level}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
              <div className="mt-1">
                <div className="flex justify-between text-[10px] text-white/40 mb-0.5">
                  <span>{user.xp} XP</span>
                  <span>{nextLevelXP} XP</span>
                </div>
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-brand rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Streak */}
          {user.streak > 0 && (
            <div className="mt-2 flex items-center gap-1.5 px-2">
              <span className="text-orange-400 text-sm">🔥</span>
              <span className="text-xs text-white/60">{user.streak} hari streak</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
                    : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive && "text-brand-400")} />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/[0.06] space-y-0.5">
          <Link href="/settings" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.05] transition-all")}>
            <Settings className="w-4 h-4" />
            Pengaturan
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.08] transition-all"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-1.5">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-brand flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm gradient-brand-text">ExamBoost</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
          }
  
