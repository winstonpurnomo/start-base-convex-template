import { defineSchema } from "convex/server";

import { tables } from "./schema.gen";

export default defineSchema({
  ...tables,
  member: tables.member.index("organizationId_userId", [
    "organizationId",
    "userId",
  ]),
});
