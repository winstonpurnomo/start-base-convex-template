import {
  convexQuery,
  useConvexMutation,
  useConvexPaginatedQuery,
} from "@convex-dev/react-query";
import { formatForDisplay } from "@tanstack/react-hotkeys";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { api } from "@workspace/backend/_generated/api";
import type { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { Kbd } from "@workspace/ui/components/kbd";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { toastManager } from "@workspace/ui/components/toast";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import z from "zod";

import { AppLayout } from "@/components/app-layout";
import { useRegisterCommands } from "@/components/launcher-context";
import { PaginatedTable } from "@/components/paginated-table";
import { useAppForm } from "@/lib/form";

const columnHelper = createColumnHelper<Doc<"resource">>();

const columns = [
  columnHelper.accessor("title", {
    header: "Title",
    cell: (info) => info.getValue(),
  }),
];

export const Route = createFileRoute("/app/(sidebar)/")({
  loader: async ({ context }) =>
    await context.queryClient.ensureQueryData(
      convexQuery(api.resource.crud.list, {
        organizationId: context.session.activeOrganizationId,
        paginationOpts: {
          numItems: 10,
          cursor: null,
        },
      })
    ),
  component: RouteComponent,
});

function CreateResourceSheet({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false);
  const createResource = useConvexMutation(api.resource.crud.create);

  useRegisterCommands(
    [
      {
        groupLabel: "Resources",
        items: [
          {
            label: "New resource",
            action: () => setOpen(true),
            icon: PlusIcon,
            hotkey: "N",
          },
        ],
      },
    ],
    []
  );

  const form = useAppForm({
    defaultValues: { title: "" },
    validators: {
      onChange: z.object({
        title: z.string().min(1, { error: "Title is required" }),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        await createResource({ organizationId, title: value.title.trim() });
        setOpen(false);
        form.reset();
        toastManager.add({ title: "Resource created", type: "success" });
      } catch (error) {
        toastManager.add({
          title: "Failed to create resource",
          description: error instanceof Error ? error.message : undefined,
          type: "error",
        });
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={(props) => (
          <Button {...props}>
            <PlusIcon className="size-4" />
            New resource
            <Kbd>{formatForDisplay("N")}</Kbd>
          </Button>
        )}
      />

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Create resource</SheetTitle>
          <SheetDescription>
            Add a new resource to your organization.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-3 px-4"
        >
          <form.AppField name="title">
            {(field) => <field.InputField field="title" label="Title" />}
          </form.AppField>
          <form.AppForm>
            <form.SubmitButton
              label="Create resource"
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
  const { session } = Route.useRouteContext();
  const resourceQuery = useConvexPaginatedQuery(
    api.resource.crud.list,
    { organizationId: session.activeOrganizationId },
    { initialNumItems: 10 }
  );

  const table = useReactTable({
    data: resourceQuery.results ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <AppLayout
      title="Resources"
      actions={
        <CreateResourceSheet organizationId={session.activeOrganizationId} />
      }
    >
      <div className="p-6">
        <PaginatedTable
          table={table}
          status={resourceQuery.status}
          loadMore={resourceQuery.loadMore}
          emptyTitle="No resources yet"
          emptyDescription="Create your first resource to get started."
        />
      </div>
    </AppLayout>
  );
}
