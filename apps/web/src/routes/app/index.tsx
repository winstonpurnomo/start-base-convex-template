import { createFileRoute } from "@tanstack/react-router";

import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/app/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppLayout title="Welcome">
      <div className="h-full bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-sm">
          h-full fills the content area only — no scrollbar
        </span>
      </div>
    </AppLayout>
  );
}
