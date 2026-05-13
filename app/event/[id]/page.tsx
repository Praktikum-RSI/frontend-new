"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Users, ArrowLeft, Lock } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type Event,
  deriveEventStatus,
  eventsApi,
  formatEventDateTime,
} from "@/lib/events";
import { useSession } from "@/hooks/use-session";

const statusConfig = {
  ACTIVE: { bg: "bg-emerald-100", text: "text-emerald-700", label: "REGISTRATION OPEN" },
  SCHEDULED: { bg: "bg-blue-100", text: "text-blue-700", label: "UPCOMING" },
  ENDED: { bg: "bg-slate-200", text: "text-slate-700", label: "EVENT ENDED" },
};

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { session, hydrated } = useSession();
  const eventId = params?.id ?? "";

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registrationStep, setRegistrationStep] =
    useState<"closed" | "registration" | "confirmation" | "login-required">(
      "closed",
    );

  const handleRegisterClick = () => {
    if (!hydrated) return;
    if (!session) {
      setRegistrationStep("login-required");
      return;
    }
    setRegistrationStep("registration");
  };

  const goToLogin = () => {
    router.push(`/login?next=${encodeURIComponent(`/event/${eventId}`)}`);
  };

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await eventsApi.get(eventId);
        if (!cancelled) setEvent(res.data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Event tidak ditemukan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (registrationStep === "closed") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [registrationStep]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-16 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-40 w-full bg-muted animate-pulse rounded" />
            </div>
            <div className="h-96 bg-muted animate-pulse rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Event tidak ditemukan
          </h1>
          <p className="text-foreground/70 mb-8">
            {error ?? "Event yang Anda cari mungkin telah dihapus atau ID tidak valid."}
          </p>
          <Link href="/browse">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Event
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const status = statusConfig[deriveEventStatus(event)];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-foreground/70 hover:text-foreground text-sm font-medium flex items-center gap-2 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <Badge className={`${status.bg} ${status.text}`}>
                {status.label}
              </Badge>
            </div>

            <div>
              <h1 className="text-5xl font-bold text-foreground mb-4 leading-tight">
                {event.name}
              </h1>
            </div>

            <div className="flex flex-wrap gap-6 text-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Started: {formatEventDateTime(event.started_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Ends: {formatEventDateTime(event.end_at)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Description</h2>
              <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl bg-card border border-border p-8 space-y-6">
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                    QUOTA
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {event.quota}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: "0%" }}
                  />
                </div>
                <p className="text-xs text-foreground/70 mt-2">
                  Available seats
                </p>
              </div>

              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground/70">Started At</p>
                    <p className="font-semibold text-foreground">
                      {formatEventDateTime(event.started_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground/70">Ended At</p>
                    <p className="font-semibold text-foreground">
                      {formatEventDateTime(event.end_at)}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRegisterClick}
                disabled={deriveEventStatus(event) === "ENDED"}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold py-6 disabled:opacity-50"
              >
                {deriveEventStatus(event) === "ENDED"
                  ? "Event Has Ended"
                  : session
                    ? "Register Now"
                    : "Login to Register"}
              </Button>

              <p className="text-xs text-center text-foreground/70">
                *Instant registration via P!NGFEST
              </p>

              <div className="border-t border-border pt-6 text-center space-y-2">
                <p className="font-bold text-foreground">P!NGFEST</p>
                <p className="text-xs text-foreground/70">
                  Your premium gate to world-class experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Registration Overlay */}
      {registrationStep !== "closed" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setRegistrationStep("closed");
          }}
        >
          <div className="bg-background rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-3 items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    registrationStep === "login-required"
                      ? "bg-amber-100 text-amber-700"
                      : registrationStep === "registration"
                        ? "bg-primary text-primary-foreground"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {registrationStep === "login-required" ? (
                    <Lock className="h-5 w-5" />
                  ) : registrationStep === "registration" ? (
                    "1"
                  ) : (
                    "✓"
                  )}
                </div>
                <span className="text-foreground font-semibold">
                  {registrationStep === "login-required"
                    ? "Login Diperlukan"
                    : registrationStep === "registration"
                      ? "Konfirmasi Pendaftaran"
                      : "Berhasil"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRegistrationStep("closed")}
                className="text-foreground/50 hover:text-foreground text-xl"
              >
                ✕
              </button>
            </div>

            {registrationStep === "login-required" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">
                  Login Untuk Mendaftar
                </h2>
                <p className="text-foreground/70">
                  Anda harus masuk ke akun P!NGFEST untuk mendaftar di{" "}
                  <span className="font-semibold text-foreground">
                    {event.name}
                  </span>
                  .
                </p>

                <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 text-center space-y-2">
                  <Lock className="h-8 w-8 text-amber-600 mx-auto" />
                  <p className="font-semibold text-foreground">
                    Belum punya akun?
                  </p>
                  <p className="text-sm text-foreground/70">
                    Daftar gratis dalam waktu kurang dari satu menit.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={goToLogin}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold py-6"
                  >
                    Login Sekarang →
                  </Button>
                  <Link
                    href={`/register?next=${encodeURIComponent(`/event/${eventId}`)}`}
                  >
                    <Button variant="outline" className="w-full">
                      Buat Akun Baru
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setRegistrationStep("closed")}
                    variant="ghost"
                    className="w-full"
                  >
                    Nanti Saja
                  </Button>
                </div>
              </div>
            )}

            {registrationStep === "registration" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">
                  Review Your Registration
                </h2>
                <p className="text-foreground/70">
                  Please verify the event details before confirming your spot.
                </p>

                <div className="rounded-xl bg-muted p-6">
                  <div className="flex gap-4">
                    <div className="h-24 w-24 rounded-lg bg-linear-to-br from-primary/40 to-primary/80 flex-shrink-0" />
                    <div className="flex-1">
                      <Badge
                        className={`${status.bg} ${status.text} mb-2`}
                      >
                        {status.label}
                      </Badge>
                      <h3 className="font-bold text-foreground mb-2">
                        {event.name}
                      </h3>
                      <p className="text-sm text-foreground/70 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatEventDateTime(event.started_at)}
                      </p>
                      <p className="text-sm text-foreground/70 flex items-center gap-1 mt-1">
                        <Users className="h-4 w-4" />
                        Quota: {event.quota} Spots
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <Button
                    onClick={() => setRegistrationStep("confirmation")}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold py-6"
                  >
                    Konfirmasi Pendaftaran →
                  </Button>
                  <Button
                    onClick={() => setRegistrationStep("closed")}
                    variant="ghost"
                    className="w-full"
                  >
                    Cancel and Return
                  </Button>
                </div>
              </div>
            )}

            {registrationStep === "confirmation" && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">
                  Registration Confirmed!
                </h2>
                <p className="text-foreground/70">
                  Your spot has been secured for{" "}
                  <span className="font-semibold text-foreground">
                    {event.name}
                  </span>
                  .
                </p>

                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center">
                  <p className="text-2xl font-bold text-emerald-700 mb-2">✓</p>
                  <h3 className="font-bold text-foreground mb-2">
                    Registration Successful
                  </h3>
                  <p className="text-sm text-foreground/70">
                    You can now access the event details and add it to your
                    calendar.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setRegistrationStep("closed")}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold py-6"
                  >
                    Back to Event
                  </Button>
                  <Link href="/browse">
                    <Button variant="ghost" className="w-full">
                      Browse More Events
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
