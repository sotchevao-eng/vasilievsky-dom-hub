import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, Newspaper, Users, ClipboardList, Phone, Pin } from "lucide-react";
import heroImage from "@/assets/hero-house.jpg";
import vasiliy from "@/assets/vasiliy.png";
import { SectionTitle } from "@/components/SectionTitle";
import { ImportantNotice } from "@/components/ImportantNotice";
import { NewsCard } from "@/components/NewsCard";
import { DocumentCard } from "@/components/DocumentCard";
import { InfoCard } from "@/components/InfoCard";
import { ContactForm } from "@/components/ContactForm";
import { Button } from "@/components/ui/button";
import {
  settingsQuery,
  newsQuery,
  documentsQuery,
  guidesQuery,
  standQuery,
} from "@/lib/queries";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(newsQuery),
      context.queryClient.ensureQueryData(documentsQuery),
      context.queryClient.ensureQueryData(guidesQuery),
      context.queryClient.ensureQueryData(standQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "ТСЖ «Васильевский» — официальный сайт" },
      {
        name: "description",
        content:
          "Новости, объявления, документы и полезная информация для жителей ТСЖ «Васильевский».",
      },
      { property: "og:title", content: "ТСЖ «Васильевский» — официальный сайт" },
      {
        property: "og:description",
        content:
          "Новости, объявления, документы и полезная информация для жителей ТСЖ «Васильевский».",
      },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const QUICK_SECTIONS = [
  {
    title: "Новости и объявления",
    description: "Что происходит в доме прямо сейчас.",
    icon: "Newspaper",
    to: "/news",
  },
  {
    title: "Документы",
    description: "Протоколы, отчеты, сметы и тарифы.",
    icon: "FileText",
    to: "/documents",
  },
  {
    title: "Информация со стенда",
    description: "Объявления с информационных стендов дома.",
    icon: "Pin",
    to: "/stand",
  },
  {
    title: "Памятки жителям",
    description: "Показания, аварии, безопасность и другое.",
    icon: "BookOpen",
    to: "/residents",
  },
  {
    title: "Общие собрания",
    description: "Повестки, документы и итоги собраний.",
    icon: "ClipboardList",
    to: "/meetings",
  },
  {
    title: "Контакты",
    description: "Телефоны правления и аварийных служб.",
    icon: "Phone",
    to: "/contacts",
  },
];

function Index() {
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { data: news } = useSuspenseQuery(newsQuery);
  const { data: documents } = useSuspenseQuery(documentsQuery);
  const { data: guides } = useSuspenseQuery(guidesQuery);
  const { data: stand } = useSuspenseQuery(standQuery);

  return (
    <main>
      {/* HERO */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
              ТСЖ «Васильевский»
            </h1>
            <p className="mt-4 font-display text-xl font-semibold text-primary sm:text-2xl">
              Важная информация о нашем доме — в одном месте
            </p>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              Новости, объявления, документы, полезная информация и контакты ТСЖ.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full px-6 text-base">
                <Link to="/news">Последние новости</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full bg-card px-6 text-base">
                <Link to="/documents">Документы</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Иллюстрация жилого дома и благоустроенного двора"
              width={1600}
              height={1200}
              className="w-full rounded-3xl border border-border object-cover shadow-lift"
            />
            <img
              src={vasiliy}
              alt="Домовой Василий — талисман нашего дома"
              width={816}
              height={816}
              loading="lazy"
              className="absolute -bottom-6 -left-4 hidden h-28 w-28 drop-shadow-lg sm:block"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:space-y-20 sm:py-16">
        <ImportantNotice
          date={settings["notice_date"] ?? "[дата]"}
          title={settings["notice_title"] ?? "[заголовок]"}
          text={settings["notice_text"] ?? "[текст]"}
        />

        {/* QUICK SECTIONS */}
        <section aria-labelledby="razdely">
          <SectionTitle title="Разделы сайта" description="Быстрый доступ к главному." />
          <h2 id="razdely" className="sr-only">
            Разделы сайта
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_SECTIONS.map((s) => (
              <InfoCard
                key={s.to}
                title={s.title}
                description={s.description}
                icon={s.icon}
                to={s.to}
              />
            ))}
          </div>
        </section>

        {/* NEWS */}
        <section aria-labelledby="novosti">
          <SectionTitle
            title="Новости нашего дома"
            description="Свежие публикации правления ТСЖ."
            action={
              <Button asChild variant="outline" className="rounded-full bg-card">
                <Link to="/news">
                  Все новости <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          />
          <h2 id="novosti" className="sr-only">
            Новости нашего дома
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 3).map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* RESIDENTS */}
        <section aria-labelledby="zhitelyam" className="rounded-3xl bg-secondary p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-4">
            <img
              src={vasiliy}
              alt="Домовой Василий подсказывает жителям"
              width={816}
              height={816}
              loading="lazy"
              className="h-20 w-20"
            />
            <div>
              <h2 id="zhitelyam" className="font-display text-2xl font-extrabold sm:text-3xl">
                Полезно жителям
              </h2>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Подсказки на каждый день от домового Василия.
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.slice(0, 5).map((g) => (
              <InfoCard
                key={g.id}
                title={g.title}
                description={g.summary}
                icon={g.icon}
                to="/residents/$slug"
                params={{ slug: g.slug }}
              />
            ))}
          </div>
        </section>

        {/* DOCUMENTS */}
        <section aria-labelledby="dokumenty">
          <SectionTitle
            title="Документы ТСЖ"
            description="Последние опубликованные документы."
            action={
              <Button asChild variant="outline" className="rounded-full bg-card">
                <Link to="/documents">
                  Все документы <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          />
          <h2 id="dokumenty" className="sr-only">
            Документы ТСЖ
          </h2>
          <div className="grid gap-4">
            {documents.slice(0, 4).map((doc) => (
              <DocumentCard key={doc.id} item={doc} />
            ))}
          </div>
        </section>

        {/* STAND */}
        <section aria-labelledby="stend" className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-10">
          <SectionTitle
            title="Информация со стенда"
            description="Актуальные объявления, которые размещены на информационных стендах дома."
            action={
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/stand">Смотреть все</Link>
              </Button>
            }
          />
          <h2 id="stend" className="sr-only">
            Информация со стенда
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {stand.slice(0, 3).map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-dashed border-primary/30 bg-cream p-5"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {item.posted_at}
                </span>
                <h3 className="mt-2 font-display text-base font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* FEEDBACK */}
        <section aria-labelledby="obratnaya-svyaz" id="obrashchenie">
          <SectionTitle
            title="Есть вопрос или проблема?"
            description="Сообщите нам — постараемся разобраться."
          />
          <h2 id="obratnaya-svyaz" className="sr-only">
            Обратная связь
          </h2>
          <div className="max-w-2xl">
            <ContactForm />
          </div>
        </section>
      </div>
    </main>
  );
}

// Иконки используются через строковые имена в InfoCard
void [Newspaper, FileText, Users, ClipboardList, Phone, Pin];
