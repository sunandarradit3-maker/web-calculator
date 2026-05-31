// app/(dashboard)/tutor/page.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Sparkles, RefreshCcw, Copy, Check, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { cn, formatTimestamp } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  loading?: boolean;
}

const STARTER_PROMPTS = [
  "Jelaskan hukum Newton dengan contoh sehari-hari 🔭",
  "Apa itu integral dan bagaimana cara menghitungnya? 📐",
  "Bantu saya memahami sistem tata surya 🌍",
  "Apa perbedaan sel hewan dan sel tumbuhan? 🔬",
  "Jelaskan Perang Dunia II secara singkat 📚",
  "Cara menghitung persamaan kuadrat? ✏️",
];

export default function TutorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildHistory = (msgs: Message[]) =>
    msgs
      .filter((m) => !m.loading)
      .map((m) => ({ role: m.role === "user" ? "user" : "model" as const, parts: [m.content] }));

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    const aiMsg: Message = {
      id: `a_${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
    setStreaming(true);

    abortRef.current = new AbortController();

    try {
      const history = buildHistory([...messages, userMsg]);
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("Gagal menghubungi AI");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const { text: t } = JSON.parse(data);
            accumulated += t;
            setMessages((prev) =>
              prev.map((m) => m.id === aiMsg.id ? { ...m, content: accumulated, loading: false } : m)
            );
          } catch { /* ignore */ }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) => m.id === aiMsg.id
            ? { ...m, content: "Maaf, terjadi kesalahan. Coba lagi ya! 😅", loading: false }
            : m
          )
        );
      }
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming]);

  const handleSubmit = () => sendMessage(input);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStreaming(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">AI Tutor</h1>
            <p className="text-[11px] text-white/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Online · Gemini 1.5 Pro
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-ghost text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Chat Baru
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 space-y-4 no-scrollbar">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center mb-4 animate-float">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">ExamBoost AI Tutor</h2>
            <p className="text-white/40 text-sm max-w-xs mb-8">
              Tanya apapun tentang pelajaran. Saya siap membantu belajar kamu! 🚀
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-left text-xs text-white/60 hover:text-white px-3 py-2.5 rounded-xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-150"
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn("flex gap-3 group", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={cn("max-w-[80%]", msg.role === "user" ? "items-end" : "items-start", "flex flex-col gap-1")}>
                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-brand-500/80 text-white rounded-br-sm"
                      : "glass-card text-white/90 rounded-bl-sm"
                  )}
                >
                  {msg.loading ? (
                    <div className="flex gap-1 py-1">
                      {[0,1,2].map((j) => (
                        <motion.div
                          key={j}
                          className="w-2 h-2 rounded-full bg-white/40"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, delay: j * 0.15, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  ) : (
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-pre:bg-white/[0.08] prose-code:text-cyan-300">
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>

                {/* Copy button */}
                {!msg.loading && msg.role === "assistant" && (
                  <button
                    onClick={() => copyMessage(msg.id, msg.content)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity btn-ghost py-1 px-2 text-[10px] gap-1"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedId === msg.id ? "Disalin!" : "Salin"}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 lg:px-6 py-4 border-t border-white/[0.06] flex-shrink-0">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya apapun tentang pelajaran... (Enter untuk kirim)"
              rows={1}
              className="input-field resize-none min-h-[48px] max-h-32 pr-4 py-3 leading-relaxed"
              style={{ height: "auto" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 128) + "px";
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || streaming}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0",
              input.trim() && !streaming
                ? "bg-brand-500 hover:bg-brand-400 shadow-glow active:scale-95"
                : "bg-white/[0.06] cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-[10px] text-white/20 text-center mt-2">
          AI dapat membuat kesalahan. Verifikasi jawaban penting ke sumber terpercaya.
        </p>
      </div>
    </div>
  );
      }
