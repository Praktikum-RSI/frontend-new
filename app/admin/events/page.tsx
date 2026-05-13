"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/event-card";
import { EventFormDialog } from "@/components/event-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  type Event,
  deriveEventStatus,
  eventsApi,
} from "@/lib/events";
import { ApiError } from "@/lib/api";

type StatusFilter = "ALL" | "ACTIVE" | "SCHEDULED" | "ENDED";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "SCHEDULED", label: "Upcoming" },
  { value: "ENDED", label: "Past" },
];

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.list();
      setEvents(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events
      .filter((e) => {
        const matchesSearch =
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "ALL" || deriveEventStatus(e) === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
      );
  }, [events, search, statusFilter]);

  const openCreate = () => {
    setFormMode("create");
    setEditingEvent(null);
    setFormOpen(true);
  };

  const openEdit = (event: Event) => {
    setFormMode("edit");
    setEditingEvent(event);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    setDeleting(true);
    setActionError(null);
    try {
      await eventsApi.remove(deletingEvent.id);
      setDeletingEvent(null);
      await fetchEvents();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Gagal menghapus event";
      setActionError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header variant="admin" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Events Management
                </h1>
                <p className="text-foreground/70 mt-1">
                  Buat, ubah, dan hapus event di sini.
                </p>
              </div>
              <Button
                onClick={openCreate}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Buat Event Baru
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[260px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <input
                  type="text"
                  placeholder="Cari event..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatusFilter(opt.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      statusFilter === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-primary/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {actionError}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchEvents} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <p className="text-foreground/70 mb-4">
                  {events.length === 0
                    ? "Belum ada event. Buat event pertama Anda!"
                    : "Tidak ada event yang sesuai filter."}
                </p>
                {events.length === 0 && (
                  <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Event Pertama
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    variant="admin"
                    onEdit={openEdit}
                    onDelete={(e) => {
                      setActionError(null);
                      setDeletingEvent(e);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <EventFormDialog
        open={formOpen}
        mode={formMode}
        event={editingEvent}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          fetchEvents();
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingEvent)}
        title="Hapus Event?"
        description={
          deletingEvent
            ? `Apakah Anda yakin ingin menghapus "${deletingEvent.name}"? Tindakan ini tidak dapat dibatalkan.`
            : undefined
        }
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        destructive
        loading={deleting}
        onClose={() => {
          if (!deleting) setDeletingEvent(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
