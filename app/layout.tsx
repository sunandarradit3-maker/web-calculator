// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ExamBoost AI 2026", template: "%s | ExamBoost AI" },
  description: "Platform belajar cerdas berbasis AI untuk persiapan ujian — Quiz adaptif, Tutor AI, Analisis performa real-time.",
  keywords: ["belajar online", "quiz AI", "UTBK", "persiapan ujian", "tutor AI", "examboost"],
  authors: [{ name: "ExamBoost AI Team" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "ExamBoost AI",
    title: "ExamBoost AI 2026 — Belajar Lebih Cerdas",
    description: "Platform belajar AI terdepan di Indonesia",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExamBoost AI 2026",
    description: "Platform belajar AI terdepan di Indonesia",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0f13",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans bg-surface text-white antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1c1c26",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
