import {
  createFileRoute,
  redirect,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@workspace/ui/components/sidebar";

import { Sidebar } from "@/components/sidebar";
import { authClient } from "@/lib/auth";
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
  },
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const { data: session } = authClient.useSession();

  const user = session?.user;
  const userName = user?.name ?? "";
  const userEmail = user?.email ?? "";
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  async function handleSignOut() {
    await authClient.signOut();
    await router.invalidate();
    navigate({ to: "/" });
  }

  function handleSwitchOrg() {
    navigate({ to: "/auth/organization", search: { rt: "/app" } });
  }

  return (
    <SidebarProvider className="h-dvh overflow-hidden">
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        userInitials={userInitials}
        onSignOut={handleSignOut}
        onSwitchOrg={handleSwitchOrg}
      />
      <SidebarRail />
      <SidebarInset className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
