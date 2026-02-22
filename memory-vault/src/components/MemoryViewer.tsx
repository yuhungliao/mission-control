"use client";

import { format } from "date-fns";
import { renderMarkdown } from "@/lib/markdown";
import { Brain, Calendar, BookOpen, Clock, FileText, Hash, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface Memory {
  _id: string;
  slug: string;
  title: string;
  content: string;
  category: "core" | "daily" | "reference";
  wordCount: number;
  tags?: string[];
  sourceFile: string;
  syncedAt: number;
  createdAt: number;
  updatedAt: number;
}

interface Props {
  memory: Memory | null;
}

const CATEGORY_CONFIG = {
  core: { icon: Brain, color: "#8b5cf6", label: "Core Memory", emoji: "🧠" },
  daily: { icon: Calendar, color: "#3b82f6", label: "Daily Log", emoji: "📅" },
  reference: { icon: BookOpen, color: "#10b981", label: "Reference Doc", emoji: "📖" },
};

export default function MemoryViewer({ memory }: Props) {
  if (!memory) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-xl font-semibold text-[var(--text-secondary)] mb-2">
            Memory Vault
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-sm">
            Select a memory from the sidebar to view it, or use search to find something specific.
          </p>
        </div>
      </div>
    );
  }

  const config = CATEGORY_CONFIG[memory.category];
  const html = renderMarkdown(memory.content);

  return (
    <motion.div
      key={memory._id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="flex-1 overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: config.color + "20", color: config.color }}
            >
              {config.emoji} {config.label}
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-3">{memory.title}</h1>
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Updated {format(new Date(memory.updatedAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
            <span className="flex items-center gap-1">
              <FileText size={12} />
              {memory.wordCount.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px]">
              {memory.sourceFile.replace("/Users/kevinliao/.openclaw/workspace/", "")}
            </span>
          </div>
          {memory.tags && memory.tags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {memory.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] flex items-center gap-1"
                >
                  <Hash size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent mb-8" />

        {/* Content */}
        <div
          className="text-sm text-[var(--text-secondary)]"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
            <span>Synced {format(new Date(memory.syncedAt), "MMM d, yyyy 'at' h:mm:ss a")}</span>
            <span>Created {format(new Date(memory.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
