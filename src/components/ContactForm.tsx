import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { submitInquiry } from "@/lib/public-data.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(100),
  apartment: z.string().trim().max(20),
  contact: z.string().trim().min(5, "Укажите телефон или email").max(150),
  subject: z.string().trim().min(3, "Укажите тему обращения").max(150),
  message: z.string().trim().min(10, "Опишите вопрос подробнее (от 10 символов)").max(3000),
});

export function ContactForm() {
  const send = useServerFn(submitInquiry);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const fd = new FormData(event.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      apartment: String(fd.get("apartment") ?? ""),
      contact: String(fd.get("contact") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      await send({ data: { ...parsed.data, consent: true as const } });
      setSent(true);
    } catch {
      setFormError("Не удалось отправить обращение. Попробуйте позже.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-2xl border border-primary/25 bg-secondary p-8"
      >
        <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden="true" />
        <p className="font-display text-xl font-bold text-foreground">
          Спасибо! Ваше обращение отправлено.
        </p>
        <p className="text-sm text-muted-foreground">
          Правление рассмотрит обращение и свяжется с вами по указанным контактам.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <Field id="name" label="Имя" error={errors["name"]}>
        <Input id="name" name="name" autoComplete="name" className="h-12" required />
      </Field>
      <Field id="apartment" label="Номер квартиры (необязательно)" error={errors["apartment"]}>
        <Input id="apartment" name="apartment" inputMode="numeric" className="h-12" />
      </Field>
      <Field id="contact" label="Телефон или email" error={errors["contact"]}>
        <Input id="contact" name="contact" className="h-12" required />
      </Field>
      <Field id="subject" label="Тема обращения" error={errors["subject"]}>
        <Input id="subject" name="subject" className="h-12" required />
      </Field>
      <Field id="message" label="Сообщение" error={errors["message"]}>
        <Textarea id="message" name="message" rows={6} required />
      </Field>

      <div className="flex items-start gap-3">
        <Checkbox
          id="consent"
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          className="mt-1"
        />
        <Label htmlFor="consent" className="text-sm font-normal leading-relaxed text-muted-foreground">
          Я согласен(на) на обработку персональных данных и ознакомлен(а) с{" "}
          <Link to="/privacy" className="font-semibold text-primary underline">
            Политикой конфиденциальности
          </Link>{" "}
          и{" "}
          <Link to="/personal-data-consent" className="font-semibold text-primary underline">
            Согласием на обработку персональных данных
          </Link>
          .
        </Label>
      </div>

      {formError ? (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={!consent || sending} className="h-12 rounded-full text-base">
        {sending ? "Отправляем…" : "Отправить обращение"}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
