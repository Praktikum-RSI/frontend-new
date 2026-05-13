'use client'

import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'

export default function AttendeesPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header variant="admin" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-4">Attendees Management</h1>
            <p className="text-foreground/70">View and manage event attendees.</p>
          </div>
        </main>
      </div>
    </div>
  )
}
