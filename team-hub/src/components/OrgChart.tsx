"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface Agent {
  _id: string;
  name: string;
  emoji: string;
  color: string;
  role: string;
  department: string;
  isLead: boolean;
  reportsTo?: string;
  status: "active" | "idle" | "busy" | "offline";
}

interface Props {
  agents: Agent[];
  onSelect: (agent: Agent) => void;
}

const STATUS_DOT = {
  active: "bg-emerald-400",
  idle: "bg-amber-400",
  busy: "bg-blue-400",
  offline: "bg-slate-500",
};

export default function OrgChart({ agents, onSelect }: Props) {
  const kevin = agents.find((a) => a.name === "Kevin");
  const carrie = agents.find((a) => a.name === "Carrie");
  const reports = agents.filter((a) => a.reportsTo === "Carrie");

  return (
    <div className="flex flex-col items-center gap-2 py-8">
      {/* Kevin */}
      {kevin && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <Node agent={kevin} onClick={() => onSelect(kevin)} size="lg" />
          <div className="w-px h-6 bg-[var(--border)]" />
        </motion.div>
      )}

      {/* Carrie */}
      {carrie && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <Node agent={carrie} onClick={() => onSelect(carrie)} size="lg" />
          <div className="w-px h-6 bg-[var(--border)]" />
        </motion.div>
      )}

      {/* Horizontal connector */}
      {reports.length > 0 && (
        <div className="relative w-full max-w-4xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-[var(--border)]"
            style={{ width: `${Math.min(reports.length * 140, 800)}px` }} />
        </div>
      )}

      {/* Reports */}
      <div className="flex flex-wrap justify-center gap-4 mt-0">
        {reports.map((agent, i) => (
          <motion.div
            key={agent._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="flex flex-col items-center"
          >
            <div className="w-px h-4 bg-[var(--border)]" />
            <Node agent={agent} onClick={() => onSelect(agent)} size="sm" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Node({
  agent,
  onClick,
  size,
}: {
  agent: Agent;
  onClick: () => void;
  size: "lg" | "sm";
}) {
  const isLg = size === "lg";

  return (
    <button
      onClick={onClick}
      className={`
        group flex flex-col items-center gap-1 transition-transform hover:scale-105
        ${isLg ? "min-w-[120px]" : "min-w-[100px]"}
      `}
    >
      <div
        className={`
          relative rounded-2xl flex items-center justify-center
          transition-shadow group-hover:shadow-[0_0_24px_-4px_var(--node-color)]
          ${isLg ? "w-16 h-16 text-3xl" : "w-12 h-12 text-xl"}
        `}
        style={{
          "--node-color": agent.color,
          background: agent.color + "20",
          border: `2px solid ${agent.color}40`,
        } as React.CSSProperties}
      >
        {agent.emoji}
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${STATUS_DOT[agent.status]} ring-2 ring-[var(--bg-primary)]`} />
      </div>
      <span className={`font-semibold ${isLg ? "text-sm" : "text-xs"}`}>{agent.name}</span>
      <span className="text-[10px] text-[var(--text-muted)] text-center max-w-[100px] truncate">
        {agent.role}
      </span>
    </button>
  );
}
