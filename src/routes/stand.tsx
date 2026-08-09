import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { standQuery } from "@/lib/queries";

export const Route = createFileRoute("/stand")({
  loader: ({ context }) => context.queryClient.ensureQueryData(standQuery),
  head: () => ({
    meta: [
      { title: "Информация со стенда — ТСЖ «Васильевский»" },
      {
        name: "description",
        content: "Актуальные объявления, размещенные на информационных стендах дома.",
      },
      { property: "og:title", content: "Информация со стенда — ТСЖ «Васильевский»" },
      {
        property: "og:description",
        content: "Объявления с информационных стендов ТСЖ «Васильевский».",
      },
      { property: "og:url", content: "/stand" },
    ],
    links: [{ rel: "canonical", href: "/stand" }],
  }),
  component: StandPage,
});

function StandPage() {
  const { data: items } = useSuspenseQuery(standQuery);
  return (
    <PageShell
      title="Информация со стенда"
      lead="Актуальные объявления, которые размещены на информационных стендах дома."
      breadcrumbs={<Breadcrumbs items={[{ label: "Информация со стенда" }]} />}
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-dashed border-primary/30 bg-cream p-6 shadow-soft"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {item.posted_at}
            </span>
            <h2 className="mt-2 font-display text-lg font-bold text-foreground">{item.title}</h2>
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                className="mt-3 max-h-80 w-full rounded-xl border border-border object-cover"
              />
            ) : null}
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{item.body}</p>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
