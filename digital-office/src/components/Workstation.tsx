"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Agent {
  _id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  department: string;
  status: "active" | "idle" | "busy" | "offline";
  totalTasks: number;
  lastActive?: number;
  capabilities: string[];
  model?: string;
}

interface Props {
  agent: Agent;
  onClick: () => void;
  index: number;
}

const STATUS_TEXT: Record<string, string> = {
  active: "Working...",
  busy: "Deep focus",
  idle: "On break",
  offline: "Away",
};

const SCREEN_CONTENT: Record<string, { lines: string[]; color: string }> = {
  Carrie: {
    lines: [
      "📋 Orchestrating tasks...",
      "├─ Nova: build UI ✓",
      "├─ Scout: research ◌",
      "├─ Ink: write docs ◌",
      "└─ Checking status...",
      "> spawn_agent nova",
      "> monitor heartbeat",
      "✓ All systems nominal",
    ],
    color: "#8b5cf6",
  },
  Kevin: {
    lines: [
      "📊 Dashboard",
      "┌─────────────────┐",
      "│ Revenue   ▲ 12% │",
      "│ Tasks     47/52 │",
      "│ Agents    7 OK  │",
      "└─────────────────┘",
      "> review proposals",
      "> approve deploy",
    ],
    color: "#f59e0b",
  },
  Nova: {
    lines: [
      "const app = () => {",
      "  const data = useQ(",
      "    api.tasks.list",
      "  );",
      "  return (",
      "    <Board>",
      "      {data.map(t =>",
      "        <Card {...t}/>",
      "      )}",
      "    </Board>",
      "  );",
      "};",
    ],
    color: "#3b82f6",
  },
  Ink: {
    lines: [
      "# Documentation",
      "",
      "## Getting Started",
      "Install the package",
      "using npm or yarn:",
      "",
      "```bash",
      "npm install openclaw",
      "```",
      "",
      "Then configure your",
      "gateway settings...",
    ],
    color: "#10b981",
  },
  Pixel: {
    lines: [
      "🎨 Design System v2",
      "┌──────────────────┐",
      "│ ■ primary #8b5cf6│",
      "│ ■ accent  #6366f1│",
      "│ ■ success #10b981│",
      "│ ■ danger  #ef4444│",
      "├──────────────────┤",
      "│ border-radius: 12│",
      "│ spacing: 4px grid│",
      "└──────────────────┘",
    ],
    color: "#ec4899",
  },
  Scout: {
    lines: [
      "🔍 Research Queue",
      "─────────────────",
      "▸ GitHub trending",
      "  ✓ 10 repos found",
      "▸ Market analysis",
      "  ◌ scanning...",
      "▸ Competitor watch",
      "  ◌ 3 new entries",
      "▸ News aggregation",
      "  ✓ 24 articles",
    ],
    color: "#06b6d4",
  },
  Ledger: {
    lines: [
      "📊 Financial Model",
      "─────────────────",
      "Retirement Fund:",
      "  Employer: $3.7M",
      "  Self:     $3.7M",
      "  Total:    $7.4M",
      "─────────────────",
      "Monthly: $230,000",
      "Gap: 2028→2036",
      "Status: ON TRACK ✓",
    ],
    color: "#f97316",
  },
  Sentinel: {
    lines: [
      "🛡️ Security Scan",
      "─────────────────",
      "▸ Firewall: ⚠ OFF",
      "▸ FileVault: ✓ ON",
      "▸ Perms: ✓ 600",
      "▸ Gateway: ✓ OK",
      "▸ Ports: 5 open",
      "▸ SSH: ✓ secured",
      "─────────────────",
      "Score: 85/100",
    ],
    color: "#ef4444",
  },
};

