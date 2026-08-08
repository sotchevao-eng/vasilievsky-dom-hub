import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, MessageSquareText } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
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
        <Link to="/" className="flex items-center gap-3 rounded-lg" aria-label="На главную">
          <img
            src={logo}
            alt="Логотип ТСЖ «Васильевский»"
            width={512}
            height={512}
            className={cn("shrink-0 transition-all", scrolled ? "h-9 w-9" : "h-11 w-11")}
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base font-extrabold text-foreground sm:text-lg">
              ТСЖ «Васильевский»
            </span>
            <span
              className={cn(
                "hidden text-xs text-muted-foreground sm:block",
                scrolled && "sm:hidden",
              )}
            >
              Официальный сайт товарищества собственников жилья
            </span>
          </span>
        </Link>

        <nav aria-label="Основная навигация" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "bg-secondary text-foreground" }}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
