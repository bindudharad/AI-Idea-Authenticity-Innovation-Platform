"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
};

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const isSmallViewport = window.innerWidth < 768;

    if (prefersReducedMotion || deviceMemory < 4 || isSmallViewport) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const particles: Particle[] = [];
    const mouse = { x: 0, y: 0 };
    let raf = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const seedParticles = () => {
      particles.length = 0;
      const count = Math.min(22, Math.max(12, Math.floor(window.innerWidth / 88)));
      for (let index = 0; index < count; index += 1) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.4 + 0.8,
          speedX: (Math.random() - 0.5) * 0.1,
          speedY: (Math.random() - 0.5) * 0.1,
          opacity: Math.random() * 0.22 + 0.08,
        });
      }
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.speedX + (mouse.x - canvas.width / 2) * 0.0000015 * (index % 3 === 0 ? 1 : 0.6);
        particle.y += particle.speedY + (mouse.y - canvas.height / 2) * 0.0000015 * (index % 2 === 0 ? 1 : 0.6);

        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;

        const gradient = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 18);
        gradient.addColorStop(0, `rgba(103,232,249,${particle.opacity})`);
        gradient.addColorStop(0.5, `rgba(59,130,246,${particle.opacity * 0.42})`);
        gradient.addColorStop(1, "rgba(15,23,42,0)");

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * 9, 0, Math.PI * 2);
        context.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    resize();
    seedParticles();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[1] opacity-70" />;
}
