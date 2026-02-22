"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PanelLeftClose, PanelLeft } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  emoji: string;
  port: number;
}

const TABS: Tab[] = [
  { id: "tasks", label: "Tasks", emoji: "📋", port: 3000 },
  { id: "calendar", label: "Calendar", emoji: "📅", port: 3002 },
  { id: "memory", label: "Memory", emoji: "🧠", port: 3003 },
  { id: "team", label: "Team", emoji: "👥", port: 3004 },
  { id: "office", label: "Office", emoji: "🏢", port: 3005 },
];

interface Props {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function TopBar({ activeTab, onTabChange, sidebarCollapsed, onToggleSidebar }: Props) {
  const [clock, setClock] = useState("");
  const activity = useQuery(api.activity.recent);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Taipei" }));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const latestActivity = activity?.[0];

  return (
    <header className="h-12 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-3 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)]">
          {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs">🐾</div>
          <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Mission Control
          </span>
        </div>

        <div className="flex items-center gap-0.5 bg-[var(--bg-tertiary)] rounded-lg p-0.5 ml-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <span className="text-[12px]">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {latestActivity && (
          <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="max-w-[200px] truncate">{latestActivity.agentName}: {latestActivity.action}</span>
          </div>
        )}
        <span className="font-mono text-[var(--text-secondary)] tabular-nums">{clock}</span>
        <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-[11px] cursor-pointer">👤</div>
      </div>
    </header>
  );
}

export { TABS };
export type { Tab };
