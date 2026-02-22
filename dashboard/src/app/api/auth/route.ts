import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

const AUTH_PASSWORD = process.env.DASHBOARD_PASSWORD;
const COOKIE_NAME = "mc-session";
const SESSION_SECRET = process.env.SESSION_SECRET || "fallback-do-not-use";

// Rate limiting (in-memory)
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;

function getClientIP(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function createSessionToken(): string {
  const payload = JSON.stringify({ ts: Date.now(), r: crypto.randomBytes(16).toString("hex") });
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(payload).toString("base64url") + "." + sig;
}

export async function POST(request: NextRequest) {
  if (!AUTH_PASSWORD) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const ip = getClientIP(request);

  // Check rate limit
  const record = loginAttempts.get(ip);
  const now = Date.now();
  if (record) {
    if (record.lockedUntil > now) {
      const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${retryAfter}s`, retryAfter },
        { status: 429 }
      );
    }
    if (now - record.lastAttempt > WINDOW_MS) {
      loginAttempts.delete(ip);
    }
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.password !== AUTH_PASSWORD) {
    // Record failed attempt
    const rec = loginAttempts.get(ip) || { count: 0, lastAttempt: 0, lockedUntil: 0 };
    rec.count += 1;
    rec.lastAttempt = now;
    const remaining = MAX_ATTEMPTS - rec.count;
    if (rec.count >= MAX_ATTEMPTS) {
      rec.lockedUntil = now + LOCKOUT_MS;
      rec.count = 0;
      loginAttempts.set(ip, rec);
      return NextResponse.json(
        { error: "Too many failed attempts. Locked for 5 minutes.", retryAfter: LOCKOUT_MS / 1000 },
        { status: 429 }
      );
    }
    loginAttempts.set(ip, rec);
    return NextResponse.json(
      { error: `Wrong password. ${remaining} attempts remaining.` },
      { status: 401 }
    );
  }

  // Success — clear attempts, issue signed session token
  loginAttempts.delete(ip);
  const token = createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return response;
}
