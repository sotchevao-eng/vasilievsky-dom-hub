import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function checkAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  return Boolean(data);
}

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return { isAdmin: await checkAdmin(context) };
  });

async function assertAdmin(context: { supabase: any; userId: string }) {
  if (!(await checkAdmin(context))) throw new Error("Доступ запрещен");
}


export const adminListInquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("inquiries")
      .select("id, name, apartment, contact, subject, message, status, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSetInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["new", "in_progress", "done"]) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("inquiries")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListNews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("news")
      .select("id, slug, title, category, excerpt, body, image_url, published_at, published")
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const newsInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  title: z.string().trim().min(3).max(200),
  category: z.string().trim().min(2).max(60),
  excerpt: z.string().trim().max(400),
  body: z.string().trim().min(10).max(20000),
  published_at: z.string().trim().max(40),
  image_url: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => v || null),
  published: z.boolean(),
});

export const adminSaveNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => newsInput.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const query = id
      ? context.supabase.from("news").update(values).eq("id", id)
      : context.supabase.from("news").insert(values);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("news").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("documents")
      .select("id, title, category, doc_date, doc_year, file_format, file_size, file_url, published")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const documentInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(200),
  category: z.string().trim().min(2).max(60),
  doc_date: z.string().trim().max(40),
  doc_year: z.coerce.number().int().min(1990).max(2100),
  file_format: z.string().trim().max(10),
  file_size: z.string().trim().max(20),
  file_url: z.string().trim().max(500),
  published: z.boolean(),
});

export const adminSaveDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => documentInput.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const query = id
      ? context.supabase.from("documents").update(values).eq("id", id)
      : context.supabase.from("documents").insert(values);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("site_settings")
      .select("key, value")
      .order("key");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ key: z.string().trim().max(80), value: z.string().max(4000) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("site_settings")
      .update({ value: data.value })
      .eq("key", data.key);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListChats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("chat_sessions")
      .select("id, visitor_name, phone, status, ticket_reason, last_message_at, created_at")
      .order("last_message_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminChatMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("session_id", data.id)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSetChatStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["active", "ticket", "closed"]) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("chat_sessions")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Обзор (сводка) ---------- */

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const db = context.supabase as any;
    const count = async (table: string, col?: string, val?: string) => {
      let q = db.from(table).select("id", { count: "exact", head: true });
      if (col && val) q = q.eq(col, val);

      const { count: c } = await q;
      return c ?? 0;
    };
    return {
      inquiriesNew: await count("inquiries", "status", "new"),
      inquiriesInProgress: await count("inquiries", "status", "in_progress"),
      inquiriesDone: await count("inquiries", "status", "done"),
      chatsTickets: await count("chat_sessions", "status", "ticket"),
      chatsTotal: await count("chat_sessions"),
      news: await count("news"),
      documents: await count("documents"),
      guides: await count("resident_guides"),
      meetings: await count("meetings"),
      stand: await count("stand_items"),
    };
  });

export const adminDeleteInquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("inquiries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Памятки жителям ---------- */

export const adminListGuides = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("resident_guides")
      .select("id, slug, title, summary, body, icon, image_url, sort_order, published")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const guideInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().max(400),
  body: z.string().trim().max(20000),
  icon: z.string().trim().max(40),
  image_url: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => v || null),
  sort_order: z.coerce.number().int().min(0).max(999),
  published: z.boolean(),
});

export const adminSaveGuide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => guideInput.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const { error } = await (id
      ? context.supabase.from("resident_guides").update(values).eq("id", id)
      : context.supabase.from("resident_guides").insert(values));
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteGuide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("resident_guides").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Общие собрания ---------- */

export const adminListMeetings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("meetings")
      .select("id, slug, title, meeting_date, meeting_form, status, agenda, results, documents_note, image_url, published")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const meetingInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  title: z.string().trim().min(3).max(200),
  meeting_date: z.string().trim().max(60),
  meeting_form: z.string().trim().max(120),
  status: z.string().trim().max(30),
  agenda: z.string().trim().max(20000),
  results: z.string().trim().max(20000),
  documents_note: z.string().trim().max(2000),
  image_url: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => v || null),
  published: z.boolean(),
});

export const adminSaveMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => meetingInput.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const { error } = await (id
      ? context.supabase.from("meetings").update(values).eq("id", id)
      : context.supabase.from("meetings").insert(values));
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("meetings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Информационный стенд ---------- */

export const adminListStand = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("stand_items")
      .select("id, title, body, posted_at, image_url, sort_order, published")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const standInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3).max(200),
  body: z.string().trim().max(20000),
  posted_at: z.string().trim().max(60),
  image_url: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => v || null),
  sort_order: z.coerce.number().int().min(0).max(999),
  published: z.boolean(),
});

export const adminSaveStandItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => standInput.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const { error } = await (id
      ? context.supabase.from("stand_items").update(values).eq("id", id)
      : context.supabase.from("stand_items").insert(values));
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteStandItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("stand_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
