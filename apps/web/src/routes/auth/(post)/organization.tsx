import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Spinner } from "@workspace/ui/components/spinner";
import { toastManager } from "@workspace/ui/components/toast";
import {
  ArrowRightIcon,
  Building2Icon,
  LogOutIcon,
  PlusIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import z from "zod";

import { authClient } from "@/lib/auth";
import { useAppForm } from "@/lib/form";
import { getSession } from "@/server/functions";

export const Route = createFileRoute("/auth/(post)/organization")({
  validateSearch: z.object({
    rt: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    const data = await getSession();
    if (!data?.session) {
      throw redirect({
        to: "/auth/signin",
        search: {
          rt: search?.rt,
        },
      });
    }
  },
  component: RouteComponent,
});

function OrgSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
      <Skeleton className="size-10 rounded-lg shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

function CreateOrgSheet({ onSuccess }: { onSuccess: (orgId: string) => void }) {
  const [open, setOpen] = useState(false);

  const form = useAppForm({
    defaultValues: { name: "", slug: "" },
    validators: {
      onChange: z.object({
        name: z.string().min(1, { error: "Organization name is required" }),
        slug: z
          .string()
          .min(1, { error: "Slug is required" })
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, {
            error: "Slug must be lowercase letters, numbers, and hyphens only",
          }),
      }),
    },
    onSubmit: async ({ value }) => {
      const result = await authClient.organization.create({
        name: value.name.trim(),
        slug: value.slug,
      });
      if (result.error) {
        toastManager.add({
          title: "Failed to create organization",
          description: result.error.message,
        });
        return;
      }
      if (result.data?.id) {
        setOpen(false);
        onSuccess(result.data.id);
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="flex items-center gap-4 rounded-xl border border-dashed border-border px-5 py-4 hover:bg-muted transition-colors cursor-pointer text-left w-full group">
        <PlusIcon className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        <span className="flex-1 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Create a new organization
        </span>
        <ArrowRightIcon className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Create organization</SheetTitle>
          <SheetDescription>
            Give your organization a name and a unique slug.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-3 px-4"
        >
          <form.AppField name="name">
            {(field) => (
              <field.InputField field="name" label="Organization name" />
            )}
          </form.AppField>
          <form.AppField
            name="slug"
            validators={{
              onChangeAsyncDebounceMs: 400,
              onChangeAsync: async ({ value }) => {
                if (!value) {
                  return;
                }
                const result = await authClient.organization.checkSlug({
                  slug: value,
                });
                if (result.error || !result.data?.status) {
                  return "This slug is already taken";
                }
              },
            }}
          >
            {(field) => (
              <field.InputField
                field="slug"
                label="Slug"
                description="Used in URLs — lowercase letters, numbers, and hyphens only."
                showValidIndicator
              />
            )}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton
              label="Create organization"
              className="w-full mt-2"
            />
          </form.AppForm>
        </form>
        <SheetFooter />
      </SheetContent>
    </Sheet>
  );
}

function RouteComponent() {
  const { rt } = Route.useSearch();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const [selectingOrgId, setSelectingOrgId] = useState<string | null>(null);
  const { data: session } = authClient.useSession();
  const { data: orgs, isPending } = authClient.useListOrganizations();

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    await router.invalidate();
    navigate({ to: "/" });
  }, [navigate, router]);

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  function renderOrgList() {
    if (isPending) {
      return (
        <>
          <OrgSkeleton />
          <OrgSkeleton />
          <OrgSkeleton />
        </>
      );
    }
    if (orgs && orgs.length > 0) {
      return orgs.map((org) => {
        const isLoading = selectingOrgId === org.id;
        const isDisabled = selectingOrgId !== null;
        return (
          <button
            key={org.id}
            onClick={() => handleSelectOrg(org.id)}
            disabled={isDisabled}
            className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:bg-muted transition-colors cursor-pointer text-left w-full group disabled:cursor-default disabled:opacity-60"
          >
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
              {org.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {org.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {org.slug}
              </p>
            </div>
            {isLoading ? (
              <Spinner className="size-4 text-muted-foreground shrink-0" />
            ) : (
              <ArrowRightIcon className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            )}
          </button>
        );
      });
    }
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <Building2Icon />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No organizations</EmptyTitle>
          <EmptyDescription>
            Create an organization to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent />
      </Empty>
    );
  }

  function renderUserMenu() {
    if (!session) {
      return (
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      );
    }
    if (!user) {
      return null;
    }
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors cursor-pointer outline-none">
          <div className="size-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
            {initials}
          </div>
          <span className="text-sm font-medium text-foreground">
            {user.name}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col">
              <span className="font-medium text-foreground">{user.name}</span>
              <span className="font-normal text-muted-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut} variant="destructive">
              <LogOutIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  async function handleSelectOrg(orgId: string) {
    setSelectingOrgId(orgId);
    await authClient.organization.setActive({ organizationId: orgId });
    navigate({ to: rt ?? "/app" });
  }

  async function handleCreateOrgSuccess(orgId: string) {
    await authClient.organization.setActive({ organizationId: orgId });
    navigate({ to: rt ?? "/app" });
  }

  return (
    <div className="min-h-svh bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-14 shrink-0">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" width={28} height={28} alt="Logo" />
          <span className="font-semibold text-sm text-foreground">Acme</span>
        </div>

        {renderUserMenu()}
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Choose an organization
          </h1>

          {/* ScrollArea is fixed at 240px — matches 3 skeleton rows — so the divider and create button
              never shift position regardless of loading/empty/populated state or org count. */}
          <ScrollArea className="h-60 mb-6">
            <div className="flex flex-col gap-3">{renderOrgList()}</div>
          </ScrollArea>

          {/* Divider */}
          <div className="h-px bg-border mb-6" />

          {/* Create new org */}
          <CreateOrgSheet onSuccess={handleCreateOrgSuccess} />
        </div>
      </main>
    </div>
  );
}
