"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CertificateView } from "@/components/CertificateView";
import { CertificateRecord } from "@/types/api";

type RevealStage = "scan" | "success" | "certificate";

export function CertificateReveal({
  certificate,
  open,
  onComplete,
}: {
  certificate: CertificateRecord;
  open: boolean;
  onComplete?: () => void;
}) {
  const [stage, setStage] = useState<RevealStage>("scan");

  const message = useMemo(() => {
    if (stage === "scan") {
      return "Analyzing innovation authenticity...";
    }
    if (stage === "success") {
      return "Congratulations! Your idea achieved 90%+ originality.";
    }
    return "Official certificate unlocked.";
  }, [stage]);

  useEffect(() => {
    if (!open) {
      setStage("scan");
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => {
        if (!cancelled) {
          setStage("success");
        }
      }, 1200),
    );

    timers.push(
      setTimeout(() => {
        if (!cancelled) {
          void fireConfetti();
        }
      }, 2000),
    );

    timers.push(
      setTimeout(() => {
        if (!cancelled) {
          setStage("certificate");
        }
      }, 2400),
    );

    timers.push(
      setTimeout(() => {
        if (!cancelled) {
          onComplete?.();
        }
      }, 3400),
    );

    return () => {
      cancelled = true;
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [open, onComplete]);

  return (
    <AnimatePresence mode="wait">
      {open ? (
        <motion.div
          key="certificate-reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(10,16,29,0.95),rgba(17,27,47,0.9))] px-6 py-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
          >
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="text-lg font-medium text-white md:text-2xl"
            >
              {message}
            </motion.p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              The platform is verifying your record-grade originality before issuing the official certificate.
            </p>
          </motion.div>

          <AnimatePresence>
            {stage === "certificate" ? (
              <motion.div
                key="revealed-certificate"
                initial={{ opacity: 0, y: -80, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.65, type: "spring", bounce: 0.28 }}
              >
                <CertificateView certificate={certificate} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

async function fireConfetti() {
  const confettiModule = await import("canvas-confetti");
  const confetti = confettiModule.default;

  confetti({
    particleCount: 130,
    spread: 90,
    startVelocity: 42,
    scalar: 0.95,
    origin: { y: 0.2 },
    colors: ["#d3b068", "#6af0a6", "#ffffff", "#52c7ff"],
  });

  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 34,
    origin: { x: 0.2, y: 0.35 },
    colors: ["#d3b068", "#6af0a6", "#ffffff"],
  });

  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 34,
    origin: { x: 0.8, y: 0.35 },
    colors: ["#d3b068", "#6af0a6", "#ffffff"],
  });
}
