import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const WORKSPACE = process.env.WORKSPACE_PATH || "/Users/kevinliao/.openclaw/workspace";
const SYNC_TOKEN = process.env.SYNC_API_TOKEN || "mc-sync-2026";

// Patterns to redact from content before serving
const SENSITIVE_PATTERNS = [
  /(?:api[_-]?key|token|secret|password|credential)\s*[:=]\s*["']?[\w\-\.]{16,}["']?/gi,
  /sk-proj-[\w\-]+/g,
  /ghp_[\w]+/g,
  /BSA[\w]+/g,
  /eyJ[\w\-\.=]+/g, // JWT tokens
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, // IP addresses
];

function redactSensitive(content: string): string {
  let redacted = content;
  for (const pattern of SENSITIVE_PATTERNS) {
    redacted = redacted.replace(pattern, "[REDACTED]");
  }
  return redacted;
}

interface MemoryFile {
  slug: string;
  title: string;
  content: string;
  category: "core" | "daily" | "reference";
  wordCount: number;
  tags: string[];
  sourceFile: string;
}

function extractTags(content: string): string[] {
  const tags = new Set<string>();
  const headers = content.match(/^##\s+(.+)$/gm);
  if (headers) {
    for (const h of headers.slice(0, 5)) {
      tags.add(h.replace(/^##\s+/, "").trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").slice(0, 30));
    }
  }
  return Array.from(tags).filter(Boolean);
}

function getCategory(filename: string): "core" | "daily" | "reference" {
  if (filename === "MEMORY.md" || filename === "SOUL.md" || filename === "IDENTITY.md") return "core";
  if (/^\d{4}-\d{2}-\d{2}\.md$/.test(filename)) return "daily";
  return "reference";
}

function getTitle(filename: string, content: string): string {
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].replace(/[*_`]/g, "").trim();
  return filename.replace(/\.md$/, "");
}

function sanitizeSourceFile(filePath: string): string {
  // Strip absolute path prefix, only show relative path
  return filePath.replace(WORKSPACE + "/", "").replace(WORKSPACE, "");
}

export async function GET(request: NextRequest) {
  // Auth check — require Bearer token or query param
  const authHeader = request.headers.get("authorization");
  const urlToken = request.nextUrl.searchParams.get("token");
  const providedToken = authHeader?.replace("Bearer ", "") || urlToken;

  if (providedToken !== SYNC_TOKEN) {
    return NextResponse.json(
      { error: "Unauthorized. Provide valid token via Authorization header or ?token= param." },
      { status: 401 }
    );
  }

  try {
    const files: MemoryFile[] = [];

    const topFiles = fs.readdirSync(WORKSPACE).filter((f) => f.endsWith(".md"));
    for (const f of topFiles) {
      const filePath = path.join(WORKSPACE, f);
      const content = fs.readFileSync(filePath, "utf-8");
      files.push({
        slug: f.replace(/\.md$/, ""),
        title: getTitle(f, content),
        content: redactSensitive(content),
        category: getCategory(f),
        wordCount: content.split(/\s+/).filter(Boolean).length,
        tags: extractTags(content),
        sourceFile: sanitizeSourceFile(filePath),
      });
    }

    const memDir = path.join(WORKSPACE, "memory");
    if (fs.existsSync(memDir)) {
      const memFiles = fs.readdirSync(memDir).filter((f) => f.endsWith(".md"));
      for (const f of memFiles) {
        const filePath = path.join(memDir, f);
        const content = fs.readFileSync(filePath, "utf-8");
        files.push({
          slug: `memory/${f.replace(/\.md$/, "")}`,
          title: getTitle(f, content),
          content: redactSensitive(content),
          category: getCategory(f),
          wordCount: content.split(/\s+/).filter(Boolean).length,
          tags: extractTags(content),
          sourceFile: sanitizeSourceFile(filePath),
        });
      }
    }

    return NextResponse.json({ files, count: files.length });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
