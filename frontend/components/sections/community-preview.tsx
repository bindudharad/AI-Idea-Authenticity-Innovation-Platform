"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lightbulb, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { Card } from "@/ui/card";

const communityIdeas = [
  {
    id: 1,
    title: "AI Climate Insight Engine",
    description: "Real-time climate pattern analysis using neural networks to predict environmental changes.",
    category: "AI",
    innovationScore: 88,
    author: "ClimateAI Team",
  },
  {
    id: 2,
    title: "BioSignal Coach",
    description: "Wearable biometrics for athletic optimization and performance enhancement.",
    category: "HealthTech",
    innovationScore: 84,
    author: "FitTech Labs",
  },
  {
    id: 3,
    title: "Founder Due Diligence Copilot",
    description: "AI-powered startup evaluation platform for investors and accelerators.",
    category: "FinTech",
    innovationScore: 81,
    author: "VentureAI",
  },
];

export function CommunityPreview() {
  return (
    <section className="section-shell py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-cyan-400" />
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-400">
            Community Showcase
          </p>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Explore Innovation from the Community
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Discover groundbreaking ideas shared by innovators worldwide. Get inspired and collaborate.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {communityIdeas.map((idea, index) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <Card className="h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Lightbulb className="h-5 w-5 text-cyan-400" />
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                  {idea.category}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                {idea.title}
              </h3>
              <p className="text-sm text-slate-400 mb-4 flex-1">
                {idea.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-slate-300">
                    Innovation: {idea.innovationScore}%
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  by {idea.author}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mt-10"
      >
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          View All Community Ideas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}
