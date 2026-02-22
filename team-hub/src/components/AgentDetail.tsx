"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, CheckCircle2, Clock, ArrowUpRight, Shield } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface Agent {
  _id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  department: string;
  description: string;
  capabilities: string[];
  model?: string;
  isLead: boolean;
  reportsTo?: string;
  status: "active" | "idle" | "busy" | "offline";
  totalTasks: number;
  lastActive?: number;
  createdAt: number;
}

interface Activity {
  _id: string;
  agentName: string;
  action: string;
  detail?: string;
  timestamp: number;
}

interface Props {
  agent: Agent | null;
  activities: Activity[];
  onClose: () => void;
}

const DEPT_LABELS: Record<string, string> = {
  leadership: "🏛️ Leadership",
  engineering: "⚙️ Engineering",
  creative: "🎨 Creative",
  intelligence: "🧠 Intelligence",
  operations: "🛡️ Operations",
};

const STATUS_CONFIG = {
  active: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Active" },
  idle: { bg: "bg-amber-500/15", text: "text-amber-400", label: "Idle" },
  busy: { bg: "bg-blue-500/15", text: "text-blue-400", label: "Busy" },
  offline: { bg: "bg-slate-500/15", text: "text-slate-400", label: "Offline" },
};

export default function AgentDetail({ agent, activities, onClose }: Props) {
  if (!agent) return null;

  const status = STATUS_CONFIG[agent.status];
  const agentActivities = activities.filter((a) => a.agentName === agent.name);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="glass rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hero banner */}
          <div
            className="relative h-32 rounded-t-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${agent.color}30, ${agent.color}08)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-secondary)]" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg bg-black/30 hover:bg-black/50 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-4 left-6 flex items-end gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                style={{ background: agent.color + "25", border: `2px solid ${agent.color}40` }}
              >
                {agent.emoji}
              </div>
              <div className="mb-1">
                <h2 className="text-xl font-bold">{agent.name}</h2>
                <p className="text-sm font-medium" style={{ color: agent.color }}>
                  {agent.role}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Meta row */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.bg} ${status.text}`}>
                {status.label}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                {DEPT_LABELS[agent.department]}
              </span>
              {agent.reportsTo && (
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <ArrowUpRight size={12} /> Reports to {agent.reportsTo}
                </span>
              )}
              {agent.model && (
                <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1">
                  <Zap size={12} /> {agent.model}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{agent.description}</p>

            {/* Capabilities */}
            <div>
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Capabilities
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {agent.capabilities.map((cap) => (
                  <div
                    key={cap}
                    className="flex items-center gap-2 text-sm text-[var(--text-secondary)] py-1.5 px-3 rounded-lg bg-[var(--bg-tertiary)]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: agent.color }} />
                    {cap}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center py-3 rounded-xl bg-[var(--bg-tertiary)]">
                <div className="text-lg font-bold">{agent.totalTasks}</div>
                <div className="text-[10px] text-[var(--text-muted)]">Tasks Completed</div>
              </div>
              <div className="text-center py-3 rounded-xl bg-[var(--bg-tertiary)]">
                <div className="text-lg font-bold">
                  {agent.lastActive ? formatDistanceToNow(new Date(agent.lastActive)) : "—"}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">Last Active</div>
              </div>
              <div className="text-center py-3 rounded-xl bg-[var(--bg-tertiary)]">
                <div className="text-lg font-bold">
                  {format(new Date(agent.createdAt), "MMM d")}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">Created</div>
              </div>
            </div>

            {/* Recent activity */}
            {agentActivities.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Recent Activity
                </h3>
                <div className="space-y-2">
                  {agentActivities.map((a) => (
                    <div
                      key={a._id}
                      className="flex items-start gap-3 py-2 px-3 rounded-lg bg-[var(--bg-tertiary)]"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: agent.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{a.action}</p>
                        {a.detail && (
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">
                            {a.detail}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">
                        {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
