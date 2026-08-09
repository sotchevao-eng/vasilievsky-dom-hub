ALTER TABLE public.resident_guides ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.stand_items ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS image_url text;

CREATE POLICY "Admins can upload content images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read content images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'content-images' AND public.has_role(auth.uid(), 'admin'));