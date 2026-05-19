import { cn } from "@workspace/ui/lib/utils";
import * as React from "react";

function CardGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-group"
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card text-card-foreground",
        className
      )}
      {...props}
    />
  );
}

function CardGroupLabel({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-group-label"
      className={cn(
        "mb-3 text-sm font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function CardGroupItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-group-item"
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3.5 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border",
        className
      )}
      {...props}
    />
  );
}

function CardGroupItemLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-group-item-label"
      className={cn("flex min-w-0 flex-col gap-0.5", className)}
      {...props}
    />
  );
}

function CardGroupItemTitle({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-group-item-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function CardGroupItemDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-group-item-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardGroupItemControl({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-group-item-control"
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

export {
  CardGroup,
  CardGroupLabel,
  CardGroupItem,
  CardGroupItemLabel,
  CardGroupItemTitle,
  CardGroupItemDescription,
  CardGroupItemControl,
};
