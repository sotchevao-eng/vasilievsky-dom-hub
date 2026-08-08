import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { claimFirstAdmin } from "@/lib/bootstrap.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Вход для правления — ТСЖ «Васильевский»" },
      {
        name: "description",
        content: "Служебный вход в панель управления сайтом ТСЖ «Васильевский».",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Вход для правления — ТСЖ «Васильевский»" },
      { property: "og:description", content: "Служебный раздел сайта ТСЖ «Васильевский»." },
      { property: "og:url", content: "/auth" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/admin" },
      });
      if (error) {
        setLoading(false);
        toast.error("Не удалось зарегистрироваться", { description: error.message });
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        toast.error("Не удалось войти", { description: "Проверьте email и пароль." });
        return;
      }
    }

    try {
      await claimFirstAdmin();
    } catch {
      // права уже выданы кому-то другому
    }
    setLoading(false);
    navigate({ to: "/admin" });
  }



  return (
    <PageShell title="Вход для правления" lead="Раздел предназначен для членов правления ТСЖ.">
      <form
        onSubmit={onSubmit}
        className="max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8"
      >
        <div className="flex gap-2 rounded-full bg-muted p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`h-10 flex-1 rounded-full text-sm font-medium transition ${
                mode === m ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "Вход" : "Регистрация"}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>
        <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base">
          {loading ? "Подождите…" : mode === "signup" ? "Зарегистрироваться" : "Войти"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Первый зарегистрированный аккаунт автоматически получает права администратора. Остальным
          доступ выдается председателем правления. Если вы житель дома — воспользуйтесь формой
          обращения на странице контактов.
        </p>

      </form>
    </PageShell>
  );
}
