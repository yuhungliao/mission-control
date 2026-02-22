import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("agents"),
    status: v.optional(v.union(v.literal("active"), v.literal("idle"), v.literal("busy"), v.literal("offline"))),
    currentTask: v.optional(v.string()),
    lastActive: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const clean = Object.fromEntries(Object.entries(fields).filter(([_, v]) => v !== undefined));
    await ctx.db.patch(id, clean);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").first();
    if (existing) return "already seeded";
    const now = Date.now();
    const agents = [
      { name: "Kevin", role: "Human Boss", emoji: "👤", color: "#f59e0b", status: "active" as const, lastActive: now },
      { name: "Carrie", role: "Lead Agent", emoji: "🐾", color: "#8b5cf6", status: "active" as const, currentTask: "orchestrating", lastActive: now },
      { name: "Nova", role: "Developer", emoji: "💻", color: "#3b82f6", status: "idle" as const, lastActive: now - 3600000 },
      { name: "Ink", role: "Writer", emoji: "✍️", color: "#10b981", status: "idle" as const, lastActive: now - 7200000 },
      { name: "Pixel", role: "Designer", emoji: "🎨", color: "#ec4899", status: "idle" as const, lastActive: now - 14400000 },
      { name: "Scout", role: "Researcher", emoji: "🔍", color: "#06b6d4", status: "idle" as const, lastActive: now - 10800000 },
      { name: "Ledger", role: "Analyst", emoji: "📊", color: "#f97316", status: "idle" as const, lastActive: now - 21600000 },
      { name: "Sentinel", role: "Security", emoji: "🛡️", color: "#ef4444", status: "idle" as const, lastActive: now - 28800000 },
    ];
    for (const a of agents) await ctx.db.insert("agents", a);

    // Seed goals
    const g1 = await ctx.db.insert("goals", { title: "Build Mission Control", description: "Complete dashboard and all sub-systems", icon: "🏗️", color: "#8b5cf6", status: "active", progress: 80, order: 0, createdAt: now, updatedAt: now });
    const g2 = await ctx.db.insert("goals", { title: "退休規劃", description: "Complete retirement planning and applications", icon: "💰", color: "#f59e0b", status: "active", progress: 40, order: 1, createdAt: now, updatedAt: now });
    const g3 = await ctx.db.insert("goals", { title: "系統安全強化", description: "Harden Mac mini security posture", icon: "🔒", color: "#10b981", status: "active", progress: 60, order: 2, createdAt: now, updatedAt: now });

    // Seed missions
    const missions = [
      { goalId: g1, title: "TaskBoard app", status: "done" as const, assignee: "Nova", order: 0 },
      { goalId: g1, title: "Calendar app", status: "done" as const, assignee: "Carrie", order: 1 },
      { goalId: g1, title: "Memory Vault", status: "done" as const, assignee: "Carrie", order: 2 },
      { goalId: g1, title: "Team Hub + Digital Office", status: "done" as const, assignee: "Carrie", order: 3 },
      { goalId: g1, title: "Dashboard 微前端整合", status: "in_progress" as const, assignee: "Nova", order: 4 },
      { goalId: g1, title: "GitHub CI/CD", status: "pending" as const, assignee: "Sentinel", order: 5 },
      { goalId: g2, title: "退休計算 PDF", status: "done" as const, assignee: "Ledger", order: 0 },
      { goalId: g2, title: "勞退自提 6% 申請", status: "pending" as const, assignee: "Kevin", order: 1 },
      { goalId: g2, title: "Gap period 投資規劃", status: "pending" as const, assignee: "Ledger", order: 2 },
      { goalId: g3, title: "Security audit", status: "done" as const, assignee: "Sentinel", order: 0 },
      { goalId: g3, title: "Config permissions fix", status: "done" as const, assignee: "Sentinel", order: 1 },
      { goalId: g3, title: "Enable macOS Firewall", status: "pending" as const, assignee: "Kevin", order: 2 },
      { goalId: g3, title: "Gateway pairing fix", status: "done" as const, assignee: "Carrie", order: 3 },
    ];
    for (const m of missions) await ctx.db.insert("missions", { ...m, createdAt: now, updatedAt: now });

    // Seed activity
    const acts = [
      { agentName: "Carrie", action: "Built Dashboard mockup", timestamp: now - 600000 },
      { agentName: "Carrie", action: "Fixed gateway pairing", timestamp: now - 1800000 },
      { agentName: "Carrie", action: "Fixed TaskBoard (Kenny damage)", timestamp: now - 3600000 },
      { agentName: "Nova", action: "Deployed TaskBoard v1", timestamp: now - 7200000 },
      { agentName: "Sentinel", action: "Security audit completed", timestamp: now - 28800000 },
      { agentName: "Ledger", action: "Retirement plan PDF generated", timestamp: now - 21600000 },
    ];
    for (const a of acts) await ctx.db.insert("activity", a);
    return "seeded";
  },
});
