"use client";

import { useCallback, useEffect, useRef } from "react";

type TiltOptions = {
  maxTilt?: number;
  scale?: number;
};

export function useTilt<T extends HTMLElement>({ maxTilt = 7, scale = 1.02 }: TiltOptions = {}) {
  const ref = useRef<T | null>(null);
  const frameRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    element.style.setProperty("--pointer-x", "50%");
    element.style.setProperty("--pointer-y", "50%");
    element.style.setProperty("--pointer-opacity", "0");
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<T>) => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const rotateY = ((offsetX / rect.width) * 2 - 1) * maxTilt;
      const rotateX = (1 - (offsetY / rect.height) * 2) * maxTilt;

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = requestAnimationFrame(() => {
        element.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale})`;
        element.style.setProperty("--pointer-x", `${(offsetX / rect.width) * 100}%`);
        element.style.setProperty("--pointer-y", `${(offsetY / rect.height) * 100}%`);
        element.style.setProperty("--pointer-opacity", "1");
      });
    },
    [maxTilt, scale],
  );

  const handlePointerLeave = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    reset();
  }, [reset]);

  const handlePointerEnter = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--pointer-opacity", "0.7");
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return {
    ref,
    handlePointerMove,
    handlePointerLeave,
    handlePointerEnter,
  };
}
