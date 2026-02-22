import { query } from "./_generated/server";

export const recent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("activity")
      .withIndex("by_time")
      .order("desc")
      .take(20);
  },
});
