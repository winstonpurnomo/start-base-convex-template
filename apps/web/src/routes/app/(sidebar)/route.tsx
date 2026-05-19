import {
  createFileRoute,
  Outlet,
  useRouter,
  useLocation,
} from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@workspace/ui/components/sidebar";

import { Sidebar } from "@/components/sidebar";
import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/app/(sidebar)")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const location = useLocation();
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
    navigate({ to: "/auth/organization" });
  }

  function handleSettings() {
    navigate({ to: "/app/settings", search: { rt: location.pathname } });
  }

  return (
    <SidebarProvider className="h-dvh overflow-hidden">
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        userInitials={userInitials}
        onSignOut={handleSignOut}
        onSwitchOrg={handleSwitchOrg}
        onSettings={handleSettings}
      />
      <SidebarRail />
      <SidebarInset className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
