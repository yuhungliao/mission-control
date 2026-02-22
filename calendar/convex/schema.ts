import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
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
    // Scheduling
    startTime: v.number(), // epoch ms
    endTime: v.optional(v.number()),
    allDay: v.boolean(),
    // Recurrence (cron-style)
    recurring: v.boolean(),
    cronExpression: v.optional(v.string()), // e.g. "0 9 * * 1" (Mon 9am)
    cronLabel: v.optional(v.string()), // human-readable: "Every Monday at 9am"
    // Metadata
    color: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    lastRun: v.optional(v.number()),
    nextRun: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_start", ["startTime"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"]),
});
