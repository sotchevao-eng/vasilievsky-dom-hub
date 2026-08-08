import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  head: () => ({
    meta: [
      { title: "О ТСЖ «Васильевский» — правление и реквизиты" },
      {
        name: "description",
        content:
          "Сведения о товариществе собственников жилья «Васильевский»: правление, реквизиты и режим работы.",
      },
      { property: "og:title", content: "О ТСЖ «Васильевский»" },
      {
        property: "og:description",
        content: "О товариществе, правление, реквизиты и режим работы.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function Card({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      <dl className="mt-4 grid gap-3">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 sm:grid-cols-[12rem_1fr] sm:gap-4">
            <dt className="text-sm font-semibold text-muted-foreground">{k}</dt>
            <dd className="text-sm text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function AboutPage() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  const get = (k: string, fallback: string) => s[k] ?? fallback;

  return (
    <PageShell
      title="О ТСЖ «Васильевский»"
      breadcrumbs={<Breadcrumbs items={[{ label: "О ТСЖ" }]} />}
    >
      <div className="grid gap-5">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <h2 className="font-display text-lg font-bold text-foreground">О товариществе</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {get("about_text", "[описание]")}
          </p>
        </section>

        <Card
          title="Правление"
          rows={[
            ["Председатель правления", get("chairman", "[ФИО председателя]")],
            ["Члены правления", get("board_members", "[члены правления]")],
          ]}
        />

        <Card
          title="Реквизиты"
          rows={[
            ["Полное наименование", get("org_full_name", "[полное наименование ТСЖ]")],
            ["ИНН", get("inn", "[ИНН]")],
            ["ОГРН", get("ogrn", "[ОГРН]")],
            ["Юридический адрес", get("legal_address", "[юридический адрес]")],
          ]}
        />

        <Card
          title="Режим работы"
          rows={[
            ["Режим работы", get("work_hours", "[режим работы]")],
            ["Прием председателя", get("reception_hours", "[график]")],
          ]}
        />
      </div>
    </PageShell>
  );
}
