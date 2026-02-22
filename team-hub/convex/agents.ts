import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const listByDepartment = query({
  args: {
    department: v.union(
      v.literal("leadership"),
      v.literal("engineering"),
      v.literal("creative"),
      v.literal("intelligence"),
      v.literal("operations")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_department", (q) => q.eq("department", args.department))
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("agents"),
    status: v.optional(
      v.union(v.literal("active"), v.literal("idle"), v.literal("busy"), v.literal("offline"))
    ),
    totalTasks: v.optional(v.number()),
    lastActive: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const clean = Object.fromEntries(Object.entries(fields).filter(([_, v]) => v !== undefined));
    await ctx.db.patch(id, clean);
  },
});

export const remove = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").first();
    if (existing) return "already seeded";

    const now = Date.now();

    const agents = [
      {
        name: "Carrie",
        role: "Lead Agent & Orchestrator",
        emoji: "🐾",
        color: "#8b5cf6",
        department: "leadership" as const,
        description:
          "The brain of the operation. Carrie coordinates all sub-agents, manages Kevin's requests, handles complex multi-step tasks, and maintains the memory system. She decides which agent to delegate to and synthesizes their outputs.",
        capabilities: [
          "Task orchestration",
          "Memory management",
          "Multi-agent coordination",
          "Direct communication with Kevin",
          "Decision-making",
          "Context switching",
          "Tool integration",
        ],
        model: "claude-opus-4-6",
        isLead: true,
        status: "active" as const,
        totalTasks: 47,
        lastActive: now,
        createdAt: now - 86400000,
      },
      {
        name: "Kevin",
        role: "Human Boss",
        emoji: "👤",
        color: "#f59e0b",
        department: "leadership" as const,
        description:
          "The boss. Kevin defines goals, approves plans, and provides direction. Based in Taiwan, works across finance, investment, insurance, product development, and architecture.",
        capabilities: [
          "Strategic direction",
          "Final approval",
          "Domain expertise (finance, insurance)",
          "Product vision",
          "Resource allocation",
        ],
        isLead: true,
        status: "active" as const,
        totalTasks: 0,
        lastActive: now,
        createdAt: now - 86400000,
      },
      {
        name: "Nova",
        role: "Senior Developer",
        emoji: "💻",
        color: "#3b82f6",
        department: "engineering" as const,
        description:
          "Full-stack developer handling code implementation, debugging, architecture decisions, and technical reviews. Specializes in TypeScript, React, Next.js, and backend systems.",
        capabilities: [
          "Full-stack development",
          "Code review & debugging",
          "Architecture design",
          "Database schema design",
          "API development",
          "Performance optimization",
          "TypeScript / React / Next.js",
        ],
        model: "claude-sonnet-4-20250514",
        isLead: false,
        reportsTo: "Carrie",
        status: "idle" as const,
        totalTasks: 12,
        lastActive: now - 3600000,
        createdAt: now - 86400000,
      },
      {
        name: "Ink",
        role: "Content Writer",
        emoji: "✍️",
        color: "#10b981",
        department: "creative" as const,
        description:
          "Handles all written content — documentation, blog posts, copy, summaries, reports, and translations. Bilingual in English and Chinese. Adapts tone from technical docs to casual chat.",
        capabilities: [
          "Technical writing",
          "Blog & content creation",
          "Documentation",
          "Translation (EN ↔ ZH)",
          "Copy editing",
          "Report generation",
          "Summarization",
        ],
        model: "claude-sonnet-4-20250514",
        isLead: false,
        reportsTo: "Carrie",
        status: "idle" as const,
        totalTasks: 8,
        lastActive: now - 7200000,
        createdAt: now - 86400000,
      },
      {
        name: "Pixel",
        role: "UI/UX Designer",
        emoji: "🎨",
        color: "#ec4899",
        department: "creative" as const,
        description:
          "Designs interfaces, creates visual assets, defines color palettes and component systems. Thinks in terms of user flows, accessibility, and beautiful dark-mode interfaces.",
        capabilities: [
          "UI component design",
          "Color & typography systems",
          "Layout & responsive design",
          "Animation design",
          "Image generation prompts",
          "Accessibility review",
          "Design system maintenance",
        ],
        model: "claude-sonnet-4-20250514",
        isLead: false,
        reportsTo: "Carrie",
        status: "idle" as const,
        totalTasks: 5,
        lastActive: now - 14400000,
        createdAt: now - 86400000,
      },
      {
        name: "Scout",
        role: "Research Analyst",
        emoji: "🔍",
        color: "#06b6d4",
        department: "intelligence" as const,
        description:
          "Web research, competitive analysis, market data, trend tracking, and fact-checking. Gathers information from multiple sources and presents structured findings.",
        capabilities: [
          "Web research",
          "Market analysis",
          "Trend tracking",
          "Fact-checking",
          "Data aggregation",
          "Source evaluation",
          "Competitive intelligence",
        ],
        model: "claude-sonnet-4-20250514",
        isLead: false,
        reportsTo: "Carrie",
        status: "idle" as const,
        totalTasks: 6,
        lastActive: now - 10800000,
        createdAt: now - 86400000,
      },
      {
        name: "Ledger",
        role: "Finance & Data Analyst",
        emoji: "📊",
        color: "#f97316",
        department: "intelligence" as const,
        description:
          "Crunches numbers — financial projections, retirement calculations, investment analysis, expense tracking, and data visualization. Kevin's go-to for anything quantitative.",
        capabilities: [
          "Financial modeling",
          "Retirement planning",
          "Investment analysis",
          "Tax optimization",
          "Data visualization",
          "Budget tracking",
          "Insurance analysis",
        ],
        model: "claude-sonnet-4-20250514",
        isLead: false,
        reportsTo: "Carrie",
        status: "idle" as const,
        totalTasks: 4,
        lastActive: now - 21600000,
        createdAt: now - 86400000,
      },
      {
        name: "Sentinel",
        role: "Security & DevOps",
        emoji: "🛡️",
        color: "#ef4444",
        department: "operations" as const,
        description:
          "Manages infrastructure security, system health, deployment pipelines, and monitoring. Runs security audits, hardens configurations, and keeps everything running smoothly.",
        capabilities: [
          "Security auditing",
          "System hardening",
          "Infrastructure monitoring",
          "Deployment automation",
          "Backup management",
          "Network security",
          "Incident response",
        ],
        model: "claude-sonnet-4-20250514",
        isLead: false,
        reportsTo: "Carrie",
        status: "idle" as const,
        totalTasks: 3,
        lastActive: now - 28800000,
        createdAt: now - 86400000,
      },
    ];

    for (const agent of agents) {
      await ctx.db.insert("agents", agent);
    }

    // Seed some activity
    const activities = [
      { agentName: "Carrie", action: "Spawned sub-agent", detail: "Nova → Build TaskBoard app", timestamp: now - 7200000 },
      { agentName: "Nova", action: "Completed task", detail: "TaskBoard v1 deployed on port 3000", timestamp: now - 3600000 },
      { agentName: "Carrie", action: "Built app", detail: "Mission Control Calendar on port 3002", timestamp: now - 1800000 },
      { agentName: "Carrie", action: "Built app", detail: "Memory Vault on port 3003", timestamp: now - 900000 },
      { agentName: "Scout", action: "Research completed", detail: "GitHub trending + OpenClaw skills report", timestamp: now - 10800000 },
      { agentName: "Ledger", action: "Report generated", detail: "Kevin's retirement plan PDF", timestamp: now - 21600000 },
      { agentName: "Sentinel", action: "Audit completed", detail: "Security hardening — fixed config perms", timestamp: now - 28800000 },
      { agentName: "Ink", action: "Content created", detail: "OpenClaw security video study notes PDF", timestamp: now - 7200000 },
      { agentName: "Pixel", action: "Design delivered", detail: "Dark theme system for Mission Control apps", timestamp: now - 14400000 },
    ];

    for (const a of activities) {
      await ctx.db.insert("activity", a);
    }

    return `seeded ${agents.length} agents + ${activities.length} activities`;
  },
});
