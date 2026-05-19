"use client";

import { motion } from "framer-motion";
import { Shield, Users, FileText } from "lucide-react";
import { Card } from "@/ui/card";

const pillars = [
  {
    title: "Private by default",
    description: "Ideas remain private until intentionally shared to the community explorer.",
    icon: Shield,
  },
  {
    title: "Dual platform modes",
    description: "Switch between hackathon and business context for sharper validation.",
    icon: Users,
  },
  {
    title: "Actionable outcomes",
    description: "Every analysis ships with suggestions, startup insight, and build recommendations.",
    icon: FileText,
  },
];

export function TrustSection() {
  return (
    <section className="section-shell py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-400 mb-4">
          Platform Philosophy
        </p>
        <h2 className="text-3xl font-bold text-white">
          Built for innovators, by innovators
        </h2>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <Card className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <pillar.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {pillar.title}
                </p>
              </div>
              <p className="mt-2 text-base leading-7 text-slate-200">
                {pillar.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
