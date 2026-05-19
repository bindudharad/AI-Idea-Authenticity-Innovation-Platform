import { NextResponse } from "next/server";

import { analyzeLocationProfit } from "@/lib/location-profit-intelligence";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      country?: string;
      state?: string;
      city?: string;
      businessType?: string;
    };

    const country = body.country || "India";
    const state = body.state || "Karnataka";
    const city = body.city || "Bengaluru";
    const businessType = body.businessType || "AI startup";

    return NextResponse.json(
      analyzeLocationProfit({
        country,
        state,
        city,
        businessType,
      }),
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to analyze location profit zones." },
      { status: 400 },
    );
  }
}
