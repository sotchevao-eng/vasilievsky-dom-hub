import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().from("site_settings").select("key, value");
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return map;
});

export const getNews = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("news")
    .select("id, slug, title, category, excerpt, image_url, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return data ?? [];
});

export const getNewsItem = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().max(200) }).parse(input))
  .handler(async ({ data: input }) => {
    const { data } = await publicClient()
      .from("news")
      .select("id, slug, title, category, excerpt, body, image_url, published_at")
      .eq("published", true)
      .eq("slug", input.slug)
      .maybeSingle();
    return data;
  });

export const getGuides = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("resident_guides")
    .select("id, slug, title, summary, icon, image_url, sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
});

export const getGuide = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().max(200) }).parse(input))
  .handler(async ({ data: input }) => {
    const { data } = await publicClient()
      .from("resident_guides")
      .select("id, slug, title, summary, body, icon, image_url")
      .eq("published", true)
      .eq("slug", input.slug)
      .maybeSingle();
    return data;
  });

export const getDocuments = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("documents")
    .select("id, title, category, doc_date, doc_year, file_format, file_size, file_url, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return data ?? [];
});

export const getMeetings = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("meetings")
    .select("id, slug, title, meeting_date, meeting_form, status, agenda, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return data ?? [];
});

export const getMeeting = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().max(200) }).parse(input))
  .handler(async ({ data: input }) => {
    const { data } = await publicClient()
      .from("meetings")
      .select("id, slug, title, meeting_date, meeting_form, status, agenda, results, documents_note, image_url")
      .eq("published", true)
      .eq("slug", input.slug)
      .maybeSingle();
    return data;
  });

export const getStandItems = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient()
    .from("stand_items")
    .select("id, title, body, posted_at, image_url, sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
});

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(100),
  apartment: z.string().trim().max(20).optional().or(z.literal("")),
  contact: z.string().trim().min(5, "Укажите телефон или email").max(150),
  subject: z.string().trim().min(3, "Укажите тему обращения").max(150),
  message: z.string().trim().min(10, "Опишите вопрос подробнее").max(3000),
  consent: z.literal(true),
});

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inquirySchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("inquiries").insert({
      name: data.name,
      apartment: data.apartment || null,
      contact: data.contact,
      subject: data.subject,
      message: data.message,
    });
    if (error) throw new Error("Не удалось отправить обращение");
    return { ok: true };
  });
