# P!NGFEST - Event Management Platform

A premium event management and discovery platform built with Next.js, based on your Stitch design system. The application provides both public-facing event discovery and a comprehensive admin dashboard.

## Project Overview

P!NGFEST is a modern event management hub featuring:
- **Public Event Discovery**: Browse and register for events with a beautiful, curated interface
- **Admin Dashboard**: Manage events, monitor registrations, and view attendee data
- **Premium Design**: Intentional minimalism with the "Digital Concierge" theme
- **Multi-page Architecture**: Scalable component-based structure

## Design System

The application uses colors and typography from your Stitch design:

- **Primary Color**: `#4648d4` (Electric Indigo) - Used for CTAs, active states, and primary actions
- **Secondary Color**: `#545c72` (Deep Navy) - Used for sidebars and accents
- **Accent Color**: `#00885d` (Emerald) - Used for success states and highlights
- **Background**: `#faf8ff` (Soft Lavender) - Light mode background
- **Surface**: `#ffffff` (White) - Card and elevated surfaces
- **Typography**: Inter font family for all text

## Project Structure

```
/app
  /admin                          # Admin dashboard routes
    /page.tsx                     # Main admin dashboard
    /events/page.tsx              # Events management
    /attendees/page.tsx           # Attendees management
    /reports/page.tsx             # Reports & analytics
    /settings/page.tsx            # Settings page
  /event
    /[id]/page.tsx                # Event detail & registration flow
  /browse/page.tsx                # Event discovery & search
  /page.tsx                       # Home/landing page
  layout.tsx                      # Root layout with metadata
  globals.css                     # Design tokens & global styles

/components
  header.tsx                      # Navigation header (public & admin)
  sidebar.tsx                     # Admin sidebar navigation
  event-card.tsx                  # Reusable event card component
```

## Key Pages & Features

### 1. **Home Page** (`/`)
- Landing page showcasing the platform
- Hero section with "Explore Events" CTA
- Feature cards highlighting key benefits
- Footer with links and branding

### 2. **Browse Events** (`/browse`)
- Full event discovery interface
- Search functionality
- Category filtering
- Grid layout displaying all events
- Event cards with status badges and registration information

### 3. **Event Detail & Registration** (`/event/[id]`)
- Detailed event information page
- Event description, speakers, and schedule
- Quota progress visualization
- Two-step registration modal:
  1. **Confirmation Step**: Review event details and personal information
  2. **Success Step**: Registration confirmation message

### 4. **Admin Dashboard** (`/admin`)
- Overview of recent events and registrations
- Events table with status, registrations, and actions
- Registrations table showing recent attendees
- Quick access buttons for creating events and searching

### 5. **Admin Subpages**
- **Events** (`/admin/events`) - Event management interface
- **Attendees** (`/admin/attendees`) - Attendee records and management
- **Reports** (`/admin/reports`) - Analytics and insights
- **Settings** (`/admin/settings`) - Platform configuration

## Components

### Header Component
- Public version: Navigation with Browse Events link, Features, Schedule, Pricing
- Admin version: Displays admin panel title and user info
- Responsive and sticky for easy navigation

### Sidebar Component
- Navigation menu with 5 main sections: Dashboard, Events, Attendees, Reports, Settings
- Active state indicators
- User profile card at the bottom
- Uses Lucide icons for visual clarity

### Event Card Component
- **Admin variant**: Horizontal layout with event details, status badge, registration count
- **Public variant**: Vertical card with event image placeholder, full details, and register button
- Status badges: ACTIVE (green), SCHEDULED (blue), DRAFT (gray)

## Color Palette Reference

```
Primary:        #4648d4  (Button, links, active states)
Secondary:      #545c72  (Sidebar, secondary elements)
Accent:         #00885d  (Success, highlights)
Error:          #ba1a1a  (Destructive actions)
Background:     #faf8ff  (Light mode background)
Surface:        #ffffff  (Cards, elevated surfaces)
Muted:          #eaedff  (Disabled, subtle backgrounds)
Foreground:     #131b2e  (Text, primary content)
```

## Getting Started

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### Routes to Explore
- `/` - Home page
- `/browse` - Event discovery
- `/event/1` - Event detail (sample)
- `/admin` - Admin dashboard
- `/admin/events` - Events management
- `/admin/attendees` - Attendees
- `/admin/reports` - Reports
- `/admin/settings` - Settings

## Features Implemented

✓ Responsive design (mobile-first approach)
✓ Dark mode support via CSS variables
✓ Navigation between all pages
✓ Admin dashboard with tables and metrics
✓ Event discovery with search & filtering
✓ Event detail page with registration modal
✓ Two-step registration confirmation flow
✓ Status badges and visual indicators
✓ Sidebar navigation with active states
✓ Accessibility considerations (semantic HTML, ARIA labels)

## Next Steps for Enhancement

- Add backend API integration (database for events/registrations)
- Implement authentication system
- Add form validation and error handling
- Create event creation/editing interface
- Add email confirmation for registrations
- Implement analytics for admin dashboard
- Add pagination for large event lists
- Create user profile pages
- Add calendar integration
- Implement real-time notification system

## Built With

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Lucide Icons** - Icon set
- **TypeScript** - Type safety

## Design Principles (From Stitch)

The design follows the "Digital Concierge" theme emphasizing:
- **Intentional Asymmetry**: Editorial feel with varied layouts
- **Breathing Room**: Generous spacing over information density
- **Premium Aesthetics**: Curated, gallery-like presentation
- **No-Line Rule**: Boundaries via background colors, not borders
- **Typography-First**: Large headers anchored left, balanced with floating cards

---

Created with Stitch design integration for P!NGFEST - your premium gate to world-class experiences.
