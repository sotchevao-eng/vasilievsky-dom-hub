import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImageField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("content-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      onChange(`/api/public/media/${path}`);
      toast.success("Картинка загружена");
    } catch (e) {
      toast.error("Не удалось загрузить картинку", { description: (e as Error).message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <img
            src={value}
            alt="Предпросмотр загруженной картинки"
            className="h-20 w-20 rounded-xl border border-border bg-muted object-contain"
          />
        ) : null}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="rounded-full bg-card"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Загружаем…" : value ? "Заменить картинку" : "Загрузить картинку"}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full bg-card text-destructive"
            onClick={() => onChange("")}
          >
            Убрать
          </Button>
        ) : null}
      </div>
      <Input
        value={value}
        placeholder="или вставьте ссылку на картинку"
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        Картинка показывается целиком, без обрезки. Рекомендуем горизонтальные изображения
        1200×630 px (соотношение 16:9 или 1.91:1), формат JPG/PNG, до 5 МБ.
      </p>
    </div>
  );

}
