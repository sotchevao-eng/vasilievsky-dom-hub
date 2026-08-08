-- roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile write" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- news
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Объявления',
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  image_url text,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published news" ON public.news FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admin read news" ON public.news FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin write news" ON public.news FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update news" ON public.news FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete news" ON public.news FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER news_updated BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- resident guides
CREATE TABLE public.resident_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Info',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resident_guides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resident_guides TO authenticated;
GRANT ALL ON public.resident_guides TO service_role;
ALTER TABLE public.resident_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read guides" ON public.resident_guides FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admin read guides" ON public.resident_guides FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin write guides" ON public.resident_guides FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update guides" ON public.resident_guides FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete guides" ON public.resident_guides FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER guides_updated BEFORE UPDATE ON public.resident_guides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- documents
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Другие документы',
  doc_date date,
  doc_year integer,
  file_format text NOT NULL DEFAULT 'PDF',
  file_size text,
  file_url text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.documents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read documents" ON public.documents FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admin read documents" ON public.documents FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin write documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update documents" ON public.documents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete documents" ON public.documents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER documents_updated BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- meetings
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  meeting_date text NOT NULL DEFAULT '[дата]',
  meeting_form text NOT NULL DEFAULT '[форма проведения]',
  status text NOT NULL DEFAULT 'upcoming',
  agenda text NOT NULL DEFAULT '',
  results text NOT NULL DEFAULT '',
  documents_note text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.meetings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT ALL ON public.meetings TO service_role;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read meetings" ON public.meetings FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admin read meetings" ON public.meetings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin write meetings" ON public.meetings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update meetings" ON public.meetings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete meetings" ON public.meetings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER meetings_updated BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- stand items
CREATE TABLE public.stand_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  posted_at text NOT NULL DEFAULT '[дата]',
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stand_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stand_items TO authenticated;
GRANT ALL ON public.stand_items TO service_role;
ALTER TABLE public.stand_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read stand" ON public.stand_items FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admin read stand" ON public.stand_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin write stand" ON public.stand_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update stand" ON public.stand_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete stand" ON public.stand_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER stand_updated BEFORE UPDATE ON public.stand_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- site settings
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete settings" ON public.site_settings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- inquiries
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  apartment text,
  contact text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- seed data (placeholders only)
INSERT INTO public.site_settings (key, value) VALUES
  ('org_name', 'ТСЖ «Васильевский»'),
  ('org_full_name', '[полное наименование ТСЖ]'),
  ('address', '[адрес дома]'),
  ('legal_address', '[юридический адрес]'),
  ('phone', '[телефон ТСЖ]'),
  ('email', '[email]'),
  ('pd_email', '[email для вопросов по персональным данным]'),
  ('chairman', '[ФИО председателя]'),
  ('board_members', '[члены правления]'),
  ('inn', '[ИНН]'),
  ('ogrn', '[ОГРН]'),
  ('work_hours', '[режим работы]'),
  ('reception_hours', '[график приёма председателя]'),
  ('emergency_contacts', '[контакты диспетчерской / аварийной службы]'),
  ('about_text', '[описание деятельности товарищества]'),
  ('notice_date', '[дата]'),
  ('notice_title', '[заголовок важного объявления]'),
  ('notice_text', '[текст важного объявления]'),
  ('notice_link', '/news');

INSERT INTO public.news (slug, title, category, excerpt, body, published_at) VALUES
  ('obyavlenie-1', '[заголовок объявления]', 'Объявления', '[короткий анонс объявления]', '[полный текст объявления]', now()),
  ('raboty-1', '[заголовок о проводимых работах]', 'Работы', '[короткий анонс о работах]', '[полный текст: какие работы, сроки, подъезды]', now() - interval '3 days'),
  ('blagoustroystvo-1', '[заголовок о благоустройстве]', 'Благоустройство', '[короткий анонс о благоустройстве двора]', '[полный текст о благоустройстве]', now() - interval '7 days'),
  ('vazhno-1', '[важное сообщение]', 'Важно', '[короткий анонс важного сообщения]', '[полный текст важного сообщения]', now() - interval '10 days'),
  ('poleznoe-1', '[полезная информация для жителей]', 'Полезное', '[короткий анонс полезной информации]', '[полный текст полезной информации]', now() - interval '14 days');

