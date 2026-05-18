import { defineSchema } from "convex/server";

import { tables } from "./schema.gen";

export default defineSchema({
  ...tables,
});
