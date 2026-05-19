"use client";

import { useEffect, useRef } from "react";

export function ParallaxDepthLayers() {
  const layerOneRef = useRef<HTMLDivElement | null>(null);
  const layerTwoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const layerOne = layerOneRef.current;
    const layerTwo = layerTwoRef.current;

    if (!layerOne || !layerTwo) {
      return;
    }

    let raf = 0;
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;

    const render = () => {
      currentX += (pointerX - currentX) * 0.08;
      currentY += (pointerY - currentY) * 0.08;

      layerOne.style.transform = `translate3d(${currentX * 20}px, ${currentY * 20}px, 0)`;
      layerTwo.style.transform = `translate3d(${currentX * -20}px, ${currentY * -20}px, 0)`;

      raf = requestAnimationFrame(render);
    };

    const handleMove = (event: MouseEvent) => {
      pointerX = event.clientX / window.innerWidth - 0.5;
      pointerY = event.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <>
      <div ref={layerOneRef} className="bg-layer-1 pointer-events-none fixed inset-0 z-0" />
      <div ref={layerTwoRef} className="bg-layer-2 pointer-events-none fixed inset-0 z-0" />
    </>
  );
}
