import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function resolveIcon(name?: string | null): LucideIcon {
  const dict = Icons as unknown as Record<string, LucideIcon>;
  return (name && dict[name]) || Icons.Info;
}

export function InfoCard({
  title,
  description,
  icon,
  to,
  params,
}: {
  title: string;
  description: string;
  icon?: string;
  to: string;
  params?: Record<string, string>;
}) {
  const Icon = resolveIcon(icon);
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params={params as any}
      className="group flex min-h-[9.5rem] flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift sm:p-6"
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary"
        aria-hidden="true"
      >
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        Перейти
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}