function Avatar({ agent, isWorking }: { agent: Agent; isWorking: boolean }) {
  const skinColor = "#ffd7a3";
  const hairColor = agent.name === "Kevin" ? "#2c2c2c" : agent.color;

  return (
    <div className={`relative ${isWorking ? "" : "animate-breathe"}`}>
      <svg width="48" height="56" viewBox="0 0 48 56">
        {/* Body/shirt */}
        <ellipse cx="24" cy="48" rx="14" ry="10" fill={agent.color} opacity="0.9" />
        {/* Neck */}
        <rect x="20" y="32" width="8" height="6" rx="2" fill={skinColor} />
        {/* Head */}
        <ellipse cx="24" cy="24" rx="12" ry="14" fill={skinColor} />
        {/* Hair */}
        <ellipse cx="24" cy="17" rx="12" ry="9" fill={hairColor} />
        {/* Eyes */}
        <g className={isWorking ? "" : "animate-blink"} style={{ transformOrigin: "24px 24px" }}>
          <ellipse cx="19" cy="25" rx="2" ry="2.5" fill="#2c2c2c" />
          <ellipse cx="29" cy="25" rx="2" ry="2.5" fill="#2c2c2c" />
          {/* Eye shine */}
          <circle cx="20" cy="24" r="0.8" fill="white" />
          <circle cx="30" cy="24" r="0.8" fill="white" />
        </g>
        {/* Mouth */}
        {isWorking ? (
          // Focused expression
          <line x1="21" y1="30" x2="27" y2="30" stroke="#c4956a" strokeWidth="1.5" strokeLinecap="round" />
        ) : (
          // Smile
          <path d="M 20 29 Q 24 33 28 29" stroke="#c4956a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        )}
        {/* Agent emoji badge */}
        <text x="36" y="14" fontSize="12">{agent.emoji}</text>
      </svg>
    </div>
  );
}

function Monitor({ agent, isOn }: { agent: Agent; isOn: boolean }) {
  const content = SCREEN_CONTENT[agent.name] || SCREEN_CONTENT["Carrie"];

  return (
    <div className="relative">
      {/* Monitor frame */}
      <div
        className={`
          w-[180px] h-[110px] rounded-lg border-2 relative overflow-hidden
          ${isOn ? "animate-screen-glow" : ""}
        `}
        style={{
          borderColor: isOn ? agent.color + "60" : "var(--border)",
          background: isOn ? "var(--bg-screen-on)" : "var(--bg-screen-off)",
          "--glow-color": agent.color + "40",
        } as React.CSSProperties}
      >
        {isOn ? (
          <div className="p-2 h-full overflow-hidden">
            {/* Screen content */}
            <div className={agent.name === "Nova" ? "animate-code-scroll" : ""}>
              {content.lines.map((line, i) => (
                <div
                  key={i}
                  className="text-[9px] font-mono leading-[1.4] whitespace-pre"
                  style={{ color: i === 0 ? content.color : "var(--text-secondary)" }}
                >
                  {line}
                </div>
              ))}
              {/* Duplicate for scroll animation */}
              {agent.name === "Nova" &&
                content.lines.map((line, i) => (
                  <div
                    key={`dup-${i}`}
                    className="text-[9px] font-mono leading-[1.4] whitespace-pre"
                    style={{ color: i === 0 ? content.color : "var(--text-secondary)" }}
                  >
                    {line}
                  </div>
                ))}
            </div>
            {/* Cursor */}
            <div
              className="absolute bottom-2 left-2 w-1.5 h-3 animate-cursor-blink"
              style={{ background: content.color }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-2 h-2 rounded-full bg-[var(--border)]" />
          </div>
        )}
      </div>
      {/* Monitor stand */}
      <div className="flex justify-center">
        <div className="w-3 h-4 bg-[var(--border-light)]" />
        <div className="absolute -bottom-1 w-12 h-1.5 rounded-full bg-[var(--border-light)]" style={{ left: "calc(50% - 24px)" }} />
      </div>
    </div>
  );
}

export default function Workstation({ agent, onClick, index }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isWorking = agent.status === "active" || agent.status === "busy";
  const isPresent = agent.status !== "offline";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="flex flex-col items-center gap-1 relative">
        {/* Status bubble */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.08 + 0.3, type: "spring" }}
          className={`
            absolute -top-6 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap z-10
            ${isWorking ? "animate-status-pulse" : ""}
          `}
          style={{
            background: agent.color + "20",
            color: agent.color,
            border: `1px solid ${agent.color}30`,
          }}
        >
          {STATUS_TEXT[agent.status]}
        </motion.div>

        {/* Desk area */}
        <div
          className="relative p-4 pt-8 rounded-2xl transition-all duration-300 group-hover:scale-[1.03]"
          style={{
            background: `linear-gradient(180deg, var(--wall) 0%, var(--wall-accent) 100%)`,
            border: `1px solid ${isWorking ? agent.color + "30" : "var(--border)"}`,
            boxShadow: isWorking ? `0 0 40px -10px ${agent.color}20` : "none",
          }}
        >
          {/* Wall decorations */}
          <div className="absolute top-2 right-3 text-[10px] opacity-30">{agent.emoji}</div>

          {/* Monitor */}
          <div className="flex justify-center mb-2">
            <Monitor agent={agent} isOn={isPresent} />
          </div>

          {/* Desk surface */}
          <div
            className="w-[200px] h-[8px] rounded-sm mx-auto relative"
            style={{ background: "#2a1f14", border: "1px solid #3d2f20" }}
          >
            {/* Keyboard */}
            {isWorking && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="flex gap-[1px]">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-1.5 rounded-[1px] ${
                        isWorking ? "animate-typing" : ""
                      }`}
                      style={{
                        background: "var(--border-light)",
                        animationDelay: `${i * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Coffee mug */}
            <div className="absolute -top-4 -right-1 text-[10px]">☕</div>

            {/* Small items */}
            {agent.name === "Pixel" && (
              <div className="absolute -top-4 -left-1 text-[10px]">🖌️</div>
            )}
            {agent.name === "Sentinel" && (
              <div className="absolute -top-4 -left-1 text-[10px]">🔒</div>
            )}
            {agent.name === "Ledger" && (
              <div className="absolute -top-4 -left-1 text-[10px]">📱</div>
            )}
          </div>

          {/* Chair + Avatar */}
          <div className="flex justify-center mt-1 relative">
            {isPresent ? (
              <div className={isWorking ? "" : "animate-float"}>
                <Avatar agent={agent} isWorking={isWorking} />
              </div>
            ) : (
              // Empty chair
              <div className="w-[48px] h-[56px] flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <rect x="8" y="5" width="24" height="20" rx="4" fill="var(--border)" opacity="0.5" />
                  <rect x="10" y="25" width="20" height="4" rx="2" fill="var(--border)" opacity="0.4" />
                  <line x1="12" y1="29" x2="10" y2="38" stroke="var(--border)" strokeWidth="2" opacity="0.3" />
                  <line x1="28" y1="29" x2="30" y2="38" stroke="var(--border)" strokeWidth="2" opacity="0.3" />
                </svg>
              </div>
            )}
          </div>

          {/* Name plate */}
          <div className="text-center mt-1">
            <div className="text-xs font-bold" style={{ color: agent.color }}>
              {agent.name}
            </div>
            <div className="text-[9px] text-[var(--text-muted)] truncate max-w-[180px]">
              {agent.role}
            </div>
          </div>

          {/* Task counter */}
          <div className="flex justify-center mt-1">
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: agent.color + "15", color: agent.color }}>
              {agent.totalTasks} tasks
              {mounted && agent.lastActive && (
                <span className="opacity-60 ml-1">
                  · {formatDistanceToNow(new Date(agent.lastActive), { addSuffix: false })}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Floor shadow */}
        <div
          className="w-[160px] h-[6px] rounded-full mx-auto opacity-20 blur-sm"
          style={{ background: agent.color }}
        />
      </div>
    </motion.div>
  );
}
