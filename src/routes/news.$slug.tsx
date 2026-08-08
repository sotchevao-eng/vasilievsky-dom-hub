import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/components/NewsCard";
import { newsItemQuery } from "@/lib/queries";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ context, params }) => {
    const item = await context.queryClient.ensureQueryData(newsItemQuery(params.slug));
    if (!item) throw notFound();
    return { title: item.title, excerpt: item.excerpt };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Публикация недоступна" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — ТСЖ «Васильевский»` },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/news/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/news/${params.slug}` }],
    };
  },
  component: NewsItemPage,
});

function NewsItemPage() {
  const { slug } = Route.useParams();
  const { data: item } = useSuspenseQuery(newsItemQuery(slug));
  if (!item) return null;

  return (
    <PageShell
      title={item.title}
      breadcrumbs={<Breadcrumbs items={[{ label: "Новости", to: "/news" }, { label: item.title }]} />}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary" className="rounded-full">
          {item.category}
        </Badge>
        <time className="text-sm text-muted-foreground" dateTime={item.published_at}>
          {formatDate(item.published_at)}
        </time>
      </div>
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.title}
          loading="lazy"
          className="mt-6 w-full rounded-3xl border border-border object-cover"
        />
      ) : null}
      <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-foreground/85">
        {item.body.split("\n").filter(Boolean).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </PageShell>
  );
}
