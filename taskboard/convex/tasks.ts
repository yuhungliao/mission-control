import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("status"), args.status))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    assignee: v.union(v.literal("kevin"), v.literal("carrie")),
    tags: v.optional(v.array(v.string())),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("status"), args.status))
      .collect();
    const maxOrder = existing.reduce((max, t) => Math.max(max, t.order), -1);
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      ...args,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("done")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    assignee: v.optional(v.union(v.literal("kevin"), v.literal("carrie"))),
    tags: v.optional(v.array(v.string())),
    dueDate: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const moveTask = mutation({
  args: {
    id: v.id("tasks"),
    newStatus: v.union(
      v.literal("backlog"),
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.newStatus,
      order: args.newOrder,
      updatedAt: Date.now(),
    });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("tasks").collect();
    if (existing.length > 0) return;
    const now = Date.now();
    const tasks = [
      { title: "Set up OpenClaw security audit schedule", description: "Configure periodic security audits via cron", status: "done" as const, priority: "high" as const, assignee: "carrie" as const, tags: ["security", "openclaw"], order: 0 },
      { title: "Fix gateway pairing for sub-agents", description: "Resolve device pairing issues blocking sub-agents and browser tools", status: "in_progress" as const, priority: "urgent" as const, assignee: "carrie" as const, tags: ["openclaw", "infra"], order: 0 },
      { title: "Review retirement plan PDF", description: "Review the retirement plan and verify calculations with HR", status: "todo" as const, priority: "medium" as const, assignee: "kevin" as const, tags: ["personal", "finance"], order: 0 },
      { title: "Enable macOS Firewall", description: "Turn on firewall via System Settings → Network → Firewall", status: "todo" as const, priority: "high" as const, assignee: "kevin" as const, tags: ["security"], order: 1 },
      { title: "Apply for 勞退自提 6%", description: "Submit self-contribution application to HR at 仲琦科技", status: "todo" as const, priority: "high" as const, assignee: "kevin" as const, tags: ["finance", "retirement"], order: 2 },
      { title: "Research top OpenClaw skills for installation", description: "Evaluate and install safe, high-impact skills from curated lists", status: "backlog" as const, priority: "medium" as const, assignee: "carrie" as const, tags: ["openclaw", "research"], order: 0 },
    ];
    for (const task of tasks) {
      await ctx.db.insert("tasks", { ...task, createdAt: now, updatedAt: now });
    }
  },
});
