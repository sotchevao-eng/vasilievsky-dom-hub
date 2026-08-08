import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionTitle } from "@/components/SectionTitle";
import { meetingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/meetings/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(meetingsQuery),
  head: () => ({
    meta: [
      { title: "Общие собрания собственников — ТСЖ «Васильевский»" },
      {
        name: "description",
        content:
          "Предстоящие и прошедшие общие собрания собственников: повестка, документы и результаты.",
      },
      { property: "og:title", content: "Общие собрания — ТСЖ «Васильевский»" },
      {
        property: "og:description",
        content: "Повестки, документы и итоги общих собраний собственников помещений.",
      },
      { property: "og:url", content: "/meetings" },
    ],
    links: [{ rel: "canonical", href: "/meetings" }],
  }),
  component: MeetingsPage,
});

type Meeting = {
  id: string;
  slug: string;
  title: string;
  meeting_date: string;
  meeting_form: string;
  status: string;
  agenda: string;
};

function MeetingRow({ m }: { m: Meeting }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        <span>{m.meeting_date}</span>
        <span aria-hidden="true">·</span>
        <span>{m.meeting_form}</span>
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-foreground">{m.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{m.agenda}</p>
      <Link
        to="/meetings/$slug"
        params={{ slug: m.slug }}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-accent"
      >
        Подробнее <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

function MeetingsPage() {
  const { data: meetings } = useSuspenseQuery(meetingsQuery);
  const upcoming = meetings.filter((m) => m.status === "upcoming");
  const archive = meetings.filter((m) => m.status !== "upcoming");

  return (
    <PageShell
      title="Общие собрания собственников"
      lead="Повестки, документы и итоги собраний. Электронное голосование на сайте не проводится."
      breadcrumbs={<Breadcrumbs items={[{ label: "Собрания" }]} />}
    >
      <section aria-labelledby="predstoyashchie" className="mb-14">
        <SectionTitle title="Предстоящие собрания" />
        <h2 id="predstoyashchie" className="sr-only">
          Предстоящие собрания
        </h2>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-8 text-muted-foreground">
            Предстоящих собраний пока не объявлено.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {upcoming.map((m) => (
              <MeetingRow key={m.id} m={m} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="arhiv">
        <SectionTitle title="Архив собраний" />
        <h2 id="arhiv" className="sr-only">
          Архив собраний
        </h2>
        {archive.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-8 text-muted-foreground">
            Архив пока пуст.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {archive.map((m) => (
              <MeetingRow key={m.id} m={m} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
