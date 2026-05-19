"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AudioLines,
  Bot,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  Waves,
  X,
} from "lucide-react";

import { Waveform } from "@/components/voice/Waveform";
import { useSound } from "@/hooks/use-sound";
import { helpChat } from "@/services/help-service";
import { Button } from "@/ui/button";

type VoiceStatus = "idle" | "listening" | "processing" | "speaking" | "unsupported";

const QUICK_PROMPTS = ["Analyze my idea", "Read recommendation", "Market signals", "Funding outlook"];

function pickVoice(voices: SpeechSynthesisVoice[]) {
  const preferred = voices.find((voice) => /en-(IN|US|GB)/i.test(voice.lang) && /female|zira|aria|samantha|google/i.test(voice.name));
  return preferred ?? voices.find((voice) => /en/i.test(voice.lang)) ?? voices[0] ?? null;
}

export function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Standing by. Ask for analysis, market signals, or next-step guidance.");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [bars, setBars] = useState([0.32, 0.58, 0.88, 0.46, 0.7, 0.4, 0.8]);
  const sound = useSound();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speakingRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const isListening = status === "listening";
  const isSpeaking = status === "speaking";

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
      setStatus("unsupported");
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
      setStatus("listening");
      setTranscript("");
      setResponse("Listening. Speak naturally.");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const nextTranscript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      setTranscript(nextTranscript);
    };

    recognition.onerror = () => {
      setStatus("idle");
      setResponse("Microphone link not available. You can still use the quick prompts.");
      void sound.playError();
    };

    recognition.onend = () => {
      if (speakingRef.current) {
        return;
      }

      setStatus((current) => (current === "processing" || current === "speaking" ? current : "idle"));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.removeEventListener?.("voiceschanged", loadVoices);
    };
  }, [sound]);

  useEffect(() => {
    if (!isListening && !isSpeaking) {
      setBars([0.32, 0.58, 0.88, 0.46, 0.7, 0.4, 0.8]);
      return;
    }

    const interval = window.setInterval(() => {
      setBars((current) =>
        current.map((value, index) => {
          const shift = Math.sin((Date.now() / 320) + index) * 0.14;
          const base = isSpeaking ? 0.52 : 0.42;
          return Math.min(1, Math.max(0.18, base + shift + Math.abs(value - 0.5) * 0.18));
        }),
      );
    }, 140);

    return () => window.clearInterval(interval);
  }, [isListening, isSpeaking]);

  const statusLine = useMemo(() => {
    if (status === "unsupported") {
      return "Voice controls need a browser with Web Speech support.";
    }
    if (status === "listening") {
      return "Analyzing your voice input...";
    }
    if (status === "processing") {
      return "Market signals detected. Thinking...";
    }
    if (status === "speaking") {
      return "Delivering AI response...";
    }
    return "Jarvis mode ready. Tap the orb and speak.";
  }, [status]);

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
    utterance.rate = 1;
    utterance.pitch = 1.02;
    utterance.volume = 0.8;

    speakingRef.current = true;
    setStatus("speaking");

    utterance.onend = () => {
      speakingRef.current = false;
      setStatus("idle");
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      setStatus("idle");
    };

    window.speechSynthesis.speak(utterance);
  }

  async function runPrompt(message: string) {
    setTranscript(message);
    setStatus("processing");
    setResponse("Analyzing your request...");

    try {
      const result = await helpChat({ message });
      setResponse(result.answer);
      setStatus(voiceEnabled ? "speaking" : "idle");
      void sound.playSuccess();
      if (voiceEnabled) {
        await speak(result.answer);
      }
    } catch {
      setStatus("idle");
      setResponse("Voice analysis link failed. Please try again in a moment.");
      void sound.playError();
    }
  }

  async function startListening() {
    if (status === "unsupported" || !recognitionRef.current) {
      setOpen(true);
      setResponse("Voice mode is not supported here, but quick prompts are ready.");
      return;
    }

    await sound.warmup();

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      setOpen(true);
      recognitionRef.current.start();
    } catch {
      setResponse("Voice channel already active. Try again in a second.");
    }
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setStatus("idle");
  }

  useEffect(() => {
    if (!transcript || status !== "idle" || !open) {
      return;
    }
  }, [transcript, status, open]);

  useEffect(() => {
    if (!open || !transcript || status !== "idle") {
      return;
    }

    const timeout = window.setTimeout(() => {
      void runPrompt(transcript);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [open, status, transcript]);

  return (
    <>
      <div className="fixed bottom-28 right-6 z-[72] flex flex-col items-end gap-3">
        <div className="pointer-events-none rounded-full border border-cyan-400/15 bg-[#041120]/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80 backdrop-blur-xl">
          Voice AI
        </div>
        <button
          type="button"
          onClick={() => {
            void sound.warmup();
            void sound.playClick();
            if (open) {
              setOpen(false);
              stopListening();
            } else {
              setOpen(true);
            }
          }}
          className="assistant-orb holographic-panel glass-reflection relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(34,211,238,0.9),rgba(59,130,246,0.9),rgba(139,92,246,0.82))] text-white transition duration-300 hover:scale-[1.04] active:scale-[0.97]"
          aria-label="Open voice assistant"
          data-cursor="interactive"
        >
          <span className="absolute inset-[8px] rounded-full border border-white/15 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_48%)]" />
          <AudioLines className="relative z-10 h-7 w-7" />
        </button>
      </div>

      {open ? (
        <div className="holographic-panel glass-reflection fixed bottom-[116px] right-24 z-[72] w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-[30px] border border-white/10 bg-[#041120]/92 shadow-[0_30px_80px_rgba(2,6,23,0.72)] backdrop-blur-xl">
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(34,211,238,0.04))] px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="ai-core-orb flex h-11 w-11 items-center justify-center">
                  <Bot className="h-5 w-5 text-cyan-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AI Voice Assistant</p>
                  <p className="text-xs text-slate-400">{statusLine}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  stopListening();
                }}
                className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Close voice assistant"
                data-cursor="interactive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5">
            <Waveform active={isListening || isSpeaking || status === "processing"} speaking={isSpeaking} bars={bars} />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Voice Input</p>
                <p className="mt-2 min-h-[72px] text-sm leading-6 text-white/90">
                  {transcript || "Say something like “Analyze my idea” or “What should I do next?”"}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">AI Response</p>
                <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-200">{response}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    void sound.playClick();
                    void runPrompt(prompt);
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/[0.08]"
                  data-cursor="interactive"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    void startListening();
                  }
                }}
                className="h-12 px-5"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isListening ? "Stop Listening" : "Start Listening"}
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  setVoiceEnabled((current) => !current);
                  void sound.playClick();
                }}
                className="h-12 px-5"
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Voice {voiceEnabled ? "On" : "Off"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  sound.toggle();
                  void sound.playClick();
                }}
                className="h-12 px-5"
              >
                <Waves className="h-4 w-4" />
                UI Sound {sound.enabled ? "On" : "Off"}
              </Button>
            </div>

            <div className="rounded-[22px] border border-cyan-400/12 bg-cyan-400/8 px-4 py-3 text-xs leading-6 text-slate-300">
              <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-[0.16em] text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
                Assistant tone
              </span>
              <p className="mt-2">
                Short, confident responses. Market signals detected. Opportunity patterns highlighted. Recommended next action, ready.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
