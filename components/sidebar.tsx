'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Calendar, Users, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { icon: LayoutGrid, label: 'Dashboard', href: '/admin' },
  { icon: Calendar, label: 'Events', href: '/admin/events' },
  { icon: Users, label: 'Attendees', href: '/admin/attendees' },
  { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 border-r border-sidebar-border bg-sidebar">
      <div className="p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-sidebar-foreground/70">
          Admin Panel
        </h2>
        <p className="text-xs uppercase tracking-widest text-sidebar-foreground/50 mt-1">
          EVENT MANAGEMENT
        </p>
      </div>

      <nav className="space-y-2 px-4 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-6 left-4 right-4 flex items-center gap-3 rounded-lg bg-sidebar-accent p-4">
        <div className="h-10 w-10 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold">
          🔔
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-sidebar-foreground">Admin User</p>
          <p className="text-xs text-sidebar-foreground/70">Super Admin</p>
        </div>
      </div>
    </aside>
  )
}
