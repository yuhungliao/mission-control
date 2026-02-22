import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("events").withIndex("by_start");
    if (args.from !== undefined) {
      q = q.filter((q_) => q_.gte(q_.field("startTime"), args.from!));
    }
    if (args.to !== undefined) {
      q = q.filter((q_) => q_.lte(q_.field("startTime"), args.to!));
    }
    return await q.collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").withIndex("by_start").collect();
  },
});

export const get = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("cron"),
      v.literal("scheduled"),
      v.literal("reminder"),
      v.literal("meeting"),
      v.literal("deadline")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    assignee: v.union(v.literal("kevin"), v.literal("carrie"), v.literal("both")),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    allDay: v.boolean(),
    recurring: v.boolean(),
    cronExpression: v.optional(v.string()),
    cronLabel: v.optional(v.string()),
    color: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    nextRun: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("events", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("cron"),
        v.literal("scheduled"),
        v.literal("reminder"),
        v.literal("meeting"),
        v.literal("deadline")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("paused"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    assignee: v.optional(v.union(v.literal("kevin"), v.literal("carrie"), v.literal("both"))),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    allDay: v.optional(v.boolean()),
    recurring: v.optional(v.boolean()),
    cronExpression: v.optional(v.string()),
    cronLabel: v.optional(v.string()),
    color: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    lastRun: v.optional(v.number()),
    nextRun: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Event not found");
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("events").first();
    if (existing) return "already seeded";

    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const day = 24 * hour;

    const events = [
      {
        title: "Heartbeat Check",
        description: "Periodic system health check — emails, calendar, weather, mentions",
        type: "cron" as const,
        status: "active" as const,
        assignee: "carrie" as const,
        startTime: now,
        allDay: false,
        recurring: true,
        cronExpression: "*/30 * * * *",
        cronLabel: "Every 30 minutes",
        color: "#6366f1",
        tags: ["system", "monitoring"],
        nextRun: now + 30 * 60 * 1000,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Memory Maintenance",
        description: "Review daily memory files, update MEMORY.md with long-term insights",
        type: "cron" as const,
        status: "active" as const,
        assignee: "carrie" as const,
        startTime: now,
        allDay: false,
        recurring: true,
        cronExpression: "0 2 */3 * *",
        cronLabel: "Every 3 days at 2am",
        color: "#8b5cf6",
        tags: ["memory", "maintenance"],
        nextRun: now + 3 * day,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "勞退自提6% — Apply ASAP",
        description: "Apply for voluntary 6% labor pension contribution. Critical for retirement gap coverage.",
        type: "deadline" as const,
        status: "active" as const,
        assignee: "kevin" as const,
        startTime: now + 7 * day,
        allDay: true,
        recurring: false,
        color: "#ef4444",
        tags: ["finance", "retirement", "urgent"],
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Check Anthropic Billing",
        description: "Review API usage and costs at console.anthropic.com",
        type: "reminder" as const,
        status: "active" as const,
        assignee: "kevin" as const,
        startTime: now + 2 * day,
        allDay: false,
        recurring: true,
        cronExpression: "0 10 * * 1",
        cronLabel: "Every Monday at 10am",
        color: "#f59e0b",
        tags: ["finance", "infra"],
        nextRun: now + 7 * day,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Enable macOS Firewall",
        description: "System Settings → Network → Firewall → Enable. Or: sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on",
        type: "scheduled" as const,
        status: "active" as const,
        assignee: "kevin" as const,
        startTime: now + day,
        allDay: true,
        recurring: false,
        color: "#ef4444",
        tags: ["security", "setup"],
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const event of events) {
      await ctx.db.insert("events", event);
    }
    return `seeded ${events.length} events`;
  },
});
