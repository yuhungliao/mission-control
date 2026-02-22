"use client";

import { motion } from "framer-motion";
import { Zap, Clock, CheckCircle2, Wifi, WifiOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
}

interface Props {
  agent: Agent;
  onClick: () => void;
  index: number;
}

const STATUS_CONFIG = {
  active: { dot: "bg-emerald-400", label: "Active", ring: "ring-emerald-400/30" },
  idle: { dot: "bg-amber-400", label: "Idle", ring: "ring-amber-400/30" },
  busy: { dot: "bg-blue-400", label: "Busy", ring: "ring-blue-400/30" },
  offline: { dot: "bg-slate-500", label: "Offline", ring: "ring-slate-500/30" },
};

export default function AgentCard({ agent, onClick, index }: Props) {
  const status = STATUS_CONFIG[agent.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`
        glass rounded-2xl p-5 cursor-pointer transition-all duration-300
        hover:border-[color:var(--agent-color)] hover:shadow-[0_0_30px_-8px_var(--agent-color)]
        ${agent.isLead ? "col-span-1" : ""}
      `}
      style={{
        "--agent-color": agent.color,
        borderColor: "var(--border)",
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl relative"
            style={{ background: agent.color + "20" }}
          >
            {agent.emoji}
            {/* Status dot */}
            <div className="absolute -bottom-0.5 -right-0.5">
              <div className={`w-3 h-3 rounded-full ${status.dot} ring-2 ${status.ring} ring-offset-1 ring-offset-[var(--bg-secondary)]`} />
              {agent.status === "active" && (
                <div className={`absolute inset-0 w-3 h-3 rounded-full ${status.dot} animate-ping opacity-40`} />
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold">{agent.name}</h3>
            <p className="text-[11px] font-medium" style={{ color: agent.color }}>
              {agent.role}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3 leading-relaxed">
        {agent.description}
      </p>

      {/* Capabilities preview */}
      <div className="flex flex-wrap gap-1 mb-3">
        {agent.capabilities.slice(0, 3).map((cap) => (
          <span
            key={cap}
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: agent.color + "15", color: agent.color }}
          >
            {cap}
          </span>
        ))}
        {agent.capabilities.length > 3 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
            +{agent.capabilities.length - 3}
          </span>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={10} />
            {agent.totalTasks} tasks
          </span>
          {agent.model && (
            <span className="flex items-center gap-1 font-mono">
              <Zap size={10} />
              {agent.model.split("-").slice(-2, -1)[0] || agent.model}
            </span>
          )}
        </div>
        {agent.lastActive && (
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {formatDistanceToNow(new Date(agent.lastActive), { addSuffix: true })}
          </span>
        )}
      </div>
    </motion.div>
  );
}
