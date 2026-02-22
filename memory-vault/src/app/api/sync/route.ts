import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WORKSPACE = process.env.WORKSPACE_PATH || "/Users/kevinliao/.openclaw/workspace";

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
  // Extract headers as tags
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
  // Try first H1
  const h1 = content.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].replace(/[*_`]/g, "").trim();
  // Fallback to filename
  return filename.replace(/\.md$/, "");
}

export async function GET() {
  try {
    const files: MemoryFile[] = [];

    // Top-level .md files
    const topFiles = fs.readdirSync(WORKSPACE).filter((f) => f.endsWith(".md"));
    for (const f of topFiles) {
      const filePath = path.join(WORKSPACE, f);
      const content = fs.readFileSync(filePath, "utf-8");
      files.push({
        slug: f.replace(/\.md$/, ""),
        title: getTitle(f, content),
        content,
        category: getCategory(f),
        wordCount: content.split(/\s+/).filter(Boolean).length,
        tags: extractTags(content),
        sourceFile: filePath,
      });
    }

    // memory/ directory
    const memDir = path.join(WORKSPACE, "memory");
    if (fs.existsSync(memDir)) {
      const memFiles = fs.readdirSync(memDir).filter((f) => f.endsWith(".md"));
      for (const f of memFiles) {
        const filePath = path.join(memDir, f);
        const content = fs.readFileSync(filePath, "utf-8");
        files.push({
          slug: `memory/${f.replace(/\.md$/, "")}`,
          title: getTitle(f, content),
          content,
          category: getCategory(f),
          wordCount: content.split(/\s+/).filter(Boolean).length,
          tags: extractTags(content),
          sourceFile: filePath,
        });
      }
    }

    return NextResponse.json({ files, count: files.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
