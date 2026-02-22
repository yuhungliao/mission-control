import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("memories").withIndex("by_category").collect();
  },
});

export const listByCategory = query({
  args: { category: v.union(v.literal("core"), v.literal("daily"), v.literal("reference")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const search = query({
  args: {
    query: v.string(),
    category: v.optional(v.union(v.literal("core"), v.literal("daily"), v.literal("reference"))),
  },
  handler: async (ctx, args) => {
    if (!args.query.trim()) {
      return await ctx.db.query("memories").withIndex("by_category").collect();
    }

    let q = ctx.db.query("memories").withSearchIndex("search_content", (q_) => {
      let search = q_.search("content", args.query);
      if (args.category) {
        search = search.eq("category", args.category);
      }
      return search;
    });

    const contentResults = await q.collect();

    // Also search titles
    let q2 = ctx.db.query("memories").withSearchIndex("search_title", (q_) => {
      let search = q_.search("title", args.query);
      if (args.category) {
        search = search.eq("category", args.category);
      }
      return search;
    });

    const titleResults = await q2.collect();

    // Merge and dedupe
    const seen = new Set<string>();
    const merged = [];
    for (const r of [...titleResults, ...contentResults]) {
      if (!seen.has(r._id)) {
        seen.add(r._id);
        merged.push(r);
      }
    }
    return merged;
  },
});

export const upsert = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    category: v.union(v.literal("core"), v.literal("daily"), v.literal("reference")),
    wordCount: v.number(),
    tags: v.optional(v.array(v.string())),
    sourceFile: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("memories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        syncedAt: now,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("memories", {
        ...args,
        syncedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
