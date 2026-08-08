import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionTitle({
  title,
  description,
  action,
  as: Tag = "h2",
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <Tag className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">
          {title}
        </Tag>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
