import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest } from "next/server";

type AppTokenPayload = JwtPayload & {
  userId: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export function generateToken(userId: string) {
  return jwt.sign({ userId }, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): AppTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AppTokenPayload;
}

export function readBearerToken(request: NextRequest | Request) {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export function getUserIdFromRequest(request: NextRequest | Request) {
  const token = readBearerToken(request);
  if (!token) {
    return null;
  }

  return verifyToken(token).userId;
}
