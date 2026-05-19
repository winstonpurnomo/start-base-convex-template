import {
  orgAuthedMutation,
  orgAuthedQuery,
} from "@workspace/backend/middleware";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

export const list = orgAuthedQuery({
  args: {
    organizationId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) =>
    await ctx.db.query("resource").paginate(args.paginationOpts),
});

export const create = orgAuthedMutation({
  args: {
    organizationId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) =>
    await ctx.db.insert("resource", {
      organizationId: args.organizationId,
      title: args.title,
    }),
});
