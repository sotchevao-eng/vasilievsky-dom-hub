import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import heroImage from "@/assets/hero-house.jpg";
import vasiliy from "@/assets/vasiliy.png";
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
              Товарищество собственников жилья «Васильевский» управляет нашим домом:
              содержание и ремонт общего имущества, благоустройство двора, работа с
              подрядчиками и решения общих собраний собственников.
            </p>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Адрес: {settings["address"] ?? "[адрес дома]"}. Правление:{" "}
              {settings["work_hours"] ?? "[режим работы]"}. Телефон:{" "}
              {settings["phone"] ?? "[телефон]"}.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full px-6 text-base">
                <Link to="/about">О ТСЖ и реквизиты</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full bg-card px-6 text-base">
                <Link to="/contacts">Контакты</Link>
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

      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <VasilySection />
      </div>
    </main>
  );
}

