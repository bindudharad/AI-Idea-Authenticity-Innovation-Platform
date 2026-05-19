"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle, Lightbulb, Mic, MicOff, Send, Volume2, VolumeX, X } from "lucide-react";

import { AIAvatar } from "@/components/assistant/AIAvatar";
import { Waveform } from "@/components/voice/Waveform";
import { useSound } from "@/hooks/use-sound";
import { helpChat } from "@/services/help-service";
import { Button } from "@/ui/button";

type HelpMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedPages?: string[];
};

type VoiceStatus = "idle" | "listening" | "processing" | "speaking" | "unsupported";

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

function pickVoice(voices: SpeechSynthesisVoice[]) {
  const preferred = voices.find((voice) => /en-(IN|US|GB)/i.test(voice.lang) && /zira|aria|samantha|google/i.test(voice.name));
  return preferred ?? voices.find((voice) => /en/i.test(voice.lang)) ?? voices[0] ?? null;
}

export function AssistantPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [bars, setBars] = useState([0.32, 0.58, 0.88, 0.46, 0.7, 0.4, 0.8]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const transcriptRef = useRef("");
  const sound = useSound();

  const isListening = voiceStatus === "listening";
  const isSpeaking = voiceStatus === "speaking";
  const canSend = useMemo(() => input.trim().length > 1 && !loading, [input, loading]);

  useEffect(() => {
    const history = readHistory();
    setMessages(
      history.length > 0
        ? history
        : [
            {
              id: "welcome",
              role: "assistant",
              content: "Welcome. I can explain modules, recommend next steps, and answer questions about this platform.",
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

  useEffect(() => {
    if (!isListening && !isSpeaking) {
      setBars([0.32, 0.58, 0.88, 0.46, 0.7, 0.4, 0.8]);
      return;
    }

    const interval = window.setInterval(() => {
      setBars((current) =>
        current.map((value, index) => {
          const shift = Math.sin((Date.now() / 360) + index * 0.7) * 0.12;
          const base = isSpeaking ? 0.48 : 0.38;
          return Math.min(1, Math.max(0.18, base + shift + Math.abs(value - 0.5) * 0.14));
        }),
      );
    }, 160);

    return () => window.clearInterval(interval);
  }, [isListening, isSpeaking]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis?.getVoices?.() ?? [];
    };

    loadVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", loadVoices);

    const RecognitionConstructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!RecognitionConstructor) {
      setVoiceStatus("unsupported");
      return () => {
        window.speechSynthesis?.removeEventListener?.("voiceschanged", loadVoices);
      };
    }

    const recognition = new RecognitionConstructor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      transcriptRef.current = "";
      setVoiceStatus("listening");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      transcriptRef.current = transcript;
      setInput(transcript);
    };

    recognition.onerror = () => {
      setVoiceStatus("idle");
      void sound.playError();
    };

    recognition.onend = () => {
      if (transcriptRef.current.trim()) {
        void sendMessage(transcriptRef.current);
      } else if (voiceStatus !== "unsupported") {
        setVoiceStatus("idle");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.removeEventListener?.("voiceschanged", loadVoices);
    };
  }, [sound, voiceStatus]);

  async function speak(text: string) {
    if (!voiceEnabled || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(voicesRef.current);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.rate = 0.98;
    utterance.pitch = 1;
    utterance.volume = 0.55;

    setVoiceStatus("speaking");

    utterance.onend = () => setVoiceStatus("idle");
    utterance.onerror = () => setVoiceStatus("idle");

    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message || loading) {
      return;
    }

    transcriptRef.current = "";
    const userMessage: HelpMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    setVoiceStatus("processing");

    try {
      const response = await helpChat({ message });
      const assistantMessage: HelpMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        suggestedPages: response.suggested_pages,
      };
      setMessages((current) => [...current, assistantMessage]);
      void sound.playSuccess();
      if (voiceEnabled) {
        await speak(response.answer);
      } else {
        setVoiceStatus("idle");
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          content: "I couldn't complete that request right now. Please try again in a moment.",
        },
      ]);
      setVoiceStatus("idle");
      void sound.playError();
    } finally {
      setLoading(false);
    }
  }

  function startListening() {
    if (!recognitionRef.current || voiceStatus === "unsupported") {
      return;
    }

    void sound.warmup();
    try {
      recognitionRef.current.start();
    } catch {
      setVoiceStatus("idle");
    }
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setVoiceStatus("idle");
  }

  const statusLabel =
    voiceStatus === "unsupported"
      ? "Voice unavailable"
      : voiceStatus === "listening"
        ? "Listening"
        : voiceStatus === "processing"
          ? "Thinking"
          : voiceStatus === "speaking"
            ? "Speaking"
            : "Ready";

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[70]">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="assistant-trigger subtle-panel group relative flex h-14 w-14 items-center justify-center rounded-full border border-white/12 bg-[#08111f]/82 text-white shadow-[0_12px_28px_rgba(2,6,23,0.26)] backdrop-blur-xl transition duration-200 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(34,211,238,0.16)] active:scale-[0.985]"
          aria-label="Open AI assistant"
          title="Ask AI"
          data-cursor="interactive"
        >
          <span className="absolute inset-[3px] rounded-full border border-cyan-200/10" />
          <AIAvatar size="sm" active={open || loading || isListening || isSpeaking} className="border-0 bg-transparent shadow-none" />
          <span className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 rounded-full border border-white/10 bg-[#08111f]/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200 opacity-0 transition-all duration-200 group-hover:translate-x-[-2px] group-hover:opacity-100 sm:block">
            Ask AI
          </span>
        </button>
      </div>

      {open ? (
        <div className="subtle-panel fixed bottom-24 right-6 z-[70] w-[min(396px,calc(100vw-2rem))] overflow-hidden rounded-[28px] border border-white/10 bg-[#08111f]/92 shadow-[0_20px_50px_rgba(2,6,23,0.3)] backdrop-blur-2xl">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <AIAvatar active={loading || isListening || isSpeaking} />
                <div>
                  <p className="text-sm font-semibold text-white">AI Assistant</p>
                  <p className="text-xs text-slate-400">Insights, recommendations, and next steps</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVoiceEnabled((current) => !current);
                    void sound.playClick();
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                  aria-label={voiceEnabled ? "Mute voice responses" : "Enable voice responses"}
                  data-cursor="interactive"
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.toggle();
                    void sound.playClick();
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                  data-cursor="interactive"
                >
                  Sound {sound.enabled ? "On" : "Off"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                  aria-label="Close AI assistant"
                  data-cursor="interactive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-white/10 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Assistant status</p>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                {statusLabel}
              </span>
            </div>
            <Waveform active={isListening || isSpeaking || voiceStatus === "processing"} speaking={isSpeaking} bars={bars} />
          </div>

          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void sendMessage(suggestion)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200 transition hover:border-cyan-200/20 hover:bg-white/[0.06]"
                  data-cursor="interactive"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div ref={listRef} className="max-h-[300px] space-y-4 overflow-y-auto px-5 py-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-[22px] px-4 py-3 text-sm leading-7 ${
                    message.role === "user"
                      ? "bg-[linear-gradient(135deg,rgba(129,212,250,0.94),rgba(96,165,250,0.9))] text-slate-950 shadow-[0_10px_24px_rgba(59,130,246,0.18)]"
                      : "border border-white/10 bg-white/[0.04] text-slate-200"
                  }`}
                >
                  <p>{message.content}</p>
                  {message.suggestedPages?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestedPages.map((page) => (
                        <Link
                          key={`${message.id}-${page}`}
                          href={page}
                          className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-200 transition hover:border-cyan-200/18"
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
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                  Preparing answer...
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 px-5 py-4">
            <div className="mb-3 flex items-center gap-2 text-[11px] text-slate-400">
              <Lightbulb className="h-3.5 w-3.5 text-cyan-200" />
              Minimal outside, powerful inside.
            </div>
            <form
              className="flex items-center gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage(input);
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                data-cursor="interactive"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about analysis, market, blueprint, or next steps"
                className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-200/22"
              />
              <Button type="submit" disabled={!canSend} className="h-11 w-11 rounded-full px-0 py-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
