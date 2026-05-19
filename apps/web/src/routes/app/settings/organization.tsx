import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import {
  CardGroup,
  CardGroupItem,
  CardGroupItemControl,
  CardGroupItemTitle,
} from "@workspace/ui/components/card-group";
import { toastManager } from "@workspace/ui/components/toast";
import { useState } from "react";
import z from "zod";

import { authClient } from "@/lib/auth";
import { useAppForm } from "@/lib/form";

export const Route = createFileRoute("/app/settings/organization")({
  component: RouteComponent,
});

function DeleteOrgDialog({ slug }: { slug: string }) {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const [loading, setLoading] = useState(false);
  const activeOrg = authClient.useActiveOrganization();

  async function handleDelete() {
    if (activeOrg.data) {
      setLoading(true);
      await authClient.organization.delete(
        {
          organizationId: activeOrg.data.id,
        },
        {
          onSuccess: async () => {
            setOpen(false);
            await router.invalidate();
            navigate({ to: "/auth/organization" });
          },
          onError: (error) => {
            toastManager.add({
              title: "Failed to delete organization",
              description: error.error.message,
              type: "error",
            });
            setLoading(false);
          },
        }
      );
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className="text-sm font-medium text-destructive hover:underline underline-offset-4 transition-colors">
        Delete organization
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete organization</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Type{" "}
            <span className="font-mono font-medium text-foreground">
              {slug}
            </span>{" "}
            to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <input
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50 transition-colors"
          placeholder={slug}
          value={confirmValue}
          onChange={(e) => setConfirmValue(e.target.value)}
          aria-label="Confirm organization slug"
          autoComplete="off"
          spellCheck={false}
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={confirmValue !== slug || loading}
            onClick={handleDelete}
          >
            Delete organization
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RouteComponent() {
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();

  const nameForm = useAppForm({
    defaultValues: { name: activeOrg?.name ?? "" },
    validators: {
      onChange: z.object({
        name: z.string().min(1, { error: "Name is required" }),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.organization.update(
        { data: { name: value.name.trim() } },
        {
          onSuccess: () => {
            toastManager.add({
              title: "Organization name updated",
              type: "success",
            });
          },
          onError: (error) => {
            toastManager.add({
              title: "Failed to update name",
              description: error.error.message,
              type: "error",
            });
          },
        }
      );
    },
  });

  const slugForm = useAppForm({
    defaultValues: { slug: activeOrg?.slug ?? "" },
    validators: {
      onChange: z.object({
        slug: z
          .string()
          .min(1, { error: "Slug is required" })
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, {
            error: "Lowercase letters, numbers, and hyphens only",
          }),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.organization.update(
        { data: { slug: value.slug } },
        {
          onSuccess: () => {
            toastManager.add({
              title: "Organization slug updated",
              type: "success",
            });
          },
          onError: (error) => {
            toastManager.add({
              title: "Failed to update slug",
              description: error.error.message,
              type: "error",
            });
          },
        }
      );
    },
  });

  if (isPending) {
    return null;
  }

  const slug = activeOrg?.slug ?? "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>

      <CardGroup>
        <CardGroupItem>
          <CardGroupItemTitle>Name</CardGroupItemTitle>
          <CardGroupItemControl>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                nameForm.handleSubmit();
              }}
            >
              <nameForm.AppField name="name">
                {(field) => (
                  <input
                    aria-label="Organization name"
                    className="text-sm bg-transparent text-right outline-none border border-transparent focus:border-border rounded-md px-2 py-1 w-48 transition-colors"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={() => {
                      field.handleBlur();
                      if (
                        field.state.value.trim() &&
                        field.state.value !== activeOrg?.name
                      ) {
                        nameForm.handleSubmit();
                      }
                    }}
                    placeholder="Organization name"
                  />
                )}
              </nameForm.AppField>
            </form>
          </CardGroupItemControl>
        </CardGroupItem>

        <CardGroupItem>
          <CardGroupItemTitle>Slug</CardGroupItemTitle>
          <CardGroupItemControl>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                slugForm.handleSubmit();
              }}
            >
              <slugForm.AppField name="slug">
                {(field) => (
                  <input
                    aria-label="Organization slug"
                    className="text-sm bg-transparent text-right outline-none border border-transparent focus:border-border rounded-md px-2 py-1 w-48 transition-colors font-mono"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toLowerCase())
                    }
                    onBlur={() => {
                      field.handleBlur();
                      if (
                        field.state.value &&
                        field.state.value !== activeOrg?.slug
                      ) {
                        slugForm.handleSubmit();
                      }
                    }}
                    placeholder="my-org"
                  />
                )}
              </slugForm.AppField>
            </form>
          </CardGroupItemControl>
        </CardGroupItem>
      </CardGroup>

      <div>
        <h2 className="text-sm font-medium text-destructive mb-3">
          Danger zone
        </h2>
        <CardGroup>
          <CardGroupItem>
            <div className="flex flex-col gap-0.5">
              <CardGroupItemTitle>Delete organization</CardGroupItemTitle>
              <p className="text-sm text-muted-foreground">
                Permanently delete this organization and all its data.
              </p>
            </div>
            <CardGroupItemControl>
              <DeleteOrgDialog slug={slug} />
            </CardGroupItemControl>
          </CardGroupItem>
        </CardGroup>
      </div>
    </div>
  );
}
