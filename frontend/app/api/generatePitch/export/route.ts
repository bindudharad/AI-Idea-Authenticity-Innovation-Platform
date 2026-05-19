import { NextRequest, NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";

import { PitchSlide } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      ideaName?: string;
      slides?: PitchSlide[];
    };

    const ideaName = String(payload.ideaName ?? "").trim();
    const slides = Array.isArray(payload.slides) ? payload.slides : [];

    if (ideaName.length < 3 || slides.length === 0) {
      return NextResponse.json({ error: "ideaName and slides are required." }, { status: 400 });
    }

    const deck = new PptxGenJS();
    deck.layout = "LAYOUT_WIDE";
    deck.author = "AI Idea Authenticity Platform";
    deck.company = "Innovation Intelligence Suite";
    deck.subject = `${ideaName} pitch deck`;
    deck.title = `${ideaName} pitch deck`;
    deck.theme = {
      headFontFace: "Aptos Display",
      bodyFontFace: "Aptos",
    };

    slides.forEach((slide, index) => {
      const pptSlide = deck.addSlide();
      pptSlide.background = { color: "07111F" };
      pptSlide.addText(slide.title, {
        x: 0.55,
        y: 0.45,
        w: 9.4,
        h: 0.6,
        color: "FFFFFF",
        bold: true,
        fontSize: 24,
      });
      pptSlide.addShape(PptxGenJS.ShapeType.line, {
        x: 0.55,
        y: 1.1,
        w: 2.4,
        h: 0,
        line: { color: "52C7FF", width: 2 },
      });
      pptSlide.addText(slide.content, {
        x: 0.55,
        y: 1.45,
        w: 11.7,
        h: 4.8,
        color: "DCE6F8",
        fontSize: 18,
        breakLine: false,
        valign: "top",
        margin: 0.04,
      });
      pptSlide.addText(`${ideaName} • Slide ${index + 1}`, {
        x: 0.55,
        y: 6.7,
        w: 4.4,
        h: 0.3,
        color: "8EA0BD",
        fontSize: 10,
      });
    });

    const buffer = await deck.write({ outputType: "nodebuffer" });

    return new NextResponse(buffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename=\"${slugify(ideaName)}-pitch-deck.pptx\"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to generate PowerPoint export." }, { status: 500 });
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
