"use client";

import { format } from "date-fns";
import { FileText, Brain, Calendar, BookOpen, Hash } from "lucide-react";
import { motion } from "framer-motion";

interface Memory {
  _id: string;
  slug: string;
  title: string;
  content: string;
  category: "core" | "daily" | "reference";
  wordCount: number;
  tags?: string[];
  updatedAt: number;
}

interface Props {
  memory: Memory;
  isActive: boolean;
  onClick: () => void;
  searchQuery?: string;
}

const CATEGORY_CONFIG = {
  core: { icon: Brain, color: "#8b5cf6", label: "Core", bg: "rgba(139,92,246,0.1)" },
  daily: { icon: Calendar, color: "#3b82f6", label: "Daily", bg: "rgba(59,130,246,0.1)" },
  reference: { icon: BookOpen, color: "#10b981", label: "Reference", bg: "rgba(16,185,129,0.1)" },
};

function highlightText(text: string, query: string): string {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
}

function getPreview(content: string, query: string): string {
  const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  const preview = lines.slice(0, 3).join(" ").slice(0, 150);

  if (query) {
    const lower = content.toLowerCase();
    const idx = lower.indexOf(query.toLowerCase());
    if (idx > -1) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(content.length, idx + query.length + 60);
      const snippet = (start > 0 ? "…" : "") + content.slice(start, end) + (end < content.length ? "…" : "");
      return highlightText(snippet, query);
    }
  }

  return preview + (preview.length >= 150 ? "…" : "");
}

export default function MemoryCard({ memory, isActive, onClick, searchQuery }: Props) {
  const config = CATEGORY_CONFIG[memory.category];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`
        group p-4 rounded-xl cursor-pointer transition-all duration-200
        ${isActive
          ? "bg-[var(--accent-dim)] border border-[var(--accent)]/40"
          : "hover:bg-[var(--bg-hover)] border border-transparent"
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: config.bg }}
        >
          <Icon size={16} style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="text-sm font-semibold truncate"
              dangerouslySetInnerHTML={{
                __html: searchQuery ? highlightText(memory.title, searchQuery) : memory.title,
              }}
            />
          </div>
          <p
            className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2"
            dangerouslySetInnerHTML={{ __html: getPreview(memory.content, searchQuery || "") }}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: config.bg, color: config.color }}
            >
              {config.label}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              {memory.wordCount.toLocaleString()} words
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              {format(new Date(memory.updatedAt), "MMM d, yyyy")}
            </span>
          </div>
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {memory.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)] flex items-center gap-0.5"
                >
                  <Hash size={8} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
