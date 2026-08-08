import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image_url?: string | null;
  published_at: string;
};

export function formatDate(value?: string | null) {
  if (!value) return "[дата]";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.title}
          loading="lazy"
          className="h-44 w-full object-cover"
        />
      ) : null}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="rounded-full">
            {item.category}
          </Badge>
          <time className="text-sm text-muted-foreground" dateTime={item.published_at}>
            {formatDate(item.published_at)}
          </time>
        </div>
        <h3 className="mt-3 font-display text-lg font-bold text-foreground">{item.title}</h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{item.excerpt}</p>
        <Link
          to="/news/$slug"
          params={{ slug: item.slug }}
          className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent"
        >
          Читать
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
