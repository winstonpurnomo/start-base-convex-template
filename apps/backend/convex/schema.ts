import { defineSchema } from "convex/server";

import { resourceTable } from "./resource/schema";

export default defineSchema({
  resource: resourceTable,
});
