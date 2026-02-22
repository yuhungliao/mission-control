"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ChevronRight, Plus, Circle, CheckCircle2, Loader, AlertTriangle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

const MISSION_STATUS_ICON: Record<string, { color: string; icon: React.ReactNode }> = {
  done: { color: "#10b981", icon: <CheckCircle2 size={10} /> },
  in_progress: { color: "#3b82f6", icon: <Loader size={10} className="animate-spin" /> },
  assigned: { color: "#f59e0b", icon: <Clock size={10} /> },
  blocked: { color: "#ef4444", icon: <AlertTriangle size={10} /> },
  pending: { color: "#5a5a72", icon: <Circle size={10} /> },
};

const AGENT_STATUS_COLOR: Record<string, string> = {
  active: "#10b981",
  busy: "#3b82f6",
  idle: "#5a5a72",
  offline: "#333",
};

export default function Sidebar({ collapsed, onToggle }: Props) {
  const goals = useQuery(api.goals.list);
  const agents = useQuery(api.agents.list);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [showNewGoal, setShowNewGoal] = useState(false);
  const createGoal = useMutation(api.goals.create);
  const createMission = useMutation(api.missions.create);

  const toggleGoal = (id: string) => {
    setExpandedGoals((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreateGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    if (!title.trim()) return;
    await createGoal({ title, icon: "🎯", color: "#8b5cf6" });
    form.reset();
    setShowNewGoal(false);
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col items-center py-3 gap-2">
        <button onClick={onToggle} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] p-1">›</button>
        {goals?.map((g) => (
          <div key={g._id} title={g.title} className="text-sm cursor-pointer hover:scale-110 transition-transform">{g.icon}</div>
        ))}
        <div className="flex-1" />
        {agents?.slice(0, 4).map((a) => (
          <div key={a._id} title={a.name} className="text-sm relative">
            {a.emoji}
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: AGENT_STATUS_COLOR[a.status] }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-[280px] bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col overflow-hidden flex-shrink-0">
      {/* Goals */}
      <div className="p-3 pb-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            📌 Active Goals
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[9px] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">
              {goals?.filter((g) => g.status === "active").length || 0}
            </span>
            <button
              onClick={() => setShowNewGoal(!showNewGoal)}
              className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-0.5"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showNewGoal && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateGoal}
              className="mb-2 overflow-hidden"
            >
              <input
                name="title"
                placeholder="New goal..."
                autoFocus
                className="w-full px-2 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                onBlur={() => setShowNewGoal(false)}
              />
            </motion.form>
          )}
        </AnimatePresence>

        <ul className="space-y-0.5">
          {goals?.map((goal) => {
            const isExpanded = expandedGoals.has(goal._id);
            const missions = goal.missions || [];
            return (
              <li key={goal._id}>
                <div
                  onClick={() => toggleGoal(goal._id)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[var(--bg-hover)] transition-colors group"
                >
                  <ChevronRight
                    size={11}
                    className={`text-[var(--text-muted)] transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  />
                  <span className="text-sm">{goal.icon}</span>
                  <span className="text-[12px] font-medium flex-1 truncate">{goal.title}</span>
                  <div className="w-8 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${goal.progress}%`, background: goal.color }}
                    />
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && missions.length > 0 && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-5 pl-2 border-l border-[var(--border)] space-y-0.5 overflow-hidden"
                    >
                      {missions.map((m: any) => {
                        const st = MISSION_STATUS_ICON[m.status] || MISSION_STATUS_ICON.pending;
                        return (
                          <li
                            key={m._id}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--bg-hover)] cursor-pointer text-[11px] text-[var(--text-secondary)]"
                          >
                            <span style={{ color: st.color }}>{st.icon}</span>
                            <span className="flex-1 truncate">{m.title}</span>
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                              style={{ background: `color-mix(in srgb, ${st.color} 15%, transparent)`, color: st.color }}
                            >
                              {m.assignee}
                            </span>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="h-px bg-[var(--border)] mx-3 my-1" />

      {/* Agents */}
      <div className="flex-1 overflow-y-auto p-3 pt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            🤖 Team Status
          </span>
          <span className="text-[9px] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded text-[var(--text-muted)]">
            {agents?.filter((a) => a.status === "active" || a.status === "busy").length || 0} active
          </span>
        </div>
        <ul className="space-y-0.5">
          {agents?.map((agent) => (
            <li
              key={agent._id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            >
              <span className="text-sm">{agent.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold" style={{ color: agent.color }}>{agent.name}</div>
                <div className="text-[9px] text-[var(--text-muted)]">{agent.role}</div>
              </div>
              {agent.currentTask && (
                <span className="text-[9px] text-[var(--text-muted)] max-w-[70px] truncate">{agent.currentTask}</span>
              )}
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${agent.status === "active" ? "animate-pulse-dot" : ""}`}
                style={{ background: AGENT_STATUS_COLOR[agent.status] }}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-[var(--border)] mx-3" />

      {/* Bottom actions */}
      <div className="p-3">
        <button
          onClick={() => setShowNewGoal(true)}
          className="w-full py-2 rounded-lg text-xs font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors"
        >
          ＋ New Goal
        </button>
      </div>
    </div>
  );
}
