import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NewsCard } from "@/components/NewsCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { newsQuery } from "@/lib/queries";

const CATEGORIES = ["Все", "Объявления", "Работы", "Благоустройство", "Важно", "Полезное"];

export const Route = createFileRoute("/news/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(newsQuery),
  head: () => ({
    meta: [
      { title: "Новости и объявления — ТСЖ «Васильевский»" },
      {
        name: "description",
        content: "Новости, объявления и сообщения о работах в доме ТСЖ «Васильевский».",
      },
      { property: "og:title", content: "Новости и объявления — ТСЖ «Васильевский»" },
      {
        property: "og:description",
        content: "Новости, объявления и сообщения о работах в доме ТСЖ «Васильевский».",
      },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { data: news } = useSuspenseQuery(newsQuery);
  const [category, setCategory] = useState("Все");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return news.filter(
      (n) =>
        (category === "Все" || n.category === category) &&
        (q === "" ||
          n.title.toLowerCase().includes(q) ||
          n.excerpt.toLowerCase().includes(q)),
    );
  }, [news, category, query]);

  return (
    <PageShell
      title="Новости и объявления"
      lead="Публикации правления ТСЖ «Васильевский»."
      breadcrumbs={<Breadcrumbs items={[{ label: "Новости" }]} />}
    >
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="news-search" className="sr-only">
            Поиск по новостям
          </label>
          <Input
            id="news-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по новостям"
            className="h-12 rounded-full bg-card pl-11"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              type="button"
              variant={c === category ? "default" : "outline"}
              onClick={() => setCategory(c)}
              aria-pressed={c === category}
              className="rounded-full"
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          Публикации не найдены.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
