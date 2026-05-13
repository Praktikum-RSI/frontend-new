import { api } from "./api";

export interface Event {
  id: string;
  name: string;
  description: string;
  quota: number;
  started_at: string;
  end_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventPayload {
  name: string;
  description: string;
  quota: number;
  start_date: string;
  end_date: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

interface BaseResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const eventsApi = {
  list: () => api.get<BaseResponse<Event[]>>("/events/", { auth: false }),
  get: (id: string) => api.get<BaseResponse<Event>>(`/events/${id}`, { auth: false }),
  create: (payload: CreateEventPayload) =>
    api.post<BaseResponse<null>>("/events/", payload),
  update: (id: string, payload: UpdateEventPayload) =>
    api.patch<BaseResponse<null>>(`/events/${id}`, payload),
  remove: (id: string) => api.remove<BaseResponse<null>>(`/events/${id}`),
  register: (id: string) => api.post<BaseResponse<null>>(`/events/${id}/register`, {}),
};

export function deriveEventStatus(event: Event): "ACTIVE" | "SCHEDULED" | "ENDED" {
  const now = new Date();
  const start = new Date(event.started_at);
  const end = new Date(event.end_at);
  if (now < start) return "SCHEDULED";
  if (now > end) return "ENDED";
  return "ACTIVE";
}

export function formatEventDateRange(event: Event): string {
  const start = new Date(event.started_at);
  const end = new Date(event.end_at);
  const sameDay = start.toDateString() === end.toDateString();
  const dateFmt: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  if (sameDay) return start.toLocaleDateString("en-US", dateFmt);
  const startFmt = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endFmt = end.toLocaleDateString("en-US", dateFmt);
  return `${startFmt} - ${endFmt}`;
}

export function formatEventDateTime(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toDatetimeLocalInput(value: string | Date | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalInput(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  return date.toISOString();
}
