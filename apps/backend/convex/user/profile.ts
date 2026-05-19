import { v } from "convex/values";

import { mutation } from "../_generated/server";
import { authComponent, createAuth } from "../auth";
import { userAuthedMutation, userAuthedQuery } from "../middleware";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

export const getProfile = userAuthedQuery({
  args: {},
  handler: async (ctx) => ({
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      image: ctx.user.image,
    }),
});

export const updateProfile = userAuthedMutation({
  args: {
    name: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    const patch: { name?: string; image?: string } = {};

    if (args.name !== undefined) {
      patch.name = args.name;
    }

    if (args.imageStorageId !== undefined) {
      const url = await ctx.storage.getUrl(args.imageStorageId);
      if (url) {patch.image = url;}
    }

    if (Object.keys(patch).length > 0) {
      await auth.api.updateUser({ headers, body: patch });
    }
  },
});
