import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { serializeUser } from "@/lib/prisma-serializers";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      full_name?: string;
      email?: string;
      password?: string;
    };

    const fullName = body.full_name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!fullName || fullName.length < 2 || !email || !email.includes("@") || password.length < 8) {
      return NextResponse.json({ error: "Invalid registration payload." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        fullName,
        email,
        password: hashed,
      },
    });

    return NextResponse.json(serializeUser(user), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to register user." },
      { status: 500 },
    );
  }
}
