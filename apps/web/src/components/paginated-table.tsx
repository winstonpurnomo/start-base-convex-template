import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table as TableRoot,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { InboxIcon } from "lucide-react";
import { useEffect, useRef } from "react";

const SKELETON_WIDTHS = ["55%", "38%", "67%", "44%", "71%"];

type PaginatedQueryStatus =
  | "LoadingFirstPage"
  | "LoadingMore"
  | "CanLoadMore"
  | "Exhausted";

interface PaginatedTableProps<TData> {
  table: Table<TData>;
  status: PaginatedQueryStatus;
  loadMore: (numItems: number) => void;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function PaginatedTable<TData>({
  table,
  status,
  loadMore,
  pageSize = 10,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Create your first item to get started.",
}: PaginatedTableProps<TData>) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {return;}
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && status === "CanLoadMore") {
          loadMore(pageSize);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [status, loadMore, pageSize]);

  const columnCount = table.getAllColumns().length;

  return (
    <>
      <TableRoot>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {status === "LoadingFirstPage" &&
            SKELETON_WIDTHS.map((width, i) => (
              <TableRow key={i}>
                <TableCell colSpan={columnCount}>
                  <Skeleton className="h-4" style={{ width }} />
                </TableCell>
              </TableRow>
            ))}
          {status !== "LoadingFirstPage" &&
            (table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="py-0">
                  <Empty className="min-h-120">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <InboxIcon />
                      </EmptyMedia>
                      <EmptyTitle>{emptyTitle}</EmptyTitle>
                      <EmptyDescription>{emptyDescription}</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent />
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ))}
        </TableBody>
      </TableRoot>
      {status === "LoadingMore" && (
        <div className="flex justify-center py-4">
          <div className="flex gap-1">
            {SKELETON_WIDTHS.map((_, i) => (
              <Skeleton key={i} className="h-4 w-15" />
            ))}
          </div>
        </div>
      )}
      <div ref={sentinelRef} className="h-1" />
    </>
  );
}
