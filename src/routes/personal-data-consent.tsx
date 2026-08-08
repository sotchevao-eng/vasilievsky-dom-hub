import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/personal-data-consent")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  head: () => ({
    meta: [
      { title: "Согласие на обработку персональных данных — ТСЖ «Васильевский»" },
      {
        name: "description",
        content:
          "Текст согласия на обработку персональных данных, которое дается при отправке обращения через сайт ТСЖ «Васильевский».",
      },
      {
        property: "og:title",
        content: "Согласие на обработку персональных данных — ТСЖ «Васильевский»",
      },
      {
        property: "og:description",
        content: "Условия согласия на обработку персональных данных при обращении в ТСЖ.",
      },
      { property: "og:url", content: "/personal-data-consent" },
    ],
    links: [{ rel: "canonical", href: "/personal-data-consent" }],
  }),
  component: ConsentPage,
});

function ConsentPage() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  const org = s["org_full_name"] ?? "[полное наименование ТСЖ]";
  const legal = s["legal_address"] ?? "[юридический адрес]";
  const pdEmail = s["pd_email"] ?? "[email для вопросов по персональным данным]";

  return (
    <PageShell
      title="Согласие на обработку персональных данных"
      breadcrumbs={<Breadcrumbs items={[{ label: "Согласие на обработку данных" }]} />}
    >
      <div className="max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          Отмечая соответствующий пункт в форме на сайте, пользователь дает согласие оператору —{" "}
          {org} (адрес: {legal}) — на обработку своих персональных данных на условиях, изложенных
          ниже.
        </p>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground">
            Перечень персональных данных
          </h2>
          <p className="mt-2">
            Имя, номер квартиры (указывается по желанию), номер телефона или адрес электронной
            почты, тема и текст обращения.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground">Цель обработки</h2>
          <p className="mt-2">
            Рассмотрение обращения и направление ответа заявителю по указанным контактам.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground">Действия с данными</h2>
          <p className="mt-2">
            Сбор, запись, систематизация, хранение, уточнение, использование, обезличивание,
            блокирование и удаление — с использованием средств автоматизации и без них.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-foreground">Срок действия и отзыв</h2>
          <p className="mt-2">
            Согласие действует до достижения целей обработки или до его отзыва. Отзыв направляется
            на адрес {pdEmail}.
          </p>
        </section>

        <p>
          Подробные условия обработки данных описаны в{" "}
          <Link to="/privacy" className="font-semibold text-primary underline">
            Политике конфиденциальности
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
