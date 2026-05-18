import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import z from "zod";

import { getSession } from "@/server/functions";

export const Route = createFileRoute("/auth/(redir)")({
  validateSearch: z.object({
    rt: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    const data = await getSession();
    if (data?.session) {
      // oxlint-disable-next-line unicorn/prefer-ternary
      if (data.session.activeOrganizationId) {
        throw redirect({ to: search.rt ?? "/app" });
      } else {
        throw redirect({
          to: "/auth/organization",
          search: {
            rt: search.rt,
          },
        });
      }
    }
  },
  component: Outlet,
});
