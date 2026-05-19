import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import type { ReactNode } from "react";

interface AppLayoutProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppLayout({ title, actions, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex flex-1 items-center justify-between">
          <span className="text-sm font-semibold">{title}</span>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </header>
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
