import { createServerFn } from "@tanstack/react-start";
import { api } from "@workspace/backend/_generated/api";

import { fetchAuthQuery } from "@/lib/auth.server";

export const getSession = createServerFn().handler(
  async () => await fetchAuthQuery(api.auth.getSession)
);
