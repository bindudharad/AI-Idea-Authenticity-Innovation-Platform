"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin, Radar, Sparkles } from "lucide-react";
import clsx from "clsx";

import {
  LOCATION_DATA,
  ProfitZone,
  analyzeLocationProfit,
  findCity,
  getDefaultLocation,
} from "@/lib/location-profit-intelligence";
import { buildApiUrl } from "@/services/api";
import { Card } from "@/ui/card";

declare global {
  interface Window {
    google?: any;
    __googleMapsPromise?: Promise<void>;
  }
}

type AnalysisResponse = {
  center: {
    lat: number;
    lng: number;
  };
  city: string;
  country: string;
  state: string;
  businessType: string;
  zones: ProfitZone[];
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#07111f" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#020617" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#0f2438" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#03111f" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#031525" }] },
];

function getZoneColors(status: ProfitZone["status"]) {
  if (status === "high") {
    return { fill: "#22c55e", stroke: "#86efac", label: "High profit" };
  }
  if (status === "medium") {
    return { fill: "#eab308", stroke: "#fde047", label: "Medium" };
  }
  return { fill: "#ef4444", stroke: "#fca5a5", label: "Avoid first" };
}

function loadGoogleMaps() {
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error("Google Maps API key missing"));
  }

  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (window.__googleMapsPromise) {
    return window.__googleMapsPromise;
  }

  window.__googleMapsPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>("script[data-google-maps='true']");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Google Maps failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

  return window.__googleMapsPromise;
}

