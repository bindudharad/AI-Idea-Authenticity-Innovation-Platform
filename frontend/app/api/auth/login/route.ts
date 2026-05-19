import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

import { generateToken } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let email = "";
    let password = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      email = String(formData.get("username") ?? formData.get("email") ?? "").trim().toLowerCase();
      password = String(formData.get("password") ?? "");
    } else {
      const body = (await request.json()) as { email?: string; password?: string; username?: string };
      email = String(body.email ?? body.username ?? "").trim().toLowerCase();
      password = String(body.password ?? "");
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    return NextResponse.json({
      access_token: generateToken(user.id),
      token_type: "bearer",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to login." },
      { status: 500 },
    );
  }
}
