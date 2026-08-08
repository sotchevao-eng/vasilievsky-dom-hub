import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { meetingQuery } from "@/lib/queries";

export const Route = createFileRoute("/meetings/$slug")({
  loader: async ({ context, params }) => {
    const item = await context.queryClient.ensureQueryData(meetingQuery(params.slug));
    if (!item) throw notFound();
    return { title: item.title, agenda: item.agenda };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Собрание недоступно" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — ТСЖ «Васильевский»` },
        { name: "description", content: loaderData.agenda.slice(0, 155) },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.agenda.slice(0, 155) },
        { property: "og:url", content: `/meetings/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/meetings/${params.slug}` }],
    };
  },
  component: MeetingPage,
});

function Block({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {text}
      </p>
    </section>
  );
}

function MeetingPage() {
  const { slug } = Route.useParams();
  const { data: meeting } = useSuspenseQuery(meetingQuery(slug));
  if (!meeting) return null;

  return (
    <PageShell
      title={meeting.title}
      breadcrumbs={
        <Breadcrumbs items={[{ label: "Собрания", to: "/meetings" }, { label: meeting.title }]} />
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Дата проведения" text={meeting.meeting_date} />
        <Block title="Форма проведения" text={meeting.meeting_form} />
        <Block title="Повестка" text={meeting.agenda} />
        <Block title="Документы" text={meeting.documents_note} />
        <div className="lg:col-span-2">
          <Block title="Результаты" text={meeting.results} />
        </div>
      </div>
    </PageShell>
  );
}
