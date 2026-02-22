import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  goals: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    icon: v.string(),
    color: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
      v.literal("cancelled")
    ),
    progress: v.number(), // 0-100, auto-calculated from missions
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status", "order"])
    .index("by_order", ["order"]),

  missions: defineTable({
    goalId: v.id("goals"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("blocked"),
      v.literal("done")
    ),
    assignee: v.string(), // agent name
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_goal", ["goalId", "order"])
    .index("by_assignee", ["assignee"])
    .index("by_status", ["status"]),

  agents: defineTable({
    name: v.string(),
    role: v.string(),
    emoji: v.string(),
    color: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("idle"),
      v.literal("busy"),
      v.literal("offline")
    ),
    currentTask: v.optional(v.string()),
    lastActive: v.optional(v.number()),
  }).index("by_name", ["name"]),

  activity: defineTable({
    agentName: v.string(),
    action: v.string(),
    detail: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_time", ["timestamp"]),
});
