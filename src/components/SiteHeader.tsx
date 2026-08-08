import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, MessageSquareText } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";


export const NAV_ITEMS = [
  { to: "/", label: "Главная" },
  { to: "/news", label: "Новости" },
  { to: "/residents", label: "Жителям" },
  { to: "/documents", label: "Документы" },
  { to: "/stand", label: "Стенд" },
  { to: "/meetings", label: "Собрания" },
  { to: "/about", label: "О ТСЖ" },
  { to: "/contacts", label: "Контакты" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur transition-all",
        scrolled ? "py-1.5 shadow-soft" : "py-3",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center rounded-lg" aria-label="ТСЖ «Васильевский» — на главную">
          <img
            src={logo}
            alt="ТСЖ «Васильевский» — официальный сайт товарищества собственников жилья"
            width={512}
            height={512}
            className={cn("w-auto shrink-0 transition-all", scrolled ? "h-12" : "h-16")}
          />
        </Link>


        <nav aria-label="Основная навигация" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{
                    className:
                      "bg-primary text-primary-foreground border-primary shadow-[0_3px_0_0_hsl(var(--primary)/0.5)] translate-y-0",
                  }}
                  className="inline-block whitespace-nowrap rounded-full border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground shadow-[0_3px_0_0_hsl(var(--border))] transition-all hover:-translate-y-0.5 hover:bg-secondary active:translate-y-0.5 active:bg-primary active:text-primary-foreground active:shadow-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>


        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <ThemeToggle />

          <Button asChild className="hidden rounded-full sm:inline-flex">
            <Link to="/contacts" hash="obrashchenie">
              <MessageSquareText aria-hidden="true" />
              Обратиться в ТСЖ
            </Link>
          </Button>


          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" className="rounded-full" aria-label="Открыть меню">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm">
              <SheetTitle className="font-display text-lg">Меню</SheetTitle>
              <nav aria-label="Мобильная навигация" className="mt-6">
                <ul className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        activeOptions={{ exact: item.to === "/" }}
                        activeProps={{ className: "bg-secondary" }}
                        className="block rounded-xl px-4 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-4 h-12 w-full rounded-full text-base">
                  <Link to="/contacts" hash="obrashchenie" onClick={() => setOpen(false)}>
                    Обратиться в ТСЖ
                  </Link>
                </Button>
                <ThemeToggle withLabel className="mt-2" />

              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
