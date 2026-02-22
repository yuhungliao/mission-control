import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    emoji: v.string(),
    color: v.string(),
    department: v.union(
      v.literal("leadership"),
      v.literal("engineering"),
      v.literal("creative"),
      v.literal("intelligence"),
      v.literal("operations")
    ),
    description: v.string(),
    capabilities: v.array(v.string()),
    model: v.optional(v.string()),
    isLead: v.boolean(),
    reportsTo: v.optional(v.string()), // agent name
    status: v.union(
      v.literal("active"),
      v.literal("idle"),
      v.literal("busy"),
      v.literal("offline")
    ),
    totalTasks: v.number(),
    lastActive: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_department", ["department"])
    .index("by_name", ["name"])
    .index("by_status", ["status"]),

  activity: defineTable({
    agentName: v.string(),
    action: v.string(),
    detail: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_time", ["timestamp"]),
});
