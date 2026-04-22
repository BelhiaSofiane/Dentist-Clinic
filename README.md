# Dental Clinic Management System

A full-stack web application for managing a dental clinic with role-based access control.

## Features

- **Patient Management**: Add, edit, and view patient information
- **Appointment Scheduling**: Calendar-based scheduling with drag & drop
- **Waiting Room System**: Real-time queue management with TV display
- **Role-Based Access Control**: Admin (Dentist) and Agent (Receptionist) roles
- **Multi-language Support**: English, French, Arabic with RTL support
- **Real-time Updates**: Live queue updates using Supabase Realtime

## Tech Stack

- **Frontend**: React 19 with functional components and hooks
- **Backend/Database/Auth**: Supabase
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Internationalization**: i18next
- **Routing**: React Router

## Setup Instructions

### 1. Clone and Install Dependencies

`ash
npm install
`

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update .env file with your Supabase credentials:

`
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
`

### 3. Database Setup

Run the SQL commands in database-schema.sql in your Supabase SQL editor.

### 4. Create Users

Create user accounts in Supabase Auth and assign roles in the users table:

`sql
INSERT INTO users (id, role) VALUES ('user-uuid', 'admin');
INSERT INTO users (id, role) VALUES ('user-uuid', 'agent');
`

### 5. Run the Application

`ash
npm run dev
`

## Project Structure

`
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── context/            # Zustand stores
├── lib/                # Supabase client
├── i18n/               # Internationalization
├── hooks/              # Custom hooks
└── utils/              # Utility functions
`

## Roles and Permissions

### Admin (Dentist)
- Full access to all features
- Manage patients (add, edit, delete)
- Manage appointments (create, edit, delete)
- Control waiting room queue
- View all data

### Agent (Receptionist)
- Add and edit patients
- Create and modify appointments
- View patient and appointment data
- No deletion permissions
- No access to system settings

## Database Schema

### users
- id (UUID, FK to auth.users)
- role (admin | agent)

### patients
- id (UUID)
- name (TEXT)
- phone (TEXT)
- notes (TEXT)
- created_at (TIMESTAMP)

### appointments
- id (UUID)
- patient_id (UUID, FK)
- date_time (TIMESTAMP)
- duration (INTEGER)
- reason (TEXT)
- status (scheduled | in-progress | completed | canceled)
- created_by (UUID, FK)

### queue
- id (UUID)
- patient_id (UUID, FK)
- position (INTEGER)
- status (waiting | current | done)

## Real-time Features

The waiting room uses Supabase Realtime subscriptions to provide live updates of the queue status.

## Multi-language Support

The app supports English, French, and Arabic. Arabic includes RTL text direction support.

## Development

### Available Scripts

- 
pm run dev - Start development server
- 
pm run build - Build for production
- 
pm run preview - Preview production build
- 
pm run lint - Run ESLint

### Adding New Features

1. Create components in src/components/
2. Add state management in src/context/ using Zustand
3. Update translations in src/i18n/locales/
4. Add routes in App.jsx

## Deployment

Build the project and deploy the dist folder to your hosting provider.

Make sure to set the environment variables in your deployment platform.
