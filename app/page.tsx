"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Sparkles, Users } from "lucide-react";
import { Header } from "@/components/header";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { type Event, eventsApi } from "@/lib/events";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await eventsApi.list();
        if (!cancelled) setEvents(res.data ?? []);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Gagal memuat event");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = events.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-20 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              P!NGFEST Platform
            </div>
            <h1 className="text-6xl font-bold text-foreground leading-tight">
              Your Premium Gate to <br />
              <span className="text-primary">World-Class Experiences</span>
            </h1>
            <p className="text-2xl text-foreground/70 max-w-2xl">
              Discover, register, and attend extraordinary events crafted for
              inspiration and connection.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/browse">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg">
                Explore Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Featured Events from Database */}
        <section className="py-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-foreground">
                Featured Events
              </h2>
              <p className="text-foreground/70 mt-2">
                Curated picks happening soon
              </p>
            </div>
            <Link
              href="/browse"
              className="text-primary hover:text-primary/80 font-semibold text-sm flex items-center gap-1"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-96 rounded-2xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-destructive">
              {error}
            </div>
          ) : featured.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="text-foreground/70">
                Belum ada event saat ini. Cek kembali nanti!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((event) => (
                <EventCard key={event.id} event={event} variant="public" />
              ))}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Sparkles,
              title: "Curated Events",
              description:
                "Access exclusively selected events designed for premium experiences and meaningful connections.",
            },
            {
              icon: CalendarCheck,
              title: "Seamless Registration",
              description:
                "Quick and secure registration process with instant confirmation and event details.",
            },
            {
              icon: Users,
              title: "Community Hub",
              description:
                "Connect with like-minded professionals and enthusiasts from around the world.",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-8 rounded-2xl bg-card border border-border hover:border-primary transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-foreground/70">{feature.description}</p>
              </div>
            );
          })}
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-foreground mb-4">P!NGFEST</h4>
              <p className="text-sm text-foreground/70">
                Your premium gate to world-class experiences.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Security"] },
              { title: "Company", links: ["About", "Blog", "Careers"] },
              { title: "Legal", links: ["Privacy", "Terms", "Support"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-foreground mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-foreground/70 hover:text-primary transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-center text-sm text-foreground/70">
              © 2026 P!NGFEST. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
