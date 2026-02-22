"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import MemoryCard from "@/components/MemoryCard";
import MemoryViewer from "@/components/MemoryViewer";
import {
  Search,
  Brain,
  Calendar,
  BookOpen,
  RefreshCw,
  Loader2,
  Database,
  Sparkles,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Category = "all" | "core" | "daily" | "reference";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const upsert = useMutation(api.memories.upsert);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query Convex
  const searchResults = useQuery(
    api.memories.search,
    debouncedQuery
      ? {
          query: debouncedQuery,
          category: activeCategory !== "all" ? activeCategory : undefined,
        }
      : "skip"
  );

  const allMemories = useQuery(
    api.memories.listAll,
    !debouncedQuery ? {} : "skip"
  );

  const memories = useMemo(() => {
    const data = debouncedQuery ? searchResults : allMemories;
    if (!data) return undefined;
    if (activeCategory === "all" || debouncedQuery) return data;
    return data.filter((m) => m.category === activeCategory);
  }, [debouncedQuery, searchResults, allMemories, activeCategory]);

  const selectedMemory = memories?.find((m) => m._id === selectedId) || null;

  // Sync from disk
  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (data.files) {
        for (const file of data.files) {
          await upsert({
            slug: file.slug,
            title: file.title,
            content: file.content,
            category: file.category,
            wordCount: file.wordCount,
            tags: file.tags,
            sourceFile: file.sourceFile,
          });
        }
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }, [upsert]);

  // Auto-sync on first load if empty
  useEffect(() => {
    if (allMemories && allMemories.length === 0) {
      handleSync();
    }
  }, [allMemories, handleSync]);

  const stats = useMemo(() => {
    if (!allMemories) return { total: 0, core: 0, daily: 0, reference: 0, words: 0 };
    return {
      total: allMemories.length,
      core: allMemories.filter((m) => m.category === "core").length,
      daily: allMemories.filter((m) => m.category === "daily").length,
      reference: allMemories.filter((m) => m.category === "reference").length,
      words: allMemories.reduce((acc, m) => acc + m.wordCount, 0),
    };
  }, [allMemories]);

  const categories: { key: Category; label: string; icon: typeof Brain; count: number }[] = [
    { key: "all", label: "All", icon: Database, count: stats.total },
    { key: "core", label: "Core", icon: Brain, count: stats.core },
    { key: "daily", label: "Daily", icon: Calendar, count: stats.daily },
    { key: "reference", label: "Ref", icon: BookOpen, count: stats.reference },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 glass border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-[var(--accent)]" size={20} />
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Memory Vault
            </h1>
            <span className="text-xs text-[var(--text-muted)] ml-1">
              {stats.words.toLocaleString()} words across {stats.total} memories
            </span>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
          >
            {syncing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            {syncing ? "Syncing…" : "Sync Files"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-96 flex-shrink-0 border-r border-[var(--border)] flex flex-col bg-[var(--bg-secondary)]">
          {/* Search */}
          <div className="p-3 border-b border-[var(--border)]">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories…"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-1 mt-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`
                      flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all
                      ${activeCategory === cat.key
                        ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                      }
                    `}
                  >
                    <Icon size={11} />
                    {cat.label}
                    <span className="opacity-60">{cat.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Memory list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {memories === undefined ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
              </div>
            ) : memories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-[var(--text-muted)]">
                  {debouncedQuery ? "No results found" : "No memories yet"}
                </p>
                {!debouncedQuery && (
                  <button
                    onClick={handleSync}
                    className="mt-2 text-xs text-[var(--accent)] hover:underline"
                  >
                    Sync from disk
                  </button>
                )}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {memories.map((m) => (
                  <MemoryCard
                    key={m._id}
                    memory={m as any}
                    isActive={m._id === selectedId}
                    onClick={() => setSelectedId(m._id)}
                    searchQuery={debouncedQuery || undefined}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Document viewer */}
        <MemoryViewer memory={selectedMemory as any} />
      </div>
    </div>
  );
}
