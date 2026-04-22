# Dentist Clinic

Modern React + Supabase app for managing patients, appointments, and the waiting room in a dental clinic.

## Highlights

- Role-based access with Supabase Auth (`admin` / `agent`)
- Patient and appointment management
- Appointment slot locking (already-booked time slots are disabled)
- Automatic queue sync for today's scheduled appointments
- Waiting room with realtime updates (Supabase Realtime)
- No-show flow and queue removal actions
- Multi-language support (English, French, Arabic with RTL support)

## Tech Stack

- React + Vite
- Tailwind CSS
- Zustand
- Supabase (Auth, Postgres, Realtime)
- i18next

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create or update `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configure Supabase

- Enable Email/Password auth in Supabase Authentication providers.
- Run SQL from `database-schema.sql` (and your latest migration SQL) in Supabase SQL editor.
- Ensure RLS + policies are enabled.

Recommended constraints:

```sql
-- Prevent duplicate active queue rows per patient
create unique index if not exists queue_unique_active_patient
on public.queue (patient_id)
where status in ('waiting', 'current');

-- Prevent duplicate active appointment slots
create unique index if not exists appointments_unique_active_datetime
on public.appointments (date_time)
where status <> 'canceled';
```

### 4. Create users and assign roles

Create auth users from Supabase dashboard, then assign app roles:

```sql
insert into public.users (id, role)
values
  ('ADMIN_USER_UUID', 'admin'),
  ('AGENT_USER_UUID', 'agent')
on conflict (id) do update set role = excluded.role;
```

### 5. Run locally

```bash
npm run dev
```

### 6. Build for production

```bash
npm run build
npm run preview
```

## Current Role Behavior

### Admin

- Full dashboard access
- Manage patients and appointments
- Queue control in Waiting Room (`Next Patient`, `Start Consultation`)
- Can remove queue entries and mark no-shows

### Agent

- Manage patients and appointments
- Can view waiting room
- Can remove queue entries and mark no-shows from dashboard queue table
- Cannot use Waiting Room admin control buttons

## Queue Flow (Current)

- Queue is filtered to **today** for cleaner daily operations.
- Today’s `scheduled`/`in-progress` appointments are auto-synced into queue.
- Duplicate active queue entries are prevented.
- `No Show` marks queue row as `done` and cancels the matching today appointment.
- Waiting room updates in realtime via Supabase subscriptions on `queue` and `appointments`.

## Project Structure

```text
src/
  components/      Reusable UI components
  context/         Zustand stores (auth, patients, appointments, queue)
  i18n/            Localization config and locale files
  lib/             Supabase client
  pages/           Route-level screens
```

## Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Lint project
```

## Notes

- `database-schema.sql` is the base schema reference.
- Supabase migration files are under `supabase/migrations/`.
- Make sure your deployment environment has the same `VITE_SUPABASE_*` variables.
