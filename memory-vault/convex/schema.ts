import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  memories: defineTable({
    slug: v.string(), // unique key, e.g. "MEMORY" or "2026-02-21"
    title: v.string(),
    content: v.string(), // raw markdown
    category: v.union(
      v.literal("core"),      // MEMORY.md, SOUL.md, IDENTITY.md, etc.
      v.literal("daily"),     // memory/YYYY-MM-DD.md
      v.literal("reference"), // USER.md, TOOLS.md, AGENTS.md
    ),
    wordCount: v.number(),
    tags: v.optional(v.array(v.string())),
    sourceFile: v.string(), // original file path
    syncedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category", "updatedAt"])
    .index("by_synced", ["syncedAt"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["category"],
    })
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["category"],
    }),
});
