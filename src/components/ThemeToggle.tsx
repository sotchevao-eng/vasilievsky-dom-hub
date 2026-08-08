import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "tsj-theme";

function apply(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export function ThemeToggle({
  className,
  withLabel = false,
}: {
  className?: string;
  withLabel?: boolean;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial: "light" | "dark" =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setTheme(initial);
    apply(initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    apply(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const label = theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему";

  return (
    <Button
      type="button"
      variant={withLabel ? "outline" : "ghost"}
      size={withLabel ? "default" : "icon"}
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn("rounded-full", withLabel && "h-12 w-full justify-start gap-3 text-base", className)}
    >
      {mounted && theme === "dark" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
      {withLabel && <span>{theme === "dark" ? "Светлая тема" : "Тёмная тема"}</span>}
    </Button>
  );
}
