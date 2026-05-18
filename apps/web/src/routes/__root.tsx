import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ToastProvider } from "@workspace/ui/components/toast";
import { ThemeProvider } from "tanstack-theme-kit";

import { authClient } from "@/lib/auth";
import { getToken } from "@/lib/auth.server";

import appCss from "@workspace/ui/globals.css?url";

const getAuth = createServerFn({ method: "GET" }).handler(
  async () => await getToken()
);

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Acme",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/logo.svg",
        type: "image/svg+xml",
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  beforeLoad: async (ctx) => {
    const token = await getAuth();
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }

    return {
      isAuthenticated: !!token,
      token,
    };
  },
  shellComponent: RootDocument,
});

function RootDocument() {
  const context = Route.useRouteContext();
  return (
    <ConvexBetterAuthProvider
      client={context.convexQueryClient.convexClient}
      authClient={authClient}
      initialToken={context.token}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <HeadContent />
        </head>
        <body>
          <ThemeProvider>
            <ToastProvider>
              <Outlet />
            </ToastProvider>
          </ThemeProvider>
          <Scripts />
        </body>
      </html>
    </ConvexBetterAuthProvider>
  );
}
