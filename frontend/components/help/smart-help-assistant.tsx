"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, HelpCircle, Lightbulb, MessageCircle, Send, Sparkles, X } from "lucide-react";

import { helpChat } from "@/services/help-service";
import { Button } from "@/ui/button";

type HelpMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedPages?: string[];
};

const STORAGE_KEY = "idea_platform_help_history";
const QUICK_SUGGESTIONS = [
  "How does idea analysis work?",
  "What is innovation score?",
  "How to improve my idea?",
  "How to generate startup blueprint?",
  "How to check similar ideas?",
];

function readHistory(): HelpMessage[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as HelpMessage[];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function writeHistory(messages: HelpMessage[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
}

export function SmartHelpAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const history = readHistory();
    setMessages(
      history.length > 0
        ? history
        : [
            {
              id: "welcome",
              role: "assistant",
              content: "Hi, I can help you understand this platform, its modules, and where to use each feature.",
              suggestedPages: ["/dashboard", "/analyze"],
            },
          ],
    );
  }, []);

  useEffect(() => {
    writeHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const canSend = useMemo(() => input.trim().length > 1 && !loading, [input, loading]);

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message || loading) {
      return;
    }

    const userMessage: HelpMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await helpChat({ message });
      const assistantMessage: HelpMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        suggestedPages: response.suggested_pages,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          content: "I'm having trouble reaching support right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[70]">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="assistant-orb holographic-panel glass-reflection relative flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(34,211,238,0.92),rgba(59,130,246,0.92),rgba(139,92,246,0.86))] text-white transition duration-300 hover:scale-[1.04] active:scale-[0.97]"
          aria-label="Open Smart Help Assistant"
          data-cursor="interactive"
        >
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_48%)]" />
          {open ? <X className="relative z-10 h-6 w-6" /> : <HelpCircle className="relative z-10 h-6 w-6" />}
        </button>
      </div>

      {open ? (
        <div className="holographic-panel glass-reflection fixed bottom-24 right-6 z-[70] w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-white/10 bg-[#041120]/92 shadow-[0_30px_80px_rgba(2,6,23,0.7)] backdrop-blur-xl">
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(34,211,238,0.04))] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AI Assistant</p>
                  <p className="text-xs text-slate-400">Project-only support</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <AssistantChip icon={Sparkles} label="AI Insight" />
                <AssistantChip icon={Lightbulb} label="Next step" />
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 px-4 py-4">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-500">Quick suggestions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void sendMessage(suggestion)}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/[0.08]"
                  data-cursor="interactive"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div ref={listRef} className="max-h-[360px] space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-[22px] px-4 py-3 text-sm leading-7 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_12px_30px_rgba(34,211,238,0.24)]"
                      : "holographic-panel border border-white/10 bg-white/[0.05] text-slate-200"
                  }`}
                >
                  <p>{message.content}</p>
                  {message.suggestedPages?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestedPages.map((page) => (
                        <Link
                          key={`${message.id}-${page}`}
                          href={page}
                          className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-200 transition hover:border-cyan-400/30"
                          data-cursor="interactive"
                        >
                          Go to {page.replace("/", "") || "home"}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="holographic-panel rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-300">
                  AI is typing...
                </div>
              </div>
            ) : null}
          </div>

          <form
            className="flex items-center gap-3 border-t border-white/10 px-4 py-4"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about analysis, score, blueprint, workspace..."
              className="flex-1 rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
            />
            <Button type="submit" disabled={!canSend} className="h-11 w-11 rounded-full px-0 py-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : null}
    </>
  );
}

function AssistantChip({
  icon: Icon,
  label,
}: {
  icon: typeof MessageCircle;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
      <Icon className="h-3 w-3 text-cyan-300" />
      {label}
    </span>
  );
}
