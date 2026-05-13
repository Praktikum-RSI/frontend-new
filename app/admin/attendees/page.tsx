"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  type Attendee,
  type Event,
  eventsApi,
  formatEventDateTime,
} from "@/lib/events";
import { ApiError } from "@/lib/api";

export default function AttendeesPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      setError(null);
      try {
        const res = await eventsApi.list();
        const list = res.data ?? [];
        setEvents(list);
        if (list.length > 0) setSelectedEventId(list[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat event");
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setAttendees([]);
      return;
    }
    const fetchAttendees = async () => {
      setLoadingAttendees(true);
      setError(null);
      try {
        const res = await eventsApi.attendees(selectedEventId);
        setAttendees(res.data ?? []);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Gagal memuat peserta";
        setError(message);
        setAttendees([]);
      } finally {
        setLoadingAttendees(false);
      }
    };
    fetchAttendees();
  }, [selectedEventId, reloadKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return attendees;
    return attendees.filter((a) => {
      const fullName = `${a.first_name} ${a.last_name}`.toLowerCase();
      return (
        fullName.includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.username.toLowerCase().includes(q) ||
        a.whatsapp_number.toLowerCase().includes(q)
      );
    });
  }, [attendees, search]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header variant="admin" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Attendees Management
              </h1>
              <p className="text-foreground/70 mt-1">
                Lihat daftar user yang sudah mendaftar pada tiap event.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="min-w-[280px]">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Event
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  disabled={loadingEvents || events.length === 0}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  {events.length === 0 && (
                    <option value="">Tidak ada event</option>
                  )}
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[260px]">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Cari Peserta
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                  <input
                    type="text"
                    placeholder="Cari nama, email, username, WhatsApp..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {selectedEvent && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {selectedEvent.name}
                    </h2>
                    <p className="text-sm text-foreground/70 mt-1">
                      {formatEventDateTime(selectedEvent.started_at)} -{" "}
                      {formatEventDateTime(selectedEvent.end_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Users className="h-4 w-4" />
                    {attendees.length} / {selectedEvent.quota} peserta
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="text-destructive mb-3">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => setReloadKey((k) => k + 1)}
                >
                  Coba Lagi
                </Button>
              </div>
            )}

            {loadingEvents || loadingAttendees ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : !selectedEventId ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <p className="text-foreground/70">
                  Belum ada event. Buat event dulu di menu Events.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <Users className="h-10 w-10 text-foreground/40 mx-auto mb-3" />
                <p className="text-foreground/70">
                  {attendees.length === 0
                    ? "Belum ada peserta yang mendaftar pada event ini."
                    : "Tidak ada peserta yang cocok dengan pencarian."}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-foreground/70">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">#</th>
                        <th className="text-left px-4 py-3 font-medium">
                          Nama Lengkap
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Username
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Email
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          WhatsApp
                        </th>
                        <th className="text-left px-4 py-3 font-medium">
                          Tanggal Daftar
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((a, idx) => (
                        <tr
                          key={a.registration_id}
                          className="border-t border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-foreground/70">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {a.first_name} {a.last_name}
                          </td>
                          <td className="px-4 py-3 text-foreground/80">
                            {a.username}
                          </td>
                          <td className="px-4 py-3 text-foreground/80">
                            {a.email}
                          </td>
                          <td className="px-4 py-3 text-foreground/80">
                            {a.whatsapp_number}
                          </td>
                          <td className="px-4 py-3 text-foreground/70">
                            {formatEventDateTime(a.registered_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
