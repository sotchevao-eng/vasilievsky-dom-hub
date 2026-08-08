import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type CrudField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number";
  rows?: number;
  full?: boolean;
  required?: boolean;
};

type Row = Record<string, any>;

export function CrudSection({
  entity,
  fields,
  empty,
  list,
  save,
  remove,
  describe,
  addLabel,
  emptyText,
}: {
  entity: string;
  fields: CrudField[];
  empty: Row;
  list: () => Promise<Row[]>;
  save: (values: Row) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  describe: (row: Row) => string;
  addLabel: string;
  emptyText: string;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Row>(empty);

  const rows = useQuery({ queryKey: ["admin", entity], queryFn: list });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", entity] });
    void qc.invalidateQueries({ queryKey: [entity] });
  };

  const saveMutation = useMutation({
    mutationFn: (values: Row) => save(values),
    onSuccess: () => {
      toast.success("Сохранено");
      setForm(empty);
      invalidate();
    },
    onError: (e: Error) => toast.error("Ошибка сохранения", { description: e.message }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove(id),
    onSuccess: () => {
      toast.success("Удалено");
      invalidate();
    },
    onError: (e: Error) => toast.error("Не удалось удалить", { description: e.message }),
  });

  return (
    <div className="space-y-6">
      <form
        className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate(form);
        }}
      >
        {fields.map((field) => {
          const id = `${entity}-${field.name}`;
          return (
            <div key={field.name} className={`space-y-2 ${field.full ? "sm:col-span-2" : ""}`}>
              <Label htmlFor={id}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={id}
                  rows={field.rows ?? 4}
                  required={field.required}
                  value={String(form[field.name] ?? "")}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                />
              ) : (
                <Input
                  id={id}
                  type={field.type === "number" ? "number" : "text"}
                  required={field.required}
                  value={String(form[field.name] ?? "")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [field.name]:
                        field.type === "number" ? Number(e.target.value) : e.target.value,
                    })
                  }
                />
              )}
            </div>
          );
        })}

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" className="rounded-full" disabled={saveMutation.isPending}>
            {form["id"] ? "Сохранить изменения" : addLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full bg-card"
            onClick={() => setForm({ ...form, published: !form["published"] })}
          >
            {form["published"] ? "Статус: опубликовано" : "Статус: черновик"}
          </Button>
          {form["id"] ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full bg-card"
              onClick={() => setForm(empty)}
            >
              Отменить
            </Button>
          ) : null}
        </div>
      </form>

      {rows.isLoading ? (
        <p className="text-muted-foreground">Загружаем…</p>
      ) : (rows.data ?? []).length === 0 ? (
        <p className="text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {(rows.data ?? []).map((item) => (
            <li
              key={item["id"]}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-semibold text-foreground">{item["title"]}</p>
                <p className="text-xs text-muted-foreground">
                  {describe(item)} · {item["published"] ? "опубликовано" : "черновик"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full bg-card"
                  onClick={() => {
                    const next: Row = { ...empty };
                    for (const key of Object.keys(empty)) {
                      if (item[key] !== undefined && item[key] !== null) next[key] = item[key];
                    }
                    next["id"] = item["id"];
                    setForm(next);
                  }}
                >
                  Редактировать
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full bg-card"
                  onClick={() => {
                    const values: Row = { ...empty };
                    for (const key of Object.keys(empty)) {
                      if (item[key] !== undefined && item[key] !== null) values[key] = item[key];
                    }
                    values["id"] = item["id"];
                    values["published"] = !item["published"];
                    saveMutation.mutate(values);
                  }}
                >
                  {item["published"] ? "Снять с публикации" : "Опубликовать"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full bg-card text-destructive"
                  onClick={() => removeMutation.mutate(item["id"])}
                >
                  Удалить
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
