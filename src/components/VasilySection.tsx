import { Link } from "@tanstack/react-router";
import { Megaphone, Lightbulb, Leaf, Smile, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import vasiliy from "@/assets/vasiliy.png";

const cards = [
  {
    icon: Megaphone,
    title: "Новости дома",
    text: "Расскажет о важных объявлениях и событиях.",
  },
  {
    icon: Lightbulb,
    title: "Полезные советы",
    text: "Напомнит о бытовых вопросах, безопасности и бережном отношении к дому.",
  },
  {
    icon: Leaf,
    title: "Наш двор",
    text: "Расскажет о благоустройстве, сезонных работах и общих делах.",
  },
  {
    icon: Smile,
    title: "Добрососедство",
    text: "Иногда добавит немного доброго юмора и напомнит, что дом начинается с отношения друг к другу.",
  },
];

export function VasilySection() {
  return (
    <section
      aria-labelledby="domovoy-vasily"
      className="overflow-hidden rounded-3xl border border-border bg-cream p-6 shadow-soft sm:p-10"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-12">
        <div className="mx-auto w-full max-w-[280px] lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-3xl bg-secondary shadow-soft">
            <img
              src={vasiliy}
              alt="Домовой Василий — виртуальный помощник ТСЖ «Васильевский»"
              width={507}
              height={900}
              loading="lazy"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>

        <div>
          <h2
            id="domovoy-vasily"
            className="font-display text-2xl font-extrabold sm:text-3xl"
          >
            Знакомьтесь — Домовой Василий 🏠
          </h2>
          <p className="mt-2 text-base font-semibold text-primary sm:text-lg">
            Добрый хранитель нашего дома и виртуальный помощник жителей
          </p>

          <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Домовой Василий поселился на цифровых страницах ТСЖ «Васильевский», чтобы важная
              информация о доме становилась проще и понятнее.
            </p>
            <p>
              Он рассказывает о новостях и объявлениях, напоминает о важных домашних делах, делится
              полезными советами и помогает разобраться в повседневных вопросах.
            </p>
            <p>
              Иногда Василий позволяет себе немного доброго домового юмора — ведь хороший дом
              держится не только на стенах, трубах и батареях, но и на хороших отношениях между
              соседями.
            </p>
            <p>
              При этом все официальные решения принимаются правлением ТСЖ. Василий помогает только
              рассказывать, объяснять и напоминать.
            </p>
          </div>

          <h3 className="mt-8 font-display text-lg font-bold sm:text-xl">Чем поможет Василий</h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {cards.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <h4 className="mt-3 font-semibold">{title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 rounded-2xl bg-secondary/60 p-4 text-sm italic text-muted-foreground sm:text-base">
            Если увидите на сайте бородатого хозяйственного товарища с ключами, блокнотом или
            лейкой — всё в порядке. Это Василий присматривает за информационным хозяйством 🙂
          </p>

          <Button asChild className="mt-6 rounded-full">
            <Link to="/residents">
              Полезная информация для жителей <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
