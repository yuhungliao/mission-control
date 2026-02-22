"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function StatusBar() {
  const agents = useQuery(api.agents.list);
  const goals = useQuery(api.goals.list);

  const activeAgents = agents?.filter((a) => a.status === "active" || a.status === "busy").length || 0;
  const totalMissions = goals?.reduce((acc, g) => acc + (g.missions?.length || 0), 0) || 0;
  const doneMissions = goals?.reduce((acc, g) => acc + (g.missions?.filter((m: any) => m.status === "done").length || 0), 0) || 0;

  return (
    <footer className="h-8 bg-[var(--bg-secondary)] border-t border-[var(--border)] flex items-center justify-between px-3 text-[10px] text-[var(--text-muted)] flex-shrink-0">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Gateway connected
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Convex synced
        </span>
        <span>{activeAgents} agents active</span>
        <span>{totalMissions} missions · {doneMissions} done</span>
      </div>
      <div className="flex items-center gap-4">
        <span>v2026.2.22</span>
        <span>Port 3010</span>
        <span>🐾 Carrie × Kevin</span>
      </div>
    </footer>
  );
}
