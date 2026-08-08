import { Link } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImportantNotice({
  date,
  title,
  text,
}: {
  date: string;
  title: string;
  text: string;
}) {
  return (
    <section
      aria-labelledby="vazhnoe"
      className="rounded-3xl border border-terracotta/30 bg-amber-soft/45 p-6 shadow-soft sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-terracotta-foreground"
          aria-hidden="true"
        >
          <Megaphone className="h-5 w-5" />
        </span>
        <h2 id="vazhnoe" className="font-display text-lg font-extrabold text-foreground">
          Важная информация
        </h2>
        <span className="text-sm text-muted-foreground">{date}</span>
      </div>
      <h3 className="mt-4 font-display text-xl font-bold text-foreground sm:text-2xl">{title}</h3>
      <p className="mt-2 max-w-3xl text-sm text-foreground/80 sm:text-base">{text}</p>
      <Button asChild className="mt-6 rounded-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90">
        <Link to="/news">Подробнее</Link>
      </Button>
    </section>
  );
}
