"use client";

type SoundEvent = "hover" | "click" | "success" | "error";
type SoundSubscriber = () => void;

const STORAGE_KEY = "ai_platform_sound_enabled";

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;
  private initialized = false;
  private hoverCooldownUntil = 0;
  private subscribers = new Set<SoundSubscriber>();

  constructor() {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      this.enabled = stored !== "false";
    }
  }

  private notify() {
    this.subscribers.forEach((subscriber) => subscriber());
  }

  subscribe(subscriber: SoundSubscriber) {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(enabled));
    }
    this.notify();
  }

  toggle() {
    this.setEnabled(!this.enabled);
  }

  private async ensureContext() {
    if (typeof window === "undefined") {
      return null;
    }

    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        return null;
      }
      this.audioContext = new AudioContextClass();
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.initialized = true;
    return this.audioContext;
  }

  async warmup() {
    await this.ensureContext();
  }

  async play(event: SoundEvent) {
    if (!this.enabled) {
      return;
    }

    const now = Date.now();
    if (event === "hover" && now < this.hoverCooldownUntil) {
      return;
    }

    const context = await this.ensureContext();
    if (!context) {
      return;
    }

    if (event === "hover") {
      this.hoverCooldownUntil = now + 120;
    }

    const master = context.createGain();
    master.connect(context.destination);

    const currentTime = context.currentTime;
    master.gain.setValueAtTime(0.0001, currentTime);
    master.gain.exponentialRampToValueAtTime(0.055, currentTime + 0.012);
    master.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.28);

    this.createTone(context, master, event, currentTime);
  }

  private createTone(context: AudioContext, destination: GainNode, event: SoundEvent, startTime: number) {
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    filter.type = "lowpass";
    gain.gain.setValueAtTime(0.0001, startTime);

    const config = {
      hover: { type: "sine" as OscillatorType, freq: [720, 880], duration: 0.16, filter: 1800, gain: 0.03 },
      click: { type: "triangle" as OscillatorType, freq: [240, 420], duration: 0.18, filter: 1400, gain: 0.05 },
      success: { type: "sine" as OscillatorType, freq: [520, 780], duration: 0.34, filter: 2200, gain: 0.045 },
      error: { type: "sawtooth" as OscillatorType, freq: [280, 180], duration: 0.28, filter: 900, gain: 0.035 },
    }[event];

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.freq[0], startTime);
    oscillator.frequency.exponentialRampToValueAtTime(config.freq[1], startTime + config.duration);
    filter.frequency.setValueAtTime(config.filter, startTime);
    gain.gain.exponentialRampToValueAtTime(config.gain, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + config.duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + config.duration + 0.02);
  }

  getState() {
    return {
      enabled: this.enabled,
      initialized: this.initialized,
    };
  }
}

export const soundManager = new SoundManager();
