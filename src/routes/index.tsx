import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import heroImage from "@/assets/hero-house.jpg";
import { VasilySection } from "@/components/VasilySection";
import { Button } from "@/components/ui/button";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(settingsQuery);
  },
  head: () => ({
    meta: [
      { title: "ТСЖ «Васильевский» — официальный сайт" },
      {
        name: "description",
        content:
          "О ТСЖ «Васильевский» и знакомство с домовым Василием — виртуальным помощником жителей дома.",
      },
      { property: "og:title", content: "ТСЖ «Васильевский» — официальный сайт" },
      {
        property: "og:description",
        content:
          "О ТСЖ «Васильевский» и знакомство с домовым Василием — виртуальным помощником жителей дома.",
      },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const { data: settings } = useSuspenseQuery(settingsQuery);

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
              ТСЖ «Васильевский» — это наш общий дом и общее хозяйство.
            </p>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Товарищество собственников жилья объединяет жителей для управления домом,
              содержания общего имущества и решения вопросов, от которых зависит комфорт
              повседневной жизни.
            </p>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Мы стараемся, чтобы важная информация была доступной и понятной: рассказываем о
              работах в доме и во дворе, публикуем объявления, документы и решения, напоминаем о
              важных коммунальных вопросах и собираем предложения жителей.
            </p>
            <h2 className="mt-6 font-display text-lg font-bold text-foreground">
              Основные направления работы ТСЖ
            </h2>
            <ul className="mt-3 max-w-xl list-disc space-y-1 pl-5 text-base text-muted-foreground">
              <li>содержание и обслуживание общего имущества дома;</li>
              <li>организация текущих работ и ремонта;</li>
              <li>уборка подъездов и придомовой территории;</li>
              <li>благоустройство двора;</li>
              <li>подготовка дома к сезонным изменениям;</li>
              <li>взаимодействие с подрядными и ресурсоснабжающими организациями;</li>
              <li>проведение общих собраний собственников;</li>
              <li>информирование жителей о важных событиях и решениях.</li>
            </ul>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              Мы считаем, что хороший дом начинается не только с исправных коммуникаций и чистого
              подъезда, но и с взаимного уважения, открытого общения и участия жителей.
            </p>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              На этом сайте можно найти актуальные новости ТСЖ, объявления, документы, памятки,
              информацию о собраниях и контакты правления.
            </p>

          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Иллюстрация жилого дома и благоустроенного двора"
              width={1600}
              height={1200}
              className="w-full rounded-3xl border border-border object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <VasilySection />
      </div>
    </main>
  );
}

