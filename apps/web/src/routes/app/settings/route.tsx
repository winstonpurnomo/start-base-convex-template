import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  Sidebar as SidebarPrimitive,
} from "@workspace/ui/components/sidebar";
import { ChevronLeftIcon, PaletteIcon } from "lucide-react";
import z from "zod";

export const Route = createFileRoute("/app/settings")({
  validateSearch: z.object({
    rt: z.string().optional(),
  }),
  beforeLoad: ({ location }) => {
    if (location.pathname === "/app/settings") {
      throw redirect({ to: "/app/settings/theme" });
    }
  },
  component: RouteComponent,
});

const settingsNav = [
  { label: "Theme", icon: PaletteIcon, to: "/app/settings/theme" },
] as const;

function SettingsSidebar({ backTo }: { backTo: string }) {
  const location = useLocation();

  return (
    <SidebarPrimitive collapsible="offcanvas">
      <SidebarHeader className="md:hidden h-14" />
      <SidebarHeader className="hidden md:flex h-14 justify-center px-4 border-b border-sidebar-border">
        <Link
          to={backTo}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeftIcon className="size-4" />
          Back to app
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsNav.map(({ label, icon: Icon, to }) => (
                <SidebarMenuItem key={to}>
                  <Link to={to}>
                    <SidebarMenuButton isActive={location.pathname === to}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarPrimitive>
  );
}

function RouteComponent() {
  const search = Route.useSearch();
  const backTo = search.rt ?? "/app";

  return (
    <SidebarProvider className="h-dvh overflow-hidden">
      <SettingsSidebar backTo={backTo} />
      <SidebarRail />
      <SidebarInset className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Link
            to={backTo}
            className="md:hidden flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors -ml-1"
          >
            <ChevronLeftIcon className="size-4" />
            Settings
          </Link>
          <span className="hidden md:block text-sm font-semibold">
            Settings
          </span>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