INSERT INTO public.resident_guides (slug, title, summary, body, icon, sort_order) VALUES
  ('pokazaniya', 'Передача показаний счетчиков', 'Сроки и способы передачи показаний приборов учета.', '[порядок и сроки передачи показаний, куда передавать]', 'Gauge', 1),
  ('avarii', 'Аварийные ситуации', 'Что делать при протечке, отключении воды или света.', '[порядок действий при аварийной ситуации, куда звонить]', 'TriangleAlert', 2),
  ('telefony', 'Полезные телефоны', 'Контакты служб, которые могут понадобиться жителям.', '[список полезных телефонов]', 'Phone', 3),
  ('kgm', 'Вывоз крупногабаритных отходов', 'Куда выносить мебель, технику и строительный мусор.', '[правила и график вывоза крупногабаритных отходов]', 'Truck', 4),
  ('remont', 'Ремонт в квартире', 'Разрешенное время работ и согласование перепланировок.', '[правила проведения ремонтных работ]', 'Hammer', 5),
  ('obshchee-imushchestvo', 'Правила пользования общим имуществом', 'Подъезды, лестничные клетки, двор и парковка.', '[правила пользования общим имуществом]', 'Building2', 6),
  ('bezopasnost', 'Безопасность', 'Пожарная безопасность и безопасность в подъезде.', '[памятка по безопасности]', 'ShieldCheck', 7),
  ('moshennichestvo', 'Противодействие мошенничеству', 'Как распознать лжесотрудников и не потерять деньги.', '[памятка по противодействию мошенничеству]', 'UserX', 8),
  ('faq', 'Частые вопросы', 'Ответы на вопросы, которые задают чаще всего.', '[частые вопросы и ответы]', 'CircleHelp', 9);

INSERT INTO public.documents (title, category, doc_date, doc_year, file_format, file_size) VALUES
  ('[название протокола общего собрания]', 'Протоколы', NULL, NULL, 'PDF', '[размер]'),
  ('[название годового отчета]', 'Отчеты', NULL, NULL, 'PDF', '[размер]'),
  ('[название сметы]', 'Сметы', NULL, NULL, 'XLS', '[размер]'),
  ('[название договора]', 'Договоры', NULL, NULL, 'PDF', '[размер]'),
  ('[тарифы на услуги]', 'Тарифы', NULL, NULL, 'PDF', '[размер]'),
  ('[устав товарищества]', 'Учредительные документы', NULL, NULL, 'PDF', '[размер]');

INSERT INTO public.meetings (slug, title, meeting_date, meeting_form, status, agenda, results, documents_note) VALUES
  ('sobranie-predstoyashchee', '[название предстоящего собрания]', '[дата]', '[форма проведения]', 'upcoming', '[повестка собрания]', '[результаты будут опубликованы после проведения]', '[перечень документов к собранию]'),
  ('sobranie-arhiv', '[название прошедшего собрания]', '[дата]', '[форма проведения]', 'archive', '[повестка собрания]', '[итоги голосования и принятые решения]', '[протокол и приложения]');

INSERT INTO public.stand_items (title, body, posted_at, sort_order) VALUES
  ('[заголовок объявления со стенда]', '[текст объявления, размещенного на информационном стенде]', '[дата]', 1),
  ('[заголовок объявления со стенда]', '[текст объявления, размещенного на информационном стенде]', '[дата]', 2),
  ('[заголовок объявления со стенда]', '[текст объявления, размещенного на информационном стенде]', '[дата]', 3);