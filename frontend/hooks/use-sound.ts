"use client";

import { useEffect, useMemo, useState } from "react";

import { soundManager } from "@/lib/SoundManager";

export function useSound() {
  const [state, setState] = useState(soundManager.getState());

  useEffect(() => {
    return soundManager.subscribe(() => {
      setState(soundManager.getState());
    });
  }, []);

  return useMemo(
    () => ({
      ...state,
      warmup: () => soundManager.warmup(),
      toggle: () => soundManager.toggle(),
      setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
      playHover: () => soundManager.play("hover"),
      playClick: () => soundManager.play("click"),
      playSuccess: () => soundManager.play("success"),
      playError: () => soundManager.play("error"),
    }),
    [state],
  );
}
