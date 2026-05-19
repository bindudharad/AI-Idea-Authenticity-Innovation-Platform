"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { memo, useEffect, useState } from "react";

const RevealOnScroll = dynamic(() => import("@/components/motion/reveal-on-scroll").then((mod) => mod.RevealOnScroll), {
  ssr: false,
});
const TiltCard = dynamic(() => import("@/components/TiltCard").then((mod) => mod.TiltCard), {
  ssr: false,
});

const teamCards = [
  {
    title: "TEAM_VORTEX",
    image: "/team/team_vortex.webp",
    subtitle: "AI-powered innovation builders",
    description: "A focused product team shaping intelligent workflows, decision systems, and premium startup tooling.",
  },
  {
    title: "Innovation Lab",
    image: "/team/innovation_lab.webp",
    subtitle: "AI-powered market intelligence & strategy system",
    description: "Real-time data analysis, competitive intelligence, and AI-driven business insights combined in one smart lab environment.",
    tag: "LIVE SYSTEM",
  },
  {
    title: "Advanced Features",
    image: "/team/advanced_features.webp",
    subtitle: "Intelligent systems powering next-gen decisions",
    features: [
      "AI Decision Engine",
      "Real-time Market Signals",
      "Smart Risk Prediction",
      "Automated Strategy Builder",
      "Investor Match AI",
      "Location Profit Heatmap",
    ],
    badge: "NEW",
  },
] as const;

function TeamSectionComponent() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8 lg:px-10">
      <RevealOnScroll delayMs={100}>
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">Meet our team</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">TEAM_VORTEX</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {teamCards.map((item) => (
            <TiltCard
              key={item.title}
              className="premium-card glass-card holographic-panel glass-reflection relative rounded-[28px] border border-cyan-300/10 bg-white/[0.03] p-6 text-center transition-all duration-300 hover:scale-[1.03] hover:border-cyan-300/18 hover:shadow-[0_0_28px_rgba(0,255,255,0.14)]"
            >
              {"badge" in item && item.badge ? (
                <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#020617] shadow-[0_0_18px_rgba(34,211,238,0.32)]">
                  {item.badge}
                </span>
              ) : null}
              <div className="image-card mb-5 min-h-[170px] rounded-[22px] border border-white/10 bg-white/[0.02] p-4 transition duration-300 hover:scale-[1.02]">
                <TeamCardImage src={item.image} alt={item.title} />
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-cyan-300">{item.subtitle}</p>
              {"description" in item && item.description ? <p className="mt-3 text-sm leading-7 text-slate-400">{item.description}</p> : null}
              {"tag" in item && item.tag ? <span className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{item.tag}</span> : null}
              {"features" in item && item.features ? (
                <ul className="mt-4 space-y-2 text-left text-[13px] text-[#9fdcff]">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-[2px] text-cyan-300">&#10003;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </TiltCard>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}

function TeamCardImage({ src, alt }: { src: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setLoaded(false);
  }, [src]);

  return (
    <div className="relative mx-auto h-[160px] w-full max-w-[360px] translate-z-0">
      {!loaded ? <div className="absolute inset-0 rounded-xl bg-gray-800/70 transition-opacity duration-300" /> : null}
      <Image
        src={imageSrc}
        alt={alt}
        fill
        loading="lazy"
        sizes="(max-width: 768px) 80vw, 360px"
        className={`object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          console.error("Image failed:", imageSrc);
          setImageSrc("/team/team_vortex.webp");
        }}
      />
    </div>
  );
}

export const TeamSection = memo(TeamSectionComponent);
