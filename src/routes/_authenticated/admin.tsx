import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrudSection } from "@/components/admin/CrudSection";
import {
  getMyAccess,
  adminOverview,
  adminListInquiries,
  adminSetInquiryStatus,
  adminDeleteInquiry,
  adminListNews,
  adminSaveNews,
  adminDeleteNews,
  adminListDocuments,
  adminSaveDocument,
  adminDeleteDocument,
  adminListSettings,
  adminSaveSetting,
  adminListChats,
  adminChatMessages,
  adminSetChatStatus,
  adminListGuides,
  adminSaveGuide,
  adminDeleteGuide,
  adminListMeetings,
  adminSaveMeeting,
  adminDeleteMeeting,
  adminListStand,
  adminSaveStandItem,
  adminDeleteStandItem,
} from "@/lib/admin.functions";



export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Панель управления — ТСЖ «Васильевский»" },
      { name: "description", content: "Управление контентом сайта ТСЖ «Васильевский»." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Панель управления — ТСЖ «Васильевский»" },
      { property: "og:description", content: "Служебный раздел сайта ТСЖ «Васильевский»." },
      { property: "og:url", content: "/admin" },
    ],
    links: [{ rel: "canonical", href: "/admin" }],
  }),
  component: AdminPage,
});

const STATUS_LABEL: Record<string, string> = {
  new: "Новое",
  in_progress: "В работе",
  done: "Решено",
};

const emptyNews = {
  id: undefined as string | undefined,
  slug: "",
  title: "",
  category: "Объявления",
  excerpt: "",
  body: "",
  published_at: "[дата]",
  published: true,
};

const emptyDoc = {
  id: undefined as string | undefined,
  title: "",
  category: "Протоколы",
  doc_date: "[дата]",
  doc_year: new Date().getFullYear(),
  file_format: "PDF",
  file_size: "[размер]",
  file_url: "#",
  published: true,
};