export function LocationProfitIntelligence() {
  const defaults = getDefaultLocation();
  const [country, setCountry] = useState(defaults.country);
  const [state, setState] = useState(defaults.state);
  const [city, setCity] = useState(defaults.city);
  const [businessType, setBusinessType] = useState("AI startup");
  const [analysis, setAnalysis] = useState<AnalysisResponse>(() =>
    analyzeLocationProfit({
      country: defaults.country,
      state: defaults.state,
      city: defaults.city,
      businessType: "AI startup",
    }),
  );
  const [selectedZone, setSelectedZone] = useState<ProfitZone | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapAvailable, setMapAvailable] = useState(Boolean(GOOGLE_MAPS_API_KEY));
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const polygonsRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const analysisCacheRef = useRef<Map<string, AnalysisResponse>>(new Map());

  const countryOptions = LOCATION_DATA;
  const selectedCountry = countryOptions.find((item) => item.name === country) ?? countryOptions[0];
  const selectedState = selectedCountry.states.find((item) => item.name === state) ?? selectedCountry.states[0];
  const selectedCity = findCity(country, state, city);

  const zoneCounts = useMemo(
    () => ({
      high: analysis.zones.filter((zone) => zone.status === "high").length,
      medium: analysis.zones.filter((zone) => zone.status === "medium").length,
      low: analysis.zones.filter((zone) => zone.status === "low").length,
    }),
    [analysis.zones],
  );

  useEffect(() => {
    const nextState = selectedCountry.states[0];
    if (!selectedCountry.states.some((item) => item.name === state)) {
      setState(nextState.name);
      setCity(nextState.cities[0].name);
    }
  }, [country, selectedCountry.states, state]);

  useEffect(() => {
    if (!selectedState.cities.some((item) => item.name === city)) {
      setCity(selectedState.cities[0].name);
    }
  }, [city, selectedState.cities]);

  useEffect(() => {
    let cancelled = false;

    async function analyze() {
      const normalizedBusinessType = businessType.trim() || "AI startup";
      const cacheKey = `${country}:${state}:${city}:${normalizedBusinessType.toLowerCase()}`;
      const cachedAnalysis = analysisCacheRef.current.get(cacheKey);

      if (cachedAnalysis) {
        setAnalysis(cachedAnalysis);
        setSelectedZone(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const url = buildApiUrl("/location/analyze");
        const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
        console.debug("[API] Using URL:", url);
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ country, state, city, businessType: normalizedBusinessType }),
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Location analysis failed");
        }

        const nextAnalysis = (await response.json()) as AnalysisResponse;
        console.debug("[API] Response:", nextAnalysis);
        if (!cancelled) {
          analysisCacheRef.current.set(cacheKey, nextAnalysis);
          setAnalysis(nextAnalysis);
          setSelectedZone(null);
        }
      } catch {
        if (!cancelled) {
          const fallbackAnalysis = analyzeLocationProfit({ country, state, city, businessType: normalizedBusinessType });
          analysisCacheRef.current.set(cacheKey, fallbackAnalysis);
          setAnalysis(fallbackAnalysis);
          setSelectedZone(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void analyze();
    return () => {
      cancelled = true;
    };
  }, [businessType, city, country, state]);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapNodeRef.current) {
        return;
      }

      try {
        await loadGoogleMaps();
        if (cancelled || !window.google?.maps || !mapNodeRef.current) {
          return;
        }

        mapRef.current = new window.google.maps.Map(mapNodeRef.current, {
          center: analysis.center,
          zoom: 12,
          styles: MAP_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        infoWindowRef.current = new window.google.maps.InfoWindow();
        setMapAvailable(true);
      } catch {
        setMapAvailable(false);
      }
    }

    void initMap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) {
      return;
    }

    mapRef.current.setCenter(analysis.center);
    polygonsRef.current.forEach((polygon) => polygon.setMap(null));
    polygonsRef.current = [];

    analysis.zones.forEach((zone) => {
      const colors = getZoneColors(zone.status);
      const polygon = new window.google.maps.Polygon({
        paths: zone.polygon,
        strokeColor: colors.stroke,
        strokeOpacity: 0.9,
        strokeWeight: 1,
        fillColor: colors.fill,
        fillOpacity: 0.34,
        map: mapRef.current,
      });

      polygon.addListener("mouseover", () => {
        polygon.setOptions({ fillOpacity: 0.52, strokeWeight: 2 });
      });
      polygon.addListener("mouseout", () => {
        polygon.setOptions({ fillOpacity: 0.34, strokeWeight: 1 });
      });
      polygon.addListener("click", () => {
        setSelectedZone(zone);
        infoWindowRef.current?.setContent(`
          <div style="background:#020617;color:#e5e7eb;padding:12px;border-radius:14px;max-width:220px">
            <strong style="color:#67e8f9">${zone.name}</strong>
            <div>Profit score: ${zone.profitScore}/100</div>
            <div>Competition: ${zone.competitionLevel}/100</div>
            <div style="margin-top:6px;color:#94a3b8">${zone.recommendation}</div>
          </div>
        `);
        infoWindowRef.current?.setPosition(zone.center);
        infoWindowRef.current?.open(mapRef.current);
      });

      polygonsRef.current.push(polygon);
    });

    return () => {
      polygonsRef.current.forEach((polygon) => polygon.setMap(null));
      polygonsRef.current = [];
    };
  }, [analysis]);

  return (
    <Card className="premium-border overflow-hidden p-0">
      <div className="border-b border-white/10 bg-white/[0.025] p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
              <Radar className="h-3.5 w-3.5" />
              Location Profit Intelligence
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">AI business heatmap</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              Select a location to identify high-profit zones, competition-heavy pockets, and balanced launch areas.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <LocationSelect label="Country" value={country} onChange={setCountry} options={countryOptions.map((item) => item.name)} />
            <LocationSelect label="State" value={state} onChange={setState} options={selectedCountry.states.map((item) => item.name)} />
            <LocationSelect label="City" value={city} onChange={setCity} options={selectedState.cities.map((item) => item.name)} />
            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Business</span>
              <input
                value={businessType}
                onChange={(event) => setBusinessType(event.target.value)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-cyan-300/40"
                placeholder="Cafe, SaaS, clinic..."
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative min-h-[560px] overflow-hidden bg-[#020617]">
          {mapAvailable ? (
            <div ref={mapNodeRef} className="h-[560px] w-full" />
          ) : (
            <FallbackHeatmap zones={analysis.zones} selectedZone={selectedZone} onSelect={setSelectedZone} />
          )}

          <div className="pointer-events-none absolute left-5 top-5 rounded-2xl border border-white/10 bg-[#020617]/70 px-4 py-3 text-xs text-slate-300 shadow-[0_0_30px_rgba(2,6,23,0.5)] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-cyan-300" /> : <MapPin className="h-4 w-4 text-cyan-300" />}
              {selectedCity.name} heatmap
            </div>
          </div>

          <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
            <LegendPill color="bg-emerald-400" label="High profit" count={zoneCounts.high} />
            <LegendPill color="bg-yellow-400" label="Medium" count={zoneCounts.medium} />
            <LegendPill color="bg-red-400" label="Avoid first" count={zoneCounts.low} />
          </div>
        </div>

        <div className="border-l border-white/10 bg-white/[0.025] p-6">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-400/10 p-2 text-cyan-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Selected zone</p>
                <p className="text-xs text-slate-500">Click a map area for details</p>
              </div>
            </div>

            {selectedZone ? (
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-2xl font-bold text-white">{selectedZone.name}</p>
                  <p className={clsx("mt-1 text-sm font-medium", selectedZone.status === "high" ? "text-emerald-300" : selectedZone.status === "medium" ? "text-yellow-300" : "text-red-300")}>
                    {getZoneColors(selectedZone.status).label}
                  </p>
                </div>
                <Metric label="Profit Score" value={`${selectedZone.profitScore}/100`} />
                <Metric label="Competition" value={`${selectedZone.competitionLevel}/100`} />
                <Metric label="Demand" value={`${selectedZone.demandEstimate}/100`} />
                <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">
                  {selectedZone.recommendation}
                </p>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-7 text-slate-400">
                Green zones are best first-launch targets. Red zones usually need stronger differentiation or lower-cost entry.
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function LocationSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-white/10 bg-[#06111f] px-4 text-sm text-white outline-none transition focus:border-cyan-300/40"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FallbackHeatmap({
  zones,
  selectedZone,
  onSelect,
}: {
  zones: ProfitZone[];
  selectedZone: ProfitZone | null;
  onSelect: (zone: ProfitZone) => void;
}) {
  return (
    <div className="relative h-[560px] overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.10),transparent_35%),#020617] p-5">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.045)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="relative grid h-full grid-cols-6 gap-2">
        {zones.map((zone) => {
          const colors = getZoneColors(zone.status);
          const isSelected = selectedZone?.id === zone.id;

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onSelect(zone)}
              className={clsx(
                "group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 hover:-translate-y-1",
                isSelected ? "border-white/40 shadow-[0_0_28px_rgba(34,211,238,0.25)]" : "border-white/10",
              )}
              style={{
                backgroundColor: `${colors.fill}44`,
                boxShadow: isSelected ? `0 0 28px ${colors.fill}66` : `0 0 18px ${colors.fill}22`,
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
              <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white/85">{zone.profitScore}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LegendPill({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="rounded-full border border-white/10 bg-[#020617]/70 px-3 py-2 text-xs text-slate-300 backdrop-blur-xl">
      <span className={clsx("mr-2 inline-block h-2 w-2 rounded-full shadow-[0_0_10px_currentColor]", color)} />
      {label}: {count}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
