"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background rounded-2xl w-full max-w-md border border-border shadow-2xl">
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{title}</h2>
              {description && (
                <p className="text-sm text-foreground/70 mt-1">{description}</p>
              )}
            </div>
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
        <div className="flex flex-col-reverse sm:flex-row gap-3 px-6 pb-6 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 ${
              destructive
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {loading ? "Memproses..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
