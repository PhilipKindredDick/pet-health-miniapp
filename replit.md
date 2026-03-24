# Pet Medical Passport

## Overview

A mobile-first web application designed as a **Telegram Mini App** for managing pet health records and medical history. Users can track multiple pets, log vaccinations, vet visits, surgeries, and medications, set reminders for upcoming appointments, and export medical history as PDF reports. The app supports multiple languages (Russian as default, English available) and provides data backup/restore functionality via JSON export/import.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration and CSS variables
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: i18next for multi-language support (Russian default, English available)
- **Telegram Integration**: Telegram Web App SDK for Mini App functionality
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful JSON API with typed route definitions
- **Validation**: Zod schemas shared between client and server via `@shared/` directory

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` defines all database tables and Zod schemas
- **Migrations**: Drizzle Kit for database schema management (`npm run db:push`)

### Key Data Models
- **Pets**: Core entity with name, species, breed, birth date, weight, microchip number
- **Medical Records**: Linked to pets, includes vaccinations, visits, surgeries, medications with dates, doctor/clinic info, and costs
- **Reminders**: Scheduled notifications for upcoming appointments with recurring option

### API Structure
- Routes defined in `shared/routes.ts` with Zod input/output schemas
- Server implementation in `server/routes.ts`
- Client hooks in `client/src/hooks/` wrap fetch calls with React Query

### PDF Generation
- Uses jsPDF and jspdf-autotable for generating downloadable medical history reports

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- connect-pg-simple for session storage

### Frontend Libraries
- Radix UI primitives for accessible components
- Embla Carousel for carousel functionality
- date-fns for date manipulation
- Lucide React for icons

### Build & Development
- Vite for frontend bundling
- esbuild for production server bundling
- TSX for TypeScript execution in development

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string

## Telegram Mini App Integration

### SDK Setup
- Telegram Web App SDK loaded via CDN in `client/index.html`
- SDK initialized in `client/src/main.tsx` with `ready()` and `expand()` calls
- Custom hook `useTelegram` in `client/src/hooks/use-telegram.ts` provides access to Telegram APIs

### Telegram Features Used
- User info (first_name, photo_url) displayed in Dashboard header
- Theme adaptation via CSS variables (--tg-theme-*)
- MainButton available for key actions

### Key Files
- `client/src/lib/telegram.ts` - Telegram SDK utilities
- `client/src/hooks/use-telegram.ts` - React hook for Telegram context
- `client/src/lib/i18n.ts` - Localization with Russian as default language