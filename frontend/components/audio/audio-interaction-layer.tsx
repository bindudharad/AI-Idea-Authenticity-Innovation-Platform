"use client";

import { useEffect } from "react";

import { soundManager } from "@/lib/SoundManager";

const INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "input[type='button']",
  "input[type='submit']",
  "[role='button']",
  "[data-cursor='interactive']",
].join(", ");

export function AudioInteractionLayer() {
  useEffect(() => {
    const handlePointerOver = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const interactive = target.closest(INTERACTIVE_SELECTOR);
      if (!interactive) {
        return;
      }

      void soundManager.play("hover");
    };

    const handleClick = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const interactive = target.closest(INTERACTIVE_SELECTOR);
      if (!interactive) {
        return;
      }

      void soundManager.warmup();
      void soundManager.play("click");
    };

    document.addEventListener("pointerover", handlePointerOver, true);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("pointerover", handlePointerOver, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}