function Field({
  label,
  children,
  id,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const access = useQuery({ queryKey: ["access"], queryFn: () => getMyAccess() });

  const overview = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => adminOverview(),
    enabled: access.data?.isAdmin === true,
    refetchInterval: 60000,
  });

  const inquiries = useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: () => adminListInquiries(),
    enabled: access.data?.isAdmin === true,
  });

  const news = useQuery({
    queryKey: ["admin", "news"],
    queryFn: () => adminListNews(),
    enabled: access.data?.isAdmin === true,
  });
  const documents = useQuery({
    queryKey: ["admin", "documents"],
    queryFn: () => adminListDocuments(),
    enabled: access.data?.isAdmin === true,
  });
  const settings = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminListSettings(),
    enabled: access.data?.isAdmin === true,
  });

  const [inqFilter, setInqFilter] = useState<"all" | "new" | "in_progress" | "done">("all");
  const [newsForm, setNewsForm] = useState(emptyNews);

  const [docForm, setDocForm] = useState(emptyDoc);

  const invalidate = (key: string) => {
    qc.invalidateQueries({ queryKey: ["admin", key] });
    qc.invalidateQueries({ queryKey: [key] });
    qc.invalidateQueries({ queryKey: ["admin", "overview"] });
  };

  const statusMutation = useMutation({
    mutationFn: (v: { id: string; status: "new" | "in_progress" | "done" }) =>
      adminSetInquiryStatus({ data: v }),
    onSuccess: () => invalidate("inquiries"),
    onError: () => toast.error("Не удалось обновить статус"),
  });

  const removeInquiry = useMutation({
    mutationFn: (id: string) => adminDeleteInquiry({ data: { id } }),
    onSuccess: () => {
      toast.success("Обращение удалено");
      invalidate("inquiries");
    },
    onError: () => toast.error("Не удалось удалить обращение"),
  });


  const saveNews = useMutation({
    mutationFn: (v: typeof emptyNews) => adminSaveNews({ data: v }),
    onSuccess: () => {
      toast.success("Новость сохранена");
      setNewsForm(emptyNews);
      invalidate("news");
    },
    onError: (e: Error) => toast.error("Ошибка сохранения", { description: e.message }),
  });

  const removeNews = useMutation({
    mutationFn: (id: string) => adminDeleteNews({ data: { id } }),
    onSuccess: () => {
      toast.success("Новость удалена");
      invalidate("news");
    },
  });

  const saveDoc = useMutation({
    mutationFn: (v: typeof emptyDoc) => adminSaveDocument({ data: v }),
    onSuccess: () => {
      toast.success("Документ сохранен");
      setDocForm(emptyDoc);
      invalidate("documents");
    },
    onError: (e: Error) => toast.error("Ошибка сохранения", { description: e.message }),
  });

  const removeDoc = useMutation({
    mutationFn: (id: string) => adminDeleteDocument({ data: { id } }),
    onSuccess: () => {
      toast.success("Документ удален");
      invalidate("documents");
    },
  });

  const saveSetting = useMutation({
    mutationFn: (v: { key: string; value: string }) => adminSaveSetting({ data: v }),
    onSuccess: () => {
      toast.success("Настройка сохранена");
      invalidate("settings");
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (access.isLoading) {
    return (
      <PageShell title="Панель управления">
        <p className="text-muted-foreground">Проверяем доступ…</p>
      </PageShell>
    );
  }

  if (!access.data?.isAdmin) {
    return (
      <PageShell title="Доступ ограничен" lead="У вашей учетной записи нет прав администратора.">
        <Button onClick={signOut} variant="outline" className="rounded-full bg-card">
          Выйти
        </Button>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Панель управления"
      lead="Управление обращениями, новостями, документами и контактами сайта."
    >
      <div className="mb-6">
        <Button onClick={signOut} variant="outline" className="rounded-full bg-card">
          Выйти
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 flex h-auto flex-wrap gap-1 rounded-full bg-secondary p-1">
          <TabsTrigger value="overview" className="rounded-full">
            Сводка
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="rounded-full">
            Заявки
          </TabsTrigger>
          <TabsTrigger value="chats" className="rounded-full">
            Чаты
          </TabsTrigger>
          <TabsTrigger value="news" className="rounded-full">
            Новости
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-full">
            Документы
          </TabsTrigger>
          <TabsTrigger value="guides" className="rounded-full">
            Памятки
          </TabsTrigger>
          <TabsTrigger value="meetings" className="rounded-full">
            Собрания
          </TabsTrigger>
          <TabsTrigger value="stand" className="rounded-full">
            Стенд
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full">
            Настройки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Новые заявки", value: overview.data?.inquiriesNew },
              { label: "Заявки в работе", value: overview.data?.inquiriesInProgress },
              { label: "Заявки решены", value: overview.data?.inquiriesDone },
              { label: "Тикеты в чатах", value: overview.data?.chatsTickets },
              { label: "Всего чатов", value: overview.data?.chatsTotal },
              { label: "Новости", value: overview.data?.news },
              { label: "Документы", value: overview.data?.documents },
              { label: "Памятки", value: overview.data?.guides },
              { label: "Собрания", value: overview.data?.meetings },
              { label: "Объявления на стенде", value: overview.data?.stand },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-2 font-display text-3xl font-bold text-foreground">
                  {overview.isLoading ? "…" : (card.value ?? 0)}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "Все"],
                ["new", "Новые"],
                ["in_progress", "В работе"],
                ["done", "Решённые"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant={inqFilter === value ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setInqFilter(value)}
              >
                {label}
              </Button>
            ))}
          </div>

          {(inquiries.data ?? []).filter(
            (i: any) => inqFilter === "all" || i.status === inqFilter,
          ).length === 0 ? (
            <p className="text-muted-foreground">Заявок в этом статусе нет.</p>
          ) : (
            (inquiries.data ?? [])
              .filter((i: any) => inqFilter === "all" || i.status === inqFilter)
              .map((item: any) => (
                <article key={item.id} className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(item.created_at).toLocaleString("ru-RU")}</span>
                    <span aria-hidden="true">·</span>
                    <span>{STATUS_LABEL[item.status] ?? item.status}</span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold text-foreground">
                    {item.subject}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.name}
                    {item.apartment ? `, кв. ${item.apartment}` : ""} — {item.contact}
                  </p>
                  <p className="mt-3 whitespace-pre-line text-sm text-foreground">{item.message}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["new", "in_progress", "done"] as const).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={item.status === s ? "default" : "outline"}
                        className="rounded-full"
                        onClick={() => statusMutation.mutate({ id: item.id, status: s })}
                      >
                        {STATUS_LABEL[s]}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full bg-card text-destructive"
                      onClick={() => removeInquiry.mutate(item.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </article>
              ))
          )}

        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <form
            className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveNews.mutate(newsForm);
            }}
          >
            <Field label="Заголовок" id="n-title">
              <Input
                id="n-title"
                required
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
              />
            </Field>
            <Field label="Ссылка (латиницей)" id="n-slug">
              <Input
                id="n-slug"
                required
                value={newsForm.slug}
                onChange={(e) => setNewsForm({ ...newsForm, slug: e.target.value })}
              />
            </Field>
            <Field label="Категория" id="n-cat">
              <Input
                id="n-cat"
                required
                value={newsForm.category}
                onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
              />
            </Field>
            <Field label="Дата публикации" id="n-date">
              <Input
                id="n-date"
                required
                value={newsForm.published_at}
                onChange={(e) => setNewsForm({ ...newsForm, published_at: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Краткое описание" id="n-excerpt">
                <Textarea
                  id="n-excerpt"
                  rows={2}
                  value={newsForm.excerpt}
                  onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Текст новости" id="n-body">
                <Textarea
                  id="n-body"
                  rows={6}
                  required
                  value={newsForm.body}
                  onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" className="rounded-full">
                {newsForm.id ? "Сохранить изменения" : "Добавить новость"}
              </Button>
              {newsForm.id ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-card"
                  onClick={() => setNewsForm(emptyNews)}
                >
                  Отменить
                </Button>
              ) : null}
            </div>
          </form>

          <ul className="space-y-3">
            {(news.data ?? []).map((item: any) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category} · {item.published_at} ·{" "}
                    {item.published ? "опубликовано" : "черновик"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full bg-card"
                    onClick={() =>
                      setNewsForm({
                        id: item.id,
                        slug: item.slug,
                        title: item.title,
                        category: item.category,
                        excerpt: item.excerpt ?? "",
                        body: item.body ?? "",
                        published_at: item.published_at ?? "",
                        published: item.published,
                      })
                    }
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full bg-card text-destructive"
                    onClick={() => removeNews.mutate(item.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <form
            className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveDoc.mutate(docForm);
            }}
          >
            <Field label="Название" id="d-title">
              <Input
                id="d-title"
                required
                value={docForm.title}
                onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
              />
            </Field>
            <Field label="Категория" id="d-cat">
              <Input
                id="d-cat"
                required
                value={docForm.category}
                onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
              />
            </Field>
            <Field label="Дата документа" id="d-date">
              <Input
                id="d-date"
                value={docForm.doc_date}
                onChange={(e) => setDocForm({ ...docForm, doc_date: e.target.value })}
              />
            </Field>
            <Field label="Год" id="d-year">
              <Input
                id="d-year"
                type="number"
                value={docForm.doc_year}
                onChange={(e) => setDocForm({ ...docForm, doc_year: Number(e.target.value) })}
              />
            </Field>
            <Field label="Формат" id="d-format">
              <Input
                id="d-format"
                value={docForm.file_format}
                onChange={(e) => setDocForm({ ...docForm, file_format: e.target.value })}
              />
            </Field>
            <Field label="Размер файла" id="d-size">
              <Input
                id="d-size"
                value={docForm.file_size}
                onChange={(e) => setDocForm({ ...docForm, file_size: e.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Ссылка на файл" id="d-url">
                <Input
                  id="d-url"
                  value={docForm.file_url}
                  onChange={(e) => setDocForm({ ...docForm, file_url: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" className="rounded-full">
                {docForm.id ? "Сохранить изменения" : "Добавить документ"}
              </Button>
              {docForm.id ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full bg-card"
                  onClick={() => setDocForm(emptyDoc)}
                >
                  Отменить
                </Button>
              ) : null}
            </div>
          </form>

          <ul className="space-y-3">
            {(documents.data ?? []).map((item: any) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category} · {item.doc_year} · {item.file_format}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full bg-card"
                    onClick={() =>
                      setDocForm({
                        id: item.id,
                        title: item.title,
                        category: item.category,
                        doc_date: item.doc_date ?? "",
                        doc_year: item.doc_year ?? new Date().getFullYear(),
                        file_format: item.file_format ?? "PDF",
                        file_size: item.file_size ?? "",
                        file_url: item.file_url ?? "#",
                        published: item.published,
                      })
                    }
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full bg-card text-destructive"
                    onClick={() => removeDoc.mutate(item.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="guides">
          <CrudSection
            entity="guides"
            addLabel="Добавить памятку"
            emptyText="Памяток пока нет."
            empty={{
              id: undefined,
              slug: "",
              title: "",
              summary: "",
              body: "",
              icon: "Info",
              sort_order: 0,
              published: true,
            }}
            fields={[
              { name: "title", label: "Заголовок", required: true },
              { name: "slug", label: "Ссылка (латиницей)", required: true },
              { name: "icon", label: "Иконка (например Info)" },
              { name: "sort_order", label: "Порядок", type: "number" },
              { name: "summary", label: "Краткое описание", type: "textarea", rows: 2, full: true },
              { name: "body", label: "Текст памятки", type: "textarea", rows: 6, full: true },
            ]}
            list={() => adminListGuides()}
            save={(v) => adminSaveGuide({ data: v as any })}
            remove={(id) => adminDeleteGuide({ data: { id } })}
            describe={(row) => `порядок ${row["sort_order"]}`}
          />
        </TabsContent>

        <TabsContent value="meetings">
          <CrudSection
            entity="meetings"
            addLabel="Добавить собрание"
            emptyText="Собраний пока нет."
            empty={{
              id: undefined,
              slug: "",
              title: "",
              meeting_date: "[дата]",
              meeting_form: "[форма проведения]",
              status: "upcoming",
              agenda: "",
              results: "",
              documents_note: "",
              published: true,
            }}
            fields={[
              { name: "title", label: "Название", required: true },
              { name: "slug", label: "Ссылка (латиницей)", required: true },
              { name: "meeting_date", label: "Дата проведения" },
              { name: "meeting_form", label: "Форма проведения" },
              { name: "status", label: "Статус (upcoming / past)" },
              { name: "agenda", label: "Повестка", type: "textarea", rows: 5, full: true },
              { name: "results", label: "Итоги", type: "textarea", rows: 5, full: true },
              {
                name: "documents_note",
                label: "Примечание к документам",
                type: "textarea",
                rows: 2,
                full: true,
              },
            ]}
            list={() => adminListMeetings()}
            save={(v) => adminSaveMeeting({ data: v as any })}
            remove={(id) => adminDeleteMeeting({ data: { id } })}
            describe={(row) => `${row["meeting_date"]} · ${row["status"]}`}
          />
        </TabsContent>

        <TabsContent value="stand">
          <CrudSection
            entity="stand"
            addLabel="Добавить объявление"
            emptyText="Объявлений пока нет."
            empty={{
              id: undefined,
              title: "",
              body: "",
              posted_at: "[дата]",
              sort_order: 0,
              published: true,
            }}
            fields={[
              { name: "title", label: "Заголовок", required: true },
              { name: "posted_at", label: "Дата размещения" },
              { name: "sort_order", label: "Порядок", type: "number" },
              { name: "body", label: "Текст объявления", type: "textarea", rows: 5, full: true },
            ]}
            list={() => adminListStand()}
            save={(v) => adminSaveStandItem({ data: v as any })}
            remove={(id) => adminDeleteStandItem({ data: { id } })}
            describe={(row) => `${row["posted_at"]} · порядок ${row["sort_order"]}`}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-3">

          {(settings.data ?? []).map((item: any) => (
            <SettingRow
              key={item.key}
              item={item}
              onSave={(value) => saveSetting.mutate({ key: item.key, value })}
            />
          ))}
        </TabsContent>

        <TabsContent value="chats" className="space-y-4">
          <ChatsTab />
        </TabsContent>
      </Tabs>

    </PageShell>
  );
}

function SettingRow({
  item,
  onSave,
}: {
  item: { key: string; value: string };
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(item.value);
  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[16rem_1fr_auto] sm:items-center">
      <Label htmlFor={`s-${item.key}`} className="text-sm text-muted-foreground">
        {item.key}
      </Label>
      <Input id={`s-${item.key}`} value={value} onChange={(e) => setValue(e.target.value)} />
      <Button className="rounded-full" onClick={() => onSave(value)}>
        Сохранить
      </Button>
    </div>
  );
}

const CHAT_STATUS_LABEL: Record<string, string> = {
  active: "Диалог",
  ticket: "Нужен оператор",
  closed: "Закрыт",
};

function ChatsTab() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);

  const chats = useQuery({
    queryKey: ["admin", "chats"],
    queryFn: () => adminListChats(),
    refetchInterval: 30000,
  });

  const messages = useQuery({
    queryKey: ["admin", "chat-messages", selected],
    queryFn: () => adminChatMessages({ data: { id: selected! } }),
    enabled: !!selected,
    refetchInterval: 15000,
  });

  const setStatus = useMutation({
    mutationFn: (vars: { id: string; status: "active" | "ticket" | "closed" }) =>
      adminSetChatStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Статус чата обновлён");
      void queryClient.invalidateQueries({ queryKey: ["admin", "chats"] });
    },
    onError: () => toast.error("Не удалось обновить статус"),
  });

  const list = chats.data ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
      <div className="space-y-2">
        {list.length === 0 && <p className="text-muted-foreground">Чатов пока нет.</p>}
        {list.map((chat: any) => (
          <button
            key={chat.id}
            type="button"
            onClick={() => setSelected(chat.id)}
            className={
              "w-full rounded-2xl border p-4 text-left transition-colors " +
              (selected === chat.id
                ? "border-primary bg-secondary"
                : "border-border bg-card hover:bg-secondary")
            }
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground">{chat.visitor_name}</span>
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (chat.status === "ticket"
                    ? "bg-terracotta text-terracotta-foreground"
                    : "bg-muted text-muted-foreground")
                }
              >
                {CHAT_STATUS_LABEL[chat.status] ?? chat.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{chat.phone}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(chat.last_message_at).toLocaleString("ru-RU")}
            </p>
            {chat.ticket_reason && (
              <p className="mt-2 text-xs text-foreground">Причина: {chat.ticket_reason}</p>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        {!selected ? (
          <p className="text-muted-foreground">Выберите чат слева, чтобы посмотреть переписку.</p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              {(["active", "ticket", "closed"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setStatus.mutate({ id: selected, status: s })}
                >
                  {CHAT_STATUS_LABEL[s]}
                </Button>
              ))}
            </div>
            <div className="space-y-3">
              {(messages.data ?? []).map((m: any) => (
                <div
                  key={m.id}
                  className={
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm " +
                    (m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground")
                  }
                >
                  {m.content}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
