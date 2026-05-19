import { Link, linkOptions } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarPrimitive,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import {
  BuildingIcon,
  ChevronsUpDownIcon,
  EyeIcon,
  EyeOffIcon,
  HouseIcon,
  LogOutIcon,
} from "lucide-react";
import { useState } from "react";

const EMAIL_VISIBILITY_KEY = "sidebar:show-email";

const navItems = linkOptions([
  {
    label: "Home",
    icon: HouseIcon,
    to: "/app",
    activeOptions: {
      exact: true,
    },
  },
]);

interface SidebarUserMenuProps {
  name: string;
  email: string;
  initials: string;
  onSignOut: () => void;
  onSwitchOrg: () => void;
}

function SidebarUserMenu({
  name,
  email,
  initials,
  onSignOut,
  onSwitchOrg,
}: SidebarUserMenuProps) {
  const { state } = useSidebar();
  const [showEmail, setShowEmail] = useState(() => {
    try {
      return localStorage.getItem(EMAIL_VISIBILITY_KEY) !== "false";
    } catch {
      return true;
    }
  });

  function toggleShowEmail() {
    const next = !showEmail;
    setShowEmail(next);
    try {
      localStorage.setItem(EMAIL_VISIBILITY_KEY, String(next));
    } catch {
      // ignore
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <SidebarMenuButton
            size="lg"
            tooltip={name}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            render={<DropdownMenuTrigger />}
          >
            <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
              {initials}
            </div>
            <span className="truncate text-sm font-medium group-data-[collapsible=icon]:hidden">
              {name}
            </span>
            <ChevronsUpDownIcon className="ml-auto size-4 shrink-0 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
          <DropdownMenuContent
            side={state === "collapsed" ? "right" : "top"}
            align={state === "collapsed" ? "start" : "end"}
            className="w-56 -translate-x-2"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">{name}</span>
                <div className="flex items-center gap-1">
                  <span className="font-normal text-muted-foreground text-xs">
                    {showEmail ? email : "•".repeat(12)}
                  </span>
                  <button
                    type="button"
                    onClick={toggleShowEmail}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showEmail ? (
                      <EyeOffIcon className="size-3" />
                    ) : (
                      <EyeIcon className="size-3" />
                    )}
                  </button>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onSwitchOrg}>
                <BuildingIcon />
                Switch organization
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onSignOut} variant="destructive">
                <LogOutIcon />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

interface SidebarProps {
  userName: string;
  userEmail: string;
  userInitials: string;
  onSignOut: () => void;
  onSwitchOrg: () => void;
}

export function Sidebar({
  userName,
  userEmail,
  userInitials,
  onSignOut,
  onSwitchOrg,
}: SidebarProps) {
  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader className="h-14 justify-center px-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.svg"
            width={28}
            height={28}
            alt="Acme logo"
            className="shrink-0"
          />
          <span className="font-semibold text-sm text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Acme
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map(({ label, icon: Icon, ...link }) => (
                <SidebarMenuItem key={link.to}>
                  <Link {...link}>
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip={label}>
                        <Icon />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    )}
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarUserMenu
          name={userName}
          email={userEmail}
          initials={userInitials}
          onSignOut={onSignOut}
          onSwitchOrg={onSwitchOrg}
        />
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
