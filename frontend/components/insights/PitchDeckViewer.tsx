"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, FileText, Presentation } from "lucide-react";

import { buildApiUrl } from "@/services/api";
import { PitchSlide } from "@/types/api";
import { formatStableDateTime } from "@/lib/format";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { SlideCard } from "@/components/insights/SlideCard";

export function PitchDeckViewer({
  ideaName,
  slides,
  generatedAt,
}: {
  ideaName: string;
  slides: PitchSlide[];
  generatedAt?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];

  const metadataLabel = useMemo(() => {
    if (!generatedAt) {
      return "Generated now";
    }
    return `Generated ${formatStableDateTime(generatedAt)}`;
  }, [generatedAt]);

  async function handleDownloadPdf() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    slides.forEach((slide, index) => {
      if (index > 0) {
        doc.addPage();
      }

      doc.setFillColor(8, 15, 28);
      doc.rect(0, 0, 842, 595, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text(slide.title, 56, 72);

      doc.setDrawColor(82, 199, 255);
      doc.setLineWidth(2);
      doc.line(56, 92, 220, 92);

      doc.setFontSize(16);
      const wrapped = doc.splitTextToSize(slide.content, 720);
      doc.text(wrapped, 56, 140);

      doc.setFontSize(11);
      doc.setTextColor(164, 177, 202);
      doc.text(`${ideaName} - Slide ${index + 1}`, 56, 555);
    });

    doc.save(`${slugify(ideaName)}-pitch-deck.pdf`);
  }

  async function handleDownloadPptx() {
    const requestUrl = buildApiUrl("/generatePitch/export");
    const token = window.localStorage.getItem("token");
    console.debug("[API] Using URL:", requestUrl);
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ideaName, slides }),
    });

    if (!response.ok) {
      throw new Error("Unable to export PowerPoint deck.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slugify(ideaName)}-pitch-deck.pptx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Pitch deck viewer</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{ideaName}</h2>
            <p className="mt-2 text-sm text-slate-400">{metadataLabel}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleDownloadPdf}>
              <FileText className="h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={handleDownloadPptx}>
              <Presentation className="h-4 w-4" />
              Download Pitch Deck
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SlideCard slide={activeSlide} index={activeIndex} active />

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Slide navigation</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {activeIndex + 1} / {slides.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveIndex((index) => (index === 0 ? slides.length - 1 : index - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveIndex((index) => (index === slides.length - 1 ? 0 : index + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  index === activeIndex
                    ? "border-sky-400/25 bg-sky-400/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{slide.title}</span>
                  {index === activeIndex ? <Download className="h-4 w-4 text-sky-300" /> : null}
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

