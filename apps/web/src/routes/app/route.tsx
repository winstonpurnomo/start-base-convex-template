import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

import { getSession } from "@/server/functions";

export const Route = createFileRoute("/app")({
  beforeLoad: async ({ location }) => {
    const data = await getSession();
    if (!data?.session) {
      throw redirect({
        to: "/auth/signin",
        search: {
          rt: location.pathname,
        },
      });
    } else if (!data.session.activeOrganizationId) {
      throw redirect({
        to: "/auth/organization",
        search: {
          rt: location.pathname,
        },
      });
    }
    return {
      ...data,
      session: {
        ...data.session,
        activeOrganizationId: data.session.activeOrganizationId as string,
      },
    };
  },
  component: Outlet,
});
