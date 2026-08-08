import type { ReactNode } from "react";

export function PageShell({
  title,
  lead,
  children,
  breadcrumbs,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
  breadcrumbs?: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      {breadcrumbs}
      <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">{title}</h1>
      {lead ? <p className="mt-3 max-w-3xl text-base text-muted-foreground">{lead}</p> : null}
      <div className="mt-10">{children}</div>
    </main>
  );
}
