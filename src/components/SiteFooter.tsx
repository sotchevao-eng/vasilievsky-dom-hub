import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import logo from "@/assets/logo.png";
import { settingsQuery } from "@/lib/queries";
import { VASILY_GAME_URL } from "@/lib/game";

const links = [
  { to: "/", label: "Главная" },
  { to: "/news", label: "Новости" },
  { to: "/residents", label: "Жителям" },
  { to: "/documents", label: "Документы" },
  { to: "/stand", label: "Стенд" },
  { to: "/about", label: "О ТСЖ" },
  { to: "/meetings", label: "Собрания" },
  { to: "/contacts", label: "Контакты" },
] as const;

/** Когда появится портфолио — вставьте URL, и подпись станет ссылкой. */
const OXANA_PORTFOLIO_URL = "";

function OxanaCredit({ year }: { year: number }) {
  const label = `© ${year} OXANA PROJECTS`;
  const className =
    "tracking-wide text-deep-green-foreground/70 transition-colors hover:text-deep-green-foreground";
  if (OXANA_PORTFOLIO_URL) {
    return (
      <a
        href={OXANA_PORTFOLIO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} hover:underline`}
      >
        {label}
      </a>
    );
  }
  return <p className={className}>{label}</p>;
}

export function SiteFooter() {
  const { data: settings } = useQuery(settingsQuery);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-deep-green text-deep-green-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Логотип ТСЖ «Васильевский»"
              width={512}
              height={512}
              loading="lazy"
              className="h-10 w-10"
            />
            <span className="font-display text-lg font-extrabold">ТСЖ «Васильевский»</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-deep-green-foreground/75">
            Официальный сайт товарищества собственников жилья.
          </p>
        </div>

        <nav aria-label="Навигация в подвале">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-deep-green-foreground/70">
            Разделы
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-5 space-y-2 text-sm">
            <li>
              <a href={VASILY_GAME_URL} className="hover:underline">
                Игра «Домовой Василий»
              </a>
            </li>
            <li>
              <Link to="/privacy" className="hover:underline">
                Политика конфиденциальности
              </Link>
            </li>
            <li>
              <Link to="/personal-data-consent" className="hover:underline">
                Согласие на обработку персональных данных
              </Link>
            </li>
          </ul>
        </nav>

        <address className="not-italic">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-deep-green-foreground/70">
            Контакты
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{settings?.["phone"] ?? "[телефон ТСЖ]"}</li>
            <li>{settings?.["email"] ?? "[email]"}</li>
            <li>{settings?.["address"] ?? "[адрес дома]"}</li>
          </ul>
        </address>
      </div>

      <div className="border-t border-deep-green-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-deep-green-foreground/70">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <OxanaCredit year={year} />
          </div>
          <p>
            Информация на сайте носит информационный характер. Актуальные сведения уточняйте в
            правлении ТСЖ.
          </p>
          <p>
            <Link to="/admin" className="hover:underline">
              Вход для правления
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
