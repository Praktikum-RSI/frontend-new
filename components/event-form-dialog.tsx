"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type Event,
  type CreateEventPayload,
  type UpdateEventPayload,
  eventsApi,
  fromDatetimeLocalInput,
  toDatetimeLocalInput,
} from "@/lib/events";
import { ApiError } from "@/lib/api";

interface EventFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  event?: Event | null;
  onClose: () => void;
  onSuccess?: (event?: Event) => void;
}

interface FormState {
  name: string;
  description: string;
  quota: string;
  start_date: string;
  end_date: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  quota: "100",
  start_date: "",
  end_date: "",
};

export function EventFormDialog({
  open,
  mode,
  event,
  onClose,
  onSuccess,
}: EventFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && event) {
      setForm({
        name: event.name,
        description: event.description,
        quota: String(event.quota),
        start_date: toDatetimeLocalInput(event.started_at),
        end_date: toDatetimeLocalInput(event.end_at),
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setServerError(null);
  }, [open, mode, event]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Nama event wajib diisi";
    if (!form.description.trim())
      next.description = "Deskripsi event wajib diisi";
    const quotaNum = Number(form.quota);
    if (!form.quota || Number.isNaN(quotaNum) || quotaNum <= 0)
      next.quota = "Kuota harus lebih besar dari 0";
    if (!form.start_date) next.start_date = "Tanggal mulai wajib diisi";
    if (!form.end_date) next.end_date = "Tanggal selesai wajib diisi";
    if (
      form.start_date &&
      form.end_date &&
      new Date(form.end_date) < new Date(form.start_date)
    ) {
      next.end_date = "Tanggal selesai harus setelah tanggal mulai";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const payload: CreateEventPayload = {
        name: form.name.trim(),
        description: form.description.trim(),
        quota: Number(form.quota),
        start_date: fromDatetimeLocalInput(form.start_date),
        end_date: fromDatetimeLocalInput(form.end_date),
      };
      if (mode === "create") {
        await eventsApi.create(payload);
      } else if (event) {
        const updatePayload: UpdateEventPayload = payload;
        await eventsApi.update(event.id, updatePayload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Gagal menyimpan event";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
        <div className="sticky top-0 bg-background border-b border-border px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {mode === "create" ? "Buat Event Baru" : "Edit Event"}
            </h2>
            <p className="text-sm text-foreground/70 mt-1">
              {mode === "create"
                ? "Isi detail untuk membuat event baru."
                : "Perbarui detail event ini."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground transition-colors rounded-full p-1 hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {serverError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Nama Event
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Global Innovation Summit 2026"
              className="w-full px-4 py-3 rounded-lg border-2 border-border bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Deskripsi
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Tuliskan deskripsi event..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border-2 border-border bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors resize-y"
            />
            {errors.description && (
              <p className="text-destructive text-sm mt-1">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Kuota Peserta
            </label>
            <input
              type="number"
              min={1}
              value={form.quota}
              onChange={(e) => handleChange("quota", e.target.value)}
              placeholder="100"
              className="w-full px-4 py-3 rounded-lg border-2 border-border bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {errors.quota && (
              <p className="text-destructive text-sm mt-1">{errors.quota}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Tanggal Mulai
              </label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-border bg-muted/30 text-foreground focus:outline-none focus:border-primary transition-colors"
              />
              {errors.start_date && (
                <p className="text-destructive text-sm mt-1">
                  {errors.start_date}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Tanggal Selesai
              </label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-border bg-muted/30 text-foreground focus:outline-none focus:border-primary transition-colors"
              />
              {errors.end_date && (
                <p className="text-destructive text-sm mt-1">
                  {errors.end_date}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {submitting
                ? "Menyimpan..."
                : mode === "create"
                  ? "Buat Event"
                  : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
