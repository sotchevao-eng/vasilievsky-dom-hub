import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const startSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(80),
  phone: z
    .string()
    .trim()
    .min(6, "Укажите телефон")
    .max(30)
    .regex(/^[\d\s+()-]+$/, "Телефон может содержать только цифры и символы + ( ) -"),
  consent: z.literal(true),
});

const tokenSchema = z.object({ token: z.string().uuid() });

const sendSchema = z.object({
  token: z.string().uuid(),
  message: z.string().trim().min(1, "Введите сообщение").max(2000),
});

export const startChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => startSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: session, error } = await supabaseAdmin
      .from("chat_sessions")
      .insert({ visitor_name: data.name, phone: data.phone, consent: true })
      .select("id, access_token")
      .single();
    if (error || !session) throw new Error("Не удалось открыть чат");

    const greeting = `Здравствуйте, ${data.name}! Я Василий — цифровой помощник ТСЖ «Васильевский». Подскажу по документам, начислениям, показаниям счётчиков, собраниям и приёму заявок. Чем помочь?`;
    await supabaseAdmin
      .from("chat_messages")
      .insert({ session_id: session.id, role: "assistant", content: greeting });

    return {
      token: session.access_token as string,
      messages: [{ role: "assistant" as const, content: greeting }],
      status: "active" as const,
    };
  });

export const getChatHistory = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: session } = await supabaseAdmin
      .from("chat_sessions")
      .select("id, visitor_name, status")
      .eq("access_token", data.token)
      .maybeSingle();
    if (!session) return null;
    const { data: rows } = await supabaseAdmin
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true });
    return {
      name: session.visitor_name,
      status: session.status,
      messages: (rows ?? []).map((r) => ({ role: r.role as "user" | "assistant", content: r.content })),
    };
  });

const OPERATOR_MARKER = "[ОПЕРАТОР]";

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => sendSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: session } = await supabaseAdmin
      .from("chat_sessions")
      .select("id, visitor_name, status")
      .eq("access_token", data.token)
      .maybeSingle();
    if (!session) throw new Error("Чат не найден, откройте новый");

    await supabaseAdmin
      .from("chat_messages")
      .insert({ session_id: session.id, role: "user", content: data.message });

    const [{ data: history }, { data: guides }, { data: docs }, { data: meetings }, { data: settings }] =
      await Promise.all([
        supabaseAdmin
          .from("chat_messages")
          .select("role, content")
          .eq("session_id", session.id)
          .order("created_at", { ascending: true })
          .limit(40),
        supabaseAdmin.from("resident_guides").select("title, summary, body").eq("published", true),
        supabaseAdmin.from("documents").select("title, category, doc_date").eq("published", true).limit(40),
        supabaseAdmin.from("meetings").select("title, meeting_date, status, agenda").eq("published", true).limit(10),
        supabaseAdmin.from("site_settings").select("key, value"),
      ]);

    const settingsText = (settings ?? []).map((s) => `${s.key}: ${s.value}`).join("\n");
    const guidesText = (guides ?? [])
      .map((g) => `— ${g.title}: ${g.summary}\n${(g.body ?? "").slice(0, 900)}`)
      .join("\n\n");
    const docsText = (docs ?? []).map((d) => `— ${d.title} (${d.category}, ${d.doc_date ?? "дата не указана"})`).join("\n");
    const meetingsText = (meetings ?? [])
      .map((m) => `— ${m.title} (${m.meeting_date}, ${m.status}): ${(m.agenda ?? "").slice(0, 300)}`)
      .join("\n");

    const systemPrompt = `Ты — «Домовой Василий», вежливый цифровой помощник ТСЖ «Васильевский» (ЖКХ).
Отвечай кратко, по-русски, дружелюбно и по делу. Помогай жителям: показания счётчиков, квитанции и начисления, заявки на ремонт, документы, собрания собственников, контакты правления, правила проживания.
Опирайся ТОЛЬКО на данные ниже. Если данных нет или вопрос требует решения человека (авария, спор, деньги, персональные данные, жалоба, просьба позвать оператора) — ответь коротко и добавь ПОСЛЕДНЕЙ строкой: ${OPERATOR_MARKER} краткая причина.
Никогда не выдумывай суммы, реквизиты и даты — если в данных плейсхолдер, так и говори.

СПРАВОЧНИК ТСЖ (настройки сайта):
${settingsText || "нет данных"}

ПАМЯТКИ ЖИТЕЛЯМ:
${guidesText || "нет данных"}

ДОКУМЕНТЫ:
${docsText || "нет данных"}

СОБРАНИЯ:
${meetingsText || "нет данных"}

Имя собеседника: ${session.visitor_name}.`;

    let reply = "";
    let failed = false;
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env["LOVABLE_API_KEY"]}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      if (!res.ok) {
        failed = true;
      } else {
        const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        reply = json.choices?.[0]?.message?.content?.trim() ?? "";
      }
    } catch {
      failed = true;
    }

    if (failed || !reply) {
      reply = `Не удалось получить ответ помощника. Я передам вопрос живому оператору правления.\n${OPERATOR_MARKER} сбой помощника`;
    }

    let needsOperator = reply.includes(OPERATOR_MARKER);
    let ticketReason: string | null = null;
    if (needsOperator) {
      const idx = reply.indexOf(OPERATOR_MARKER);
      ticketReason = reply.slice(idx + OPERATOR_MARKER.length).trim().slice(0, 300) || "Требуется оператор";
      reply = `${reply.slice(0, idx).trim()}\n\nЯ передал(а) обращение живому оператору правления — с вами свяжутся по указанному телефону.`.trim();
    }

    await supabaseAdmin
      .from("chat_messages")
      .insert({ session_id: session.id, role: "assistant", content: reply });

    await supabaseAdmin
      .from("chat_sessions")
      .update({
        last_message_at: new Date().toISOString(),
        ...(needsOperator && session.status !== "closed"
          ? { status: "ticket", ticket_reason: ticketReason }
          : {}),
      })
      .eq("id", session.id);

    return { reply, needsOperator };
  });

export const requestOperator = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tokenSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: session } = await supabaseAdmin
      .from("chat_sessions")
      .select("id")
      .eq("access_token", data.token)
      .maybeSingle();
    if (!session) throw new Error("Чат не найден");
    const text = "Обращение передано живому оператору правления. С вами свяжутся по указанному телефону.";
    await supabaseAdmin
      .from("chat_messages")
      .insert({ session_id: session.id, role: "assistant", content: text });
    await supabaseAdmin
      .from("chat_sessions")
      .update({
        status: "ticket",
        ticket_reason: "Запрос оператора от жителя",
        last_message_at: new Date().toISOString(),
      })
      .eq("id", session.id);
    return { ok: true, reply: text };
  });
