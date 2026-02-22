"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import AgentCard from "@/components/AgentCard";
import AgentDetail from "@/components/AgentDetail";
import OrgChart from "@/components/OrgChart";
import {
  Users,
  Network,
  LayoutGrid,
  Loader2,
  Activity,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

type View = "grid" | "org";

const DEPT_ORDER = ["leadership", "engineering", "creative", "intelligence", "operations"];
const DEPT_LABELS: Record<string, { label: string; emoji: string }> = {
  leadership: { label: "Leadership", emoji: "🏛️" },
  engineering: { label: "Engineering", emoji: "⚙️" },
  creative: { label: "Creative", emoji: "🎨" },
  intelligence: { label: "Intelligence", emoji: "🧠" },
  operations: { label: "Operations", emoji: "🛡️" },
};

export default function Home() {
  const [view, setView] = useState<View>("grid");
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const agents = useQuery(api.agents.listAll);
  const activities = useQuery(api.activity.recent);
  const seed = useMutation(api.agents.seed);

  useEffect(() => {
    if (agents && agents.length === 0) {
      seed();
    }
  }, [agents, seed]);

  const grouped = useMemo(() => {
    if (!agents) return {};
    const map: Record<string, typeof agents> = {};
    for (const dept of DEPT_ORDER) {
      const deptAgents = agents.filter((a) => a.department === dept);
      if (deptAgents.length) map[dept] = deptAgents;
    }
    return map;
  }, [agents]);

  const stats = useMemo(() => {
    if (!agents) return { total: 0, active: 0, tasks: 0 };
    return {
      total: agents.length,
      active: agents.filter((a) => a.status === "active").length,
      tasks: agents.reduce((acc, a) => acc + a.totalTasks, 0),
    };
  }, [agents]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 glass border-b border-[var(--border)] px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-[var(--accent)]" size={20} />
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Team Hub
            </h1>
            <div className="flex items-center gap-3 ml-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Zap size={12} className="text-emerald-400" />
                {stats.active} active
              </span>
              <span>{stats.total} agents</span>
              <span>{stats.tasks} tasks completed</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded-lg p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === "grid"
                  ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <LayoutGrid size={13} /> Grid
            </button>
            <button
              onClick={() => setView("org")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === "org"
                  ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Network size={13} /> Org Chart
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Main area */}
        <div className="flex-1 overflow-y-auto p-6">
          {!agents ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            </div>
          ) : view === "org" ? (
            <OrgChart agents={agents as any} onSelect={setSelectedAgent} />
          ) : (
            <div className="space-y-8 animate-fade-in">
              {DEPT_ORDER.map((dept) => {
                const deptAgents = grouped[dept];
                if (!deptAgents) return null;
                const info = DEPT_LABELS[dept];
                return (
                  <section key={dept}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">{info.emoji}</span>
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                        {info.label}
                      </h2>
                      <div className="flex-1 h-px bg-[var(--border)] ml-2" />
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {deptAgents.length} {deptAgents.length === 1 ? "agent" : "agents"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {deptAgents.map((agent, i) => (
                        <AgentCard
                          key={agent._id}
                          agent={agent as any}
                          onClick={() => setSelectedAgent(agent)}
                          index={i}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity sidebar */}
        <div className="w-72 flex-shrink-0 border-l border-[var(--border)] bg-[var(--bg-secondary)] p-4 overflow-y-auto hidden lg:block">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-[var(--accent)]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Recent Activity
            </h2>
          </div>
          {activities ? (
            <div className="space-y-1">
              {activities.map((a, i) => {
                const agent = agents?.find((ag) => ag.name === a.agentName);
                return (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{agent?.emoji || "🤖"}</span>
                      <span className="text-[11px] font-semibold">{a.agentName}</span>
                      <span className="text-[10px] text-[var(--text-muted)] ml-auto">
                        {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] font-medium">{a.action}</p>
                    {a.detail && (
                      <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                        {a.detail}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Loader2 size={16} className="animate-spin text-[var(--accent)] mx-auto mt-8" />
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedAgent && (
        <AgentDetail
          agent={selectedAgent}
          activities={(activities || []) as any}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
