import { defineTable } from "convex/server";
import { v } from "convex/values";

export const resourceSchema = {
  organizationId: v.string(),
  title: v.string(),
};

export const resourceValidator = v.object(resourceSchema);

export const resourceTable = defineTable(resourceSchema);
