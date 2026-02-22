import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const goals = await ctx.db.query("goals").withIndex("by_order").collect();
    const goalsWithMissions = await Promise.all(
      goals.map(async (goal) => {
        const missions = await ctx.db
          .query("missions")
          .withIndex("by_goal", (q) => q.eq("goalId", goal._id))
          .collect();
        return { ...goal, missions };
      })
    );
    return goalsWithMissions;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    icon: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.query("goals").collect();
    return await ctx.db.insert("goals", {
      ...args,
      status: "active",
      progress: 0,
      order: existing.length,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("goals"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("paused"), v.literal("cancelled"))),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const clean = Object.fromEntries(Object.entries(fields).filter(([_, v]) => v !== undefined));
    await ctx.db.patch(id, { ...clean, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    const missions = await ctx.db.query("missions").withIndex("by_goal", (q) => q.eq("goalId", args.id)).collect();
    for (const m of missions) await ctx.db.delete(m._id);
    await ctx.db.delete(args.id);
  },
});

export const recalcProgress = mutation({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    const missions = await ctx.db.query("missions").withIndex("by_goal", (q) => q.eq("goalId", args.goalId)).collect();
    if (missions.length === 0) return;
    const done = missions.filter((m) => m.status === "done").length;
    const progress = Math.round((done / missions.length) * 100);
    await ctx.db.patch(args.goalId, { progress, updatedAt: Date.now() });
  },
});
