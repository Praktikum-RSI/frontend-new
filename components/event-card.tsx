"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Pencil, Trash2, Users } from "lucide-react";
import {
  type Event,
  deriveEventStatus,
  formatEventDateRange,
} from "@/lib/events";

interface EventCardProps {
  event: Event;
  variant?: "admin" | "public";
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
}

const statusConfig = {
  ACTIVE: { bg: "bg-emerald-100", text: "text-emerald-700", label: "ACTIVE" },
  SCHEDULED: { bg: "bg-blue-100", text: "text-blue-700", label: "SCHEDULED" },
  ENDED: { bg: "bg-slate-200", text: "text-slate-700", label: "ENDED" },
};

export function EventCard({
  event,
  variant = "public",
  onEdit,
  onDelete,
}: EventCardProps) {
  const status = statusConfig[deriveEventStatus(event)];
  const dateLabel = formatEventDateRange(event);

  if (variant === "admin") {
    return (
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 hover:bg-muted transition-colors">
        <div className="h-20 w-20 rounded-lg bg-linear-to-br from-primary/40 to-primary/80 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {event.name}
          </h3>
          <p className="text-sm text-foreground/70 line-clamp-1">
            {dateLabel}
          </p>
        </div>
        <Badge className={`${status.bg} ${status.text}`}>{status.label}</Badge>
        <div className="text-center min-w-[80px]">
          <p className="font-semibold text-foreground">{event.quota}</p>
          <p className="text-xs text-foreground/70">quota</p>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(event)}
              aria-label="Edit event"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(event)}
              className="text-destructive hover:text-destructive"
              aria-label="Delete event"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/event/${event.id}`}
      className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary hover:shadow-lg transition-all flex flex-col"
    >
      <div className="h-44 bg-linear-to-br from-[#131b2e] via-[#1a2540] to-primary/70 relative">
        <div className="absolute top-3 left-3">
          <Badge className={`${status.bg} ${status.text}`}>
            {status.label}
          </Badge>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {event.name}
        </h3>
        <p className="text-sm text-foreground/70 line-clamp-2 mb-4">
          {event.description}
        </p>
        <div className="space-y-2 mb-4 text-sm text-foreground/70">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{dateLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>Quota: {event.quota} spots</span>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
          <span className="text-sm font-semibold text-primary">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
