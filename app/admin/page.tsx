"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { EventFormDialog } from "@/components/event-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  type Event,
  deriveEventStatus,
  eventsApi,
  formatEventDateRange,
} from "@/lib/events";
import { ApiError } from "@/lib/api";

const statusStyle = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  ENDED: "bg-slate-200 text-slate-700",
};

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  const recentEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events
      .filter(
        (e) =>
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);
  }, [events, search]);

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

  const totalEvents = events.length;
  const activeCount = events.filter(
    (e) => deriveEventStatus(e) === "ACTIVE",
  ).length;
  const upcomingCount = events.filter(
    (e) => deriveEventStatus(e) === "SCHEDULED",
  ).length;
  const totalQuota = events.reduce((sum, e) => sum + e.quota, 0);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header variant="admin" />

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
                  Event Management Hub
                </h1>
                <p className="text-foreground/70 mt-1">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                  <input
                    type="text"
                    placeholder="Find Event"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg bg-muted text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button
                  onClick={openCreate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Event
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Events", value: totalEvents },
                { label: "Active", value: activeCount },
                { label: "Upcoming", value: upcomingCount },
                { label: "Total Quota", value: totalQuota.toLocaleString() },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <p className="text-xs uppercase tracking-wider text-foreground/70">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {actionError}
              </div>
            )}

            {/* Recent Events */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Recent Events
                  </h2>
                  <p className="text-sm text-foreground/70 mt-1">
                    Manage and monitor your latest event listings
                  </p>
                </div>
                <Link
                  href="/admin/events"
                  className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"
                >
                  View All Events <span>→</span>
                </Link>
              </div>

              <div className="rounded-lg bg-card border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/70">
                          Event Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/70">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/70">
                          Quota
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground/70">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-foreground/60">
                            Loading events...
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center">
                            <p className="text-destructive mb-3">{error}</p>
                            <Button onClick={fetchEvents} size="sm" variant="outline">
                              Try Again
                            </Button>
                          </td>
                        </tr>
                      ) : recentEvents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-foreground/60">
                            {events.length === 0
                              ? "Belum ada event. Buat event pertama Anda!"
                              : "Tidak ada event yang sesuai pencarian."}
                          </td>
                        </tr>
                      ) : (
                        recentEvents.map((event) => {
                          const status = deriveEventStatus(event);
                          return (
                            <tr
                              key={event.id}
                              className="border-b border-border hover:bg-muted/50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-lg bg-linear-to-br from-primary/40 to-primary/80" />
                                  <div>
                                    <Link
                                      href={`/event/${event.id}`}
                                      className="font-semibold text-foreground hover:text-primary"
                                    >
                                      {event.name}
                                    </Link>
                                    <p className="text-sm text-foreground/70">
                                      {formatEventDateRange(event)}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[status]}`}
                                >
                                  {status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-foreground font-medium">
                                {event.quota}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openEdit(event)}
                                    className="text-primary hover:text-primary/80"
                                  >
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setActionError(null);
                                      setDeletingEvent(event);
                                    }}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
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
