"use client";

import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

import { InnovationMapDatum } from "@/types/api";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function InnovationMap({ data }: { data: InnovationMapDatum[] }) {
  const [hovered, setHovered] = useState<InnovationMapDatum | null>(null);

  const maxCount = useMemo(() => Math.max(...data.map((item) => item.count), 1), [data]);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(82,199,255,0.08),transparent_24%),linear-gradient(135deg,rgba(9,16,29,0.98),rgba(12,19,33,0.94))] p-4">
      <div className="h-[520px] w-full">
        <ComposableMap projectionConfig={{ scale: 150 }} style={{ width: "100%", height: "100%" }}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: "#111c2f",
                      stroke: "rgba(255,255,255,0.08)",
                      strokeWidth: 0.6,
                      outline: "none",
                    },
                    hover: {
                      fill: "#17304d",
                      stroke: "rgba(82,199,255,0.28)",
                      strokeWidth: 0.8,
                      outline: "none",
                    },
                    pressed: {
                      fill: "#17304d",
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>

          {data.map((entry) => {
            const radius = 5 + (entry.count / maxCount) * 14;
            return (
              <Marker
                key={entry.country}
                coordinates={[entry.longitude, entry.latitude]}
                onMouseEnter={() => setHovered(entry)}
                onMouseLeave={() => setHovered(null)}
              >
                <g>
                  <circle r={radius * 1.7} fill="rgba(82,199,255,0.10)" />
                  <circle r={radius * 1.2} fill="rgba(82,199,255,0.18)" />
                  <circle r={radius} fill="#52c7ff" stroke="rgba(255,255,255,0.55)" strokeWidth={1.2} />
                </g>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {data.map((entry) => (
          <button
            key={entry.country}
            type="button"
            onMouseEnter={() => setHovered(entry)}
            onMouseLeave={() => setHovered(null)}
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-200 transition hover:bg-white/[0.08]"
          >
            {entry.countryName}: {entry.count}
          </button>
        ))}
      </div>

      {hovered ? (
        <div className="pointer-events-none absolute right-4 top-4 min-w-[180px] rounded-[22px] border border-sky-400/20 bg-slate-950/90 px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <p className="text-sm font-semibold text-white">{hovered.countryName}</p>
          <div className="mt-3 space-y-1 text-sm text-slate-300">
            <p>Patents: {hovered.patents}</p>
            <p>Repositories: {hovered.repositories}</p>
            <p>Technologies: {hovered.technologies}</p>
            <p>Total signals: {hovered.count}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
