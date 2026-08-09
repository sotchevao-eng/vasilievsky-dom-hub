import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { guideQuery } from "@/lib/queries";

export const Route = createFileRoute("/residents/$slug")({
  loader: async ({ context, params }) => {
    const item = await context.queryClient.ensureQueryData(guideQuery(params.slug));
    if (!item) throw notFound();
    return { title: item.title, summary: item.summary };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Материал недоступен" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — ТСЖ «Васильевский»` },
        { name: "description", content: loaderData.summary },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.summary },
        { property: "og:url", content: `/residents/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/residents/${params.slug}` }],
    };
  },
  component: GuidePage,
});

function GuidePage() {
  const { slug } = Route.useParams();
  const { data: guide } = useSuspenseQuery(guideQuery(slug));
  if (!guide) return null;

  return (
    <PageShell
      title={guide.title}
      lead={guide.summary}
      breadcrumbs={
        <Breadcrumbs items={[{ label: "Жителям", to: "/residents" }, { label: guide.title }]} />
      }
    >
      {guide.image_url ? (
        <img
          src={guide.image_url}
          alt={guide.title}
          loading="lazy"
          className="mb-6 max-h-96 w-full max-w-3xl rounded-2xl border border-border object-cover shadow-soft"
        />
      ) : null}
      <div className="max-w-3xl space-y-4 rounded-2xl border border-border bg-card p-6 text-base leading-relaxed text-foreground/85 shadow-soft sm:p-8">
        {guide.body.split("\n").filter(Boolean).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </PageShell>
  );
}
