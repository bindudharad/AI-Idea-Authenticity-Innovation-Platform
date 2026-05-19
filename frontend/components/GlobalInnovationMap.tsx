"use client";

import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { motion } from "framer-motion";

export type GlobalInnovationMarker = {
  country: string;
  innovationCount: number;
  coordinates: [number, number];
  patents?: number;
  research?: number;
  startups?: number;
};

type GlobalInnovationMapProps = {
  markers: GlobalInnovationMarker[];
};

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function GlobalInnovationMap({ markers }: GlobalInnovationMapProps) {
  const [active, setActive] = useState<GlobalInnovationMarker | null>(null);

  const sortedMarkers = useMemo(
    () => markers.slice().sort((a, b) => b.innovationCount - a.innovationCount),
    [markers],
  );

  const lowActivityRegions = sortedMarkers.filter((item) => item.innovationCount <= 4);

  return (
    <div className="relative rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#07101f]">
        <ComposableMap projectionConfig={{ scale: 150 }} className="h-[420px] w-full">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#0b1628"
                  stroke="rgba(148,163,184,0.2)"
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#15253f", outline: "none" },
                    pressed: { fill: "#1f2b45", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {sortedMarkers.map((marker) => {
            const size = Math.min(18, 6 + marker.innovationCount * 1.4);
            const color =
              marker.innovationCount >= 9 ? "#f87171" : marker.innovationCount >= 6 ? "#fb923c" : "#4ade80";
            return (
              <Marker
                key={marker.country}
                coordinates={marker.coordinates}
                onClick={() => setActive(marker)}
                onMouseEnter={() => setActive(marker)}
                onMouseLeave={() => setActive(null)}
              >
                <motion.circle
                  r={size / 2}
                  fill={color}
                  className="opacity-90"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 0.9, scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.circle
                  r={size}
                  fill={color}
                  opacity={0.2}
                  animate={{ scale: [0.8, 1.3, 0.8] }}
                  transition={{ duration: 2.8, repeat: Infinity }}
                />
              </Marker>
            );
          })}
        </ComposableMap>
        {active ? (
          <div className="absolute left-6 top-6 rounded-[18px] border border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-slate-200 shadow-[0_0_24px_rgba(56,189,248,0.4)]">
            <p className="text-sm font-semibold text-white">{active.country}</p>
            <p className="mt-1">Innovation Activity: {active.innovationCount}</p>
            <p>Patents Found: {active.patents ?? Math.max(1, Math.round(active.innovationCount * 0.6))}</p>
            <p>Research Papers: {active.research ?? Math.max(1, Math.round(active.innovationCount * 0.3))}</p>
            <p>Startups: {active.startups ?? Math.max(1, Math.round(active.innovationCount * 0.1))}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
        <p className="text-sm leading-7 text-slate-300">
          Most related innovations appear in regions with dense research and startup activity. Use the markers to spot
          geographical momentum and whitespace opportunities.
        </p>
        <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          Innovation Opportunity Region: {lowActivityRegions.length > 0 ? lowActivityRegions[0].country : "Emerging markets"}
        </div>
      </div>
    </div>
  );
}
