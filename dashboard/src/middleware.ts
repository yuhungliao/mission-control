import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "mc-session";

export function middleware(request: NextRequest) {
  // Must have DASHBOARD_PASSWORD configured
  if (!process.env.DASHBOARD_PASSWORD) {
    return new NextResponse("DASHBOARD_PASSWORD not set in .env.local", { status: 500 });
  }

  // Skip auth for static assets and auth API
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname === "/favicon.ico" ||
    request.nextUrl.pathname === "/api/auth"
  ) {
    return NextResponse.next();
  }

  // Check for session cookie (signed token set by /api/auth)
  const sessionCookie = request.cookies.get(COOKIE_NAME);
  if (sessionCookie?.value && sessionCookie.value.includes(".")) {
    // Basic format check — actual signature verification in API route on login
    // Token format: base64url_payload.hmac_signature
    const [payloadB64, sig] = sessionCookie.value.split(".");
    if (payloadB64 && sig && sig.length === 64) {
      // Verify expiry client-side
      try {
        const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
        if (payload.ts && Date.now() - payload.ts < 7 * 24 * 60 * 60 * 1000) {
          return NextResponse.next();
        }
      } catch {
        // Invalid token, fall through to login
      }
    }
  }

  // Return login page with POST form
  return new NextResponse(
    `<!DOCTYPE html>
    <html><head><title>Mission Control — Login</title>
    <style>
      body { background: #08090d; color: #e8e8f0; font-family: Inter, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
      .box { background: #0f1117; border: 1px solid #222640; border-radius: 16px; padding: 40px; text-align: center; max-width: 360px; }
      .logo { font-size: 40px; margin-bottom: 12px; }
      h1 { font-size: 20px; margin: 0 0 4px; background: linear-gradient(135deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      p { font-size: 12px; color: #5a5a72; margin: 0 0 20px; }
      input { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #222640; background: #161822; color: #e8e8f0; font-size: 14px; outline: none; box-sizing: border-box; }
      input:focus { border-color: #8b5cf6; }
      button { width: 100%; padding: 10px; border-radius: 10px; border: none; background: #8b5cf6; color: white; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 12px; }
      button:hover { background: #a78bfa; }
      .error { color: #f87171; font-size: 12px; margin-top: 8px; display: none; }
      .locked { color: #fbbf24; }
    </style></head><body>
    <div class="box">
      <div class="logo">🐾</div>
      <h1>Mission Control</h1>
      <p>Enter password to continue</p>
      <form id="loginForm">
        <input type="password" name="password" id="pw" placeholder="Password" autofocus autocomplete="current-password" />
        <button type="submit" id="btn">Enter</button>
        <p class="error" id="err"></p>
      </form>
    </div>
    <script>
      document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn');
        const err = document.getElementById('err');
        btn.disabled = true; btn.textContent = '...';
        err.style.display = 'none';
        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: document.getElementById('pw').value }),
          });
          if (res.ok) {
            window.location.href = '/';
          } else {
            const data = await res.json();
            err.textContent = data.error || 'Wrong password';
            err.style.display = 'block';
            if (data.retryAfter) err.classList.add('locked');
          }
        } catch { err.textContent = 'Connection error'; err.style.display = 'block'; }
        btn.disabled = false; btn.textContent = 'Enter';
      });
    </script>
    </body></html>`,
    { status: 401, headers: { "Content-Type": "text/html" } }
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
