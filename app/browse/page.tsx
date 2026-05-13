"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/event-card";
import {
  type Event,
  deriveEventStatus,
  eventsApi,
} from "@/lib/events";

type StatusFilter = "ALL" | "ACTIVE" | "SCHEDULED" | "ENDED";
type SortOrder = "date_asc" | "date_desc" | "name_asc" | "quota_desc";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "SCHEDULED", label: "Upcoming" },
  { value: "ENDED", label: "Past" },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "date_asc", label: "Start Date (Earliest)" },
  { value: "date_desc", label: "Start Date (Latest)" },
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "quota_desc", label: "Largest Quota" },
];

export default function BrowseEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortOrder, setSortOrder] = useState<SortOrder>("date_asc");
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = events.filter((event) => {
      const matchesSearch =
        !q ||
        event.name.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "ALL" || deriveEventStatus(event) === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sortOrder) {
        case "date_asc":
          return (
            new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
          );
        case "date_desc":
          return (
            new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
          );
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "quota_desc":
          return b.quota - a.quota;
      }
    });
    return sorted;
  }, [events, searchQuery, statusFilter, sortOrder]);

  const hasActiveFilters =
    statusFilter !== "ALL" || sortOrder !== "date_asc" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Discover Events
          </h1>
          <p className="text-xl text-foreground/70 mb-8">
            Find and register for amazing experiences
          </p>

          {/* Search Bar */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/50" />
              <input
                type="text"
                placeholder="Search events by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-card border border-border text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters((s) => !s)}
              className="px-6 flex items-center gap-2 border-border"
            >
              <Filter className="h-5 w-5" />
              Filters
            </Button>
          </div>

          {/* Filter Pills */}
          {showFilters && (
            <div className="rounded-xl border border-border bg-card p-5 mb-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">
                  Status
                </p>
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
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">
                  Sort By
                </p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSortOrder(opt.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        sortOrder === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground hover:bg-primary/10"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setSortOrder("date_asc");
                  }}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Reset all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-foreground/70">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredEvents.length}
            </span>{" "}
            of {events.length} events
          </p>
          {!loading && events.length > 0 && (
            <button
              type="button"
              onClick={fetchEvents}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Refresh
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchEvents} variant="outline">
              Try Again
            </Button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/70 text-lg mb-4">
              {events.length === 0
                ? "Belum ada event yang tersedia."
                : "No events found matching your filters."}
            </p>
            {hasActiveFilters && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setSortOrder("date_asc");
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} variant="public" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
