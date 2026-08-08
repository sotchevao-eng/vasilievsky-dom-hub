import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Bot, Headset, Loader2, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getChatHistory, requestOperator, sendChatMessage, startChat } from "@/lib/chat.functions";

type Msg = { role: "user" | "assistant"; content: string };
const TOKEN_KEY = "tsj-chat-token";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) return;
    void getChatHistory({ data: { token: saved } })
      .then((res) => {
        if (res) {
          setToken(saved);
          setMessages(res.messages);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY));
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  const onStart = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await startChat({ data: { name, phone, consent: true as const } });
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setMessages(res.messages);
    } catch {
      setError("Не удалось начать чат. Проверьте имя и телефон.");
    } finally {
      setBusy(false);
    }
  };

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !token || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    try {
      const res = await sendChatMessage({ data: { token, message: text } });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Не удалось отправить сообщение. Попробуйте ещё раз." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const onOperator = async () => {
    if (!token || busy) return;
    setBusy(true);
    try {
      const res = await requestOperator({ data: { token } });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Закрыть чат с помощником" : "Открыть чат с помощником"}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-lift sm:h-16 sm:w-16"
      >
        {open ? <X aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}
      </Button>

      {open && (
        <div
          role="dialog"
          aria-label="Чат с помощником ТСЖ"
          className="fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[560px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lift"
        >
          <div className="flex items-center gap-3 border-b border-border bg-secondary px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-bold text-foreground">Домовой Василий</p>
              <p className="text-xs text-muted-foreground">Помощник ТСЖ · онлайн</p>
            </div>
          </div>

          {!token ? (
            <form onSubmit={onStart} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              <p className="text-sm text-muted-foreground">
                Представьтесь, чтобы начать диалог — так мы сможем связаться с вами при передаче
                обращения оператору.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="chat-name">Имя</Label>
                <Input
                  id="chat-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="chat-phone">Телефон</Label>
                <Input
                  id="chat-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={30}
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+7 ___ ___-__-__"
                />
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="chat-consent"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                />
                <Label htmlFor="chat-consent" className="text-xs font-normal leading-snug text-muted-foreground">
                  Согласен(на) на обработку персональных данных и принимаю{" "}
                  <Link to="/privacy" className="underline">
                    политику конфиденциальности
                  </Link>
                  .
                </Label>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" disabled={!consent || busy} className="mt-auto h-11 rounded-full">
                {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
                Начать чат
              </Button>
            </form>
          ) : (
            <>
              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm",
                      m.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground",
                    )}
                  >
                    {m.content}
                  </div>
                ))}
                {busy && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Василий печатает…
                  </div>
                )}
              </div>
              <form onSubmit={onSend} className="border-t border-border p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ваш вопрос…"
                    maxLength={2000}
                    aria-label="Сообщение"
                    className="rounded-full"
                  />
                  <Button type="submit" size="icon" className="rounded-full" disabled={busy} aria-label="Отправить">
                    <Send aria-hidden="true" />
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={onOperator}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  <Headset className="h-3.5 w-3.5" aria-hidden="true" />
                  Позвать живого оператора
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
