import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByGoal = query({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("missions")
      .withIndex("by_goal", (q) => q.eq("goalId", args.goalId))
      .collect();
  },
});

export const create = mutation({
  args: {
    goalId: v.id("goals"),
    title: v.string(),
    description: v.optional(v.string()),
    assignee: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.query("missions").withIndex("by_goal", (q) => q.eq("goalId", args.goalId)).collect();
    const id = await ctx.db.insert("missions", {
      ...args,
      status: "pending",
      order: existing.length,
      createdAt: now,
      updatedAt: now,
    });
    // Recalc progress
    const all = [...existing, { status: "pending" }];
    const done = all.filter((m) => m.status === "done").length;
    await ctx.db.patch(args.goalId, { progress: Math.round((done / all.length) * 100), updatedAt: now });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("missions"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("assigned"), v.literal("in_progress"), v.literal("blocked"), v.literal("done"))),
    assignee: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const clean = Object.fromEntries(Object.entries(fields).filter(([_, v]) => v !== undefined));
    const mission = await ctx.db.get(id);
    if (!mission) return;
    await ctx.db.patch(id, { ...clean, updatedAt: Date.now() });
    // Recalc goal progress
    const missions = await ctx.db.query("missions").withIndex("by_goal", (q) => q.eq("goalId", mission.goalId)).collect();
    const updated = missions.map((m) => (m._id === id ? { ...m, ...clean } : m));
    const done = updated.filter((m) => m.status === "done").length;
    await ctx.db.patch(mission.goalId, { progress: Math.round((done / updated.length) * 100), updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("missions") },
  handler: async (ctx, args) => {
    const mission = await ctx.db.get(args.id);
    if (!mission) return;
    await ctx.db.delete(args.id);
    const remaining = await ctx.db.query("missions").withIndex("by_goal", (q) => q.eq("goalId", mission.goalId)).collect();
    const done = remaining.filter((m) => m.status === "done").length;
    const progress = remaining.length > 0 ? Math.round((done / remaining.length) * 100) : 0;
    await ctx.db.patch(mission.goalId, { progress, updatedAt: Date.now() });
  },
});
