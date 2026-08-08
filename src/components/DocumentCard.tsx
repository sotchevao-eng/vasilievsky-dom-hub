import { Download, ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type DocumentItem = {
  id: string;
  title: string;
  category: string;
  doc_date: string | null;
  doc_year: number | null;
  file_format: string;
  file_size: string | null;
  file_url: string | null;
};

export function DocumentCard({ item }: { item: DocumentItem }) {
  const href = item.file_url ?? undefined;
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:p-6">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"
        aria-hidden="true"
      >
        <FileText className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-bold text-foreground">{item.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="rounded-full">
            {item.category}
          </Badge>
          <span>{item.doc_date ?? "[дата]"}</span>
          <span aria-hidden="true">·</span>
          <span>{item.file_format}</span>
          <span aria-hidden="true">·</span>
          <span>{item.file_size ?? "[размер]"}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-full" disabled={!href}>
          <a href={href ?? "#"} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" />
            Открыть
          </a>
        </Button>
        <Button asChild className="rounded-full" disabled={!href}>
          <a href={href ?? "#"} download>
            <Download aria-hidden="true" />
            Скачать
          </a>
        </Button>
      </div>
    </article>
  );
}
