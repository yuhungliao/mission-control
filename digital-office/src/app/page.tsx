"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Workstation from "@/components/Workstation";
import AgentPanel from "@/components/AgentPanel";
import { Building2, Users, Zap, Loader2, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const agents = useQuery(api.agents.listAll);
  const activities = useQuery(api.activity.recent);
  const seed = useMutation(api.agents.seed);

  useEffect(() => {
    if (agents && agents.length === 0) seed();
  }, [agents, seed]);

  // Live clock — only on client
  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    if (!agents) return { active: 0, total: 0, tasks: 0 };
    return {
      active: agents.filter((a) => a.status === "active" || a.status === "busy").length,
      total: agents.length,
      tasks: agents.reduce((acc, a) => acc + a.totalTasks, 0),
    };
  }, [agents]);

  // Layout: leadership top row, then departments
  const layout = useMemo(() => {
    if (!agents) return { leadership: [], departments: {} as Record<string, typeof agents> };
    const leadership = agents.filter((a) => a.department === "leadership");
    const deptOrder = ["engineering", "creative", "intelligence", "operations"];
    const departments: Record<string, typeof agents> = {};
    for (const d of deptOrder) {
      const dAgents = agents.filter((a) => a.department === d);
      if (dAgents.length) departments[d] = dAgents;
    }
    return { leadership, departments };
  }, [agents]);

  const DEPT_NAMES: Record<string, { label: string; emoji: string }> = {
    engineering: { label: "Engineering Wing", emoji: "⚙️" },
    creative: { label: "Creative Studio", emoji: "🎨" },
    intelligence: { label: "Intelligence Lab", emoji: "🧠" },
    operations: { label: "Ops Center", emoji: "🛡️" },
  };

  const timeStr = currentTime?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Taipei",
  }) ?? "--:--:--";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      {/* Header bar */}
      <header className="flex-shrink-0 border-b border-[var(--border)] px-6 py-2.5 bg-[var(--bg-floor)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="text-[var(--accent)]" size={20} />
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Digital Office
            </h1>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-4 text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-status-pulse" />
                {stats.active} working
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={12} />
                {stats.total} agents
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={12} className="text-amber-400" />
                {stats.tasks} tasks done
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-sm text-[var(--text-secondary)] tabular-nums">
              <Clock size={13} />
              {timeStr}
            </div>
          </div>
        </div>
      </header>

      {/* Office floor */}
      <div className="flex-1 overflow-auto p-8">
        {!agents ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
            {/* Floor texture overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, var(--text-muted) 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />

            {/* Leadership Row — Executive Suite */}
            <section className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-lg">🏛️</span>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Executive Suite
                </h2>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
              <div className="flex justify-center gap-8">
                {layout.leadership.map((agent, i) => (
                  <Workstation
                    key={agent._id}
                    agent={agent as any}
                    onClick={() => setSelectedAgent(agent)}
                    index={i}
                  />
                ))}
              </div>
            </section>

            {/* Department Wings */}
            {Object.entries(layout.departments).map(([dept, deptAgents], deptIdx) => {
              const info = DEPT_NAMES[dept];
              return (
                <section key={dept} className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-lg">{info?.emoji}</span>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      {info?.label}
                    </h2>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {deptAgents.length} {deptAgents.length === 1 ? "agent" : "agents"}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-6">
                    {deptAgents.map((agent, i) => (
                      <Workstation
                        key={agent._id}
                        agent={agent as any}
                        onClick={() => setSelectedAgent(agent)}
                        index={deptIdx * 3 + i + layout.leadership.length}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Office footer */}
            <div className="text-center py-8">
              <p className="text-[10px] text-[var(--text-muted)]">
                🐾 Carrie&apos;s Digital Office — {stats.total} team members — Mission Control
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Agent detail panel */}
      {selectedAgent && (
        <AgentPanel
          agent={selectedAgent}
          activities={(activities || []) as any}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
