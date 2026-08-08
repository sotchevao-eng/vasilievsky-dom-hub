import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DocumentCard } from "@/components/DocumentCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { documentsQuery } from "@/lib/queries";

const CATEGORIES = [
  "Все",
  "Протоколы",
  "Отчеты",
  "Сметы",
  "Договоры",
  "Тарифы",
  "Учредительные документы",
  "Общие собрания",
  "Другие документы",
];

export const Route = createFileRoute("/documents")({
  loader: ({ context }) => context.queryClient.ensureQueryData(documentsQuery),
  head: () => ({
    meta: [
      { title: "Документы ТСЖ «Васильевский» — протоколы, отчеты, сметы" },
      {
        name: "description",
        content:
          "Электронный архив документов ТСЖ «Васильевский»: протоколы, отчеты, сметы, договоры и тарифы.",
      },
      { property: "og:title", content: "Документы ТСЖ «Васильевский»" },
      {
        property: "og:description",
        content: "Протоколы, отчеты, сметы, договоры, тарифы и учредительные документы.",
      },
      { property: "og:url", content: "/documents" },
    ],
    links: [{ rel: "canonical", href: "/documents" }],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { data: documents } = useSuspenseQuery(documentsQuery);
  const [category, setCategory] = useState("Все");
  const [year, setYear] = useState("Все");
  const [query, setQuery] = useState("");

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const d of documents) if (d.doc_year) set.add(String(d.doc_year));
    return ["Все", ...Array.from(set).sort().reverse()];
  }, [documents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter(
      (d) =>
        (category === "Все" || d.category === category) &&
        (year === "Все" || String(d.doc_year ?? "") === year) &&
        (q === "" || d.title.toLowerCase().includes(q)),
    );
  }, [documents, category, year, query]);

  return (
    <PageShell
      title="Документы ТСЖ"
      lead="Электронный архив документов товарищества. Документы, содержащие персональные данные жителей, публикуются только в обезличенном виде."
      breadcrumbs={<Breadcrumbs items={[{ label: "Документы" }]} />}
    >
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="doc-search" className="sr-only">
            Найти документ
          </label>
          <Input
            id="doc-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти документ"
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
        {years.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">Год:</span>
            {years.map((y) => (
              <Button
                key={y}
                type="button"
                size="sm"
                variant={y === year ? "default" : "outline"}
                onClick={() => setYear(y)}
                aria-pressed={y === year}
                className="rounded-full"
              >
                {y}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          Документы не найдены.
        </p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} item={doc} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
