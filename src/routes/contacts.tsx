import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Phone, Mail, MapPin, Clock, Siren } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionTitle } from "@/components/SectionTitle";
import { ContactForm } from "@/components/ContactForm";
import { Button } from "@/components/ui/button";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/contacts")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  head: () => ({
    meta: [
      { title: "Контакты ТСЖ «Васильевский» — телефон, email, адрес" },
      {
        name: "description",
        content:
          "Контакты правления ТСЖ «Васильевский»: телефон, email, адрес, график приема и аварийные службы.",
      },
      { property: "og:title", content: "Контакты ТСЖ «Васильевский»" },
      {
        property: "og:description",
        content: "Телефон, email, адрес, график приема председателя и аварийные контакты.",
      },
      { property: "og:url", content: "/contacts" },
    ],
    links: [{ rel: "canonical", href: "/contacts" }],
  }),
  component: ContactsPage,
});

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <p className="mt-1 text-base text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ContactsPage() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  const phone = s["phone"] ?? "[телефон ТСЖ]";
  const email = s["email"] ?? "[email]";

  return (
    <PageShell
      title="Контакты"
      lead="ТСЖ «Васильевский» — свяжитесь с правлением удобным способом."
      breadcrumbs={<Breadcrumbs items={[{ label: "Контакты" }]} />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Row icon={MapPin} label="Адрес" value={s["address"] ?? "[адрес]"} />
        <Row icon={Phone} label="Телефон" value={phone} />
        <Row icon={Mail} label="Email" value={email} />
        <Row icon={Clock} label="Прием председателя" value={s["reception_hours"] ?? "[график]"} />
        <div className="sm:col-span-2">
          <Row
            icon={Siren}
            label="Диспетчерская / аварийные контакты"
            value={s["emergency_contacts"] ?? "[контакты]"}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="h-12 rounded-full px-6 text-base">
          <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>Позвонить</a>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-full bg-card px-6 text-base">
          <a href={`mailto:${email}`}>Написать</a>
        </Button>
      </div>

      <section id="obrashchenie" className="mt-16 scroll-mt-28">
        <SectionTitle
          title="Обратиться в ТСЖ"
          description="Сообщите нам — постараемся разобраться."
        />
        <div className="max-w-2xl">
          <ContactForm />
        </div>
      </section>
    </PageShell>
  );
}
