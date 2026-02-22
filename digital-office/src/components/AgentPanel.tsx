"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, CheckCircle2, Clock, Cpu, Activity } from "lucide-react";
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

interface ActivityItem {
  _id: string;
  agentName: string;
  action: string;
  detail?: string;
  timestamp: number;
}

interface Props {
  agent: Agent | null;
  activities: ActivityItem[];
  onClose: () => void;
}

const STATUS_MAP = {
  active: { label: "Working", color: "#10b981", bg: "rgba(16,185,129,0.15)" },
  busy: { label: "Deep Focus", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  idle: { label: "On Break", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  offline: { label: "Away", color: "#6b7280", bg: "rgba(107,114,128,0.15)" },
};

export default function AgentPanel({ agent, activities, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!agent) return null;

  const status = STATUS_MAP[agent.status];
  const agentActs = activities.filter((a) => a.agentName === agent.name);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="h-full w-[380px] bg-[var(--bg-floor)] border-l border-[var(--border)] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="relative h-36 p-5 flex items-end"
            style={{ background: `linear-gradient(135deg, ${agent.color}25, transparent)` }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/30 hover:bg-black/50 transition-colors"
            >
              <X size={14} />
            </button>
            <div className="flex items-end gap-3">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: agent.color + "25", border: `2px solid ${agent.color}50` }}
              >
                {agent.emoji}
              </div>
              <div>
                <h2 className="text-lg font-bold">{agent.name}</h2>
                <p className="text-xs" style={{ color: agent.color }}>{agent.role}</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5"
                style={{ background: status.bg, color: status.color }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-status-pulse" style={{ background: status.color }} />
                {status.label}
              </span>
              {agent.model && (
                <span className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                  <Cpu size={10} /> {agent.model}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {agent.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center py-2.5 rounded-xl bg-[var(--bg-desk)]">
                <div className="text-base font-bold">{agent.totalTasks}</div>
                <div className="text-[9px] text-[var(--text-muted)]">Tasks</div>
              </div>
              <div className="text-center py-2.5 rounded-xl bg-[var(--bg-desk)]">
                <div className="text-base font-bold">
                  {mounted && agent.lastActive ? formatDistanceToNow(new Date(agent.lastActive)) : "—"}
                </div>
                <div className="text-[9px] text-[var(--text-muted)]">Last Active</div>
              </div>
              <div className="text-center py-2.5 rounded-xl bg-[var(--bg-desk)]">
                <div className="text-base font-bold">{format(new Date(agent.createdAt), "M/d")}</div>
                <div className="text-[9px] text-[var(--text-muted)]">Joined</div>
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {agent.capabilities.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-2 py-1 rounded-lg bg-[var(--bg-desk)] text-[var(--text-secondary)]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Activity */}
            {agentActs.length > 0 && (
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1">
                  <Activity size={10} /> Recent Work
                </h3>
                <div className="space-y-1.5">
                  {agentActs.map((a) => (
                    <div key={a._id} className="flex items-start gap-2 py-1.5 px-2 rounded-lg bg-[var(--bg-desk)]">
                      <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: agent.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium">{a.action}</p>
                        {a.detail && <p className="text-[9px] text-[var(--text-muted)] truncate">{a.detail}</p>}
                      </div>
                      <span className="text-[9px] text-[var(--text-muted)] flex-shrink-0">
                        {mounted ? formatDistanceToNow(new Date(a.timestamp), { addSuffix: true }) : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports to */}
            {agent.reportsTo && (
              <div className="text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                Reports to <span className="font-medium text-[var(--text-secondary)]">{agent.reportsTo}</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
