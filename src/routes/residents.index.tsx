import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { InfoCard } from "@/components/InfoCard";
import { guidesQuery } from "@/lib/queries";

export const Route = createFileRoute("/residents/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(guidesQuery),
  head: () => ({
    meta: [
      { title: "Жителям — памятки и полезная информация | ТСЖ «Васильевский»" },
      {
        name: "description",
        content:
          "Передача показаний, аварийные ситуации, полезные телефоны, безопасность и другие памятки для жителей дома.",
      },
      { property: "og:title", content: "Жителям — памятки ТСЖ «Васильевский»" },
      {
        property: "og:description",
        content: "Полезные материалы для жителей: показания, аварии, безопасность, частые вопросы.",
      },
      { property: "og:url", content: "/residents" },
    ],
    links: [{ rel: "canonical", href: "/residents" }],
  }),
  component: ResidentsPage,
});

function ResidentsPage() {
  const { data: guides } = useSuspenseQuery(guidesQuery);
  return (
    <PageShell
      title="Жителям"
      lead="Короткие памятки по вопросам, которые возникают чаще всего."
      breadcrumbs={<Breadcrumbs items={[{ label: "Жителям" }]} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <InfoCard
            key={g.id}
            title={g.title}
            description={g.summary}
            icon={g.icon}
            to="/residents/$slug"
            params={{ slug: g.slug }}
          />
        ))}
      </div>
      <div className="mt-10">
        <VasilySection />
      </div>
    </PageShell>

  );
}
