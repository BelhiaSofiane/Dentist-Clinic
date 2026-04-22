# Dental Clinic Management System - Setup & Supabase Integration Guide

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Supabase Integration](#supabase-integration)
3. [Database Configuration](#database-configuration)
4. [Testing the Integration](#testing-the-integration)
5. [Troubleshooting](#troubleshooting)

---

## Environment Setup

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for version control) - [Download](https://git-scm.com/)
- **A Supabase account** - [Sign up for free](https://supabase.com)

### Step 1: Verify Node.js Installation

Open your terminal/command prompt and run:

\\\ash
node --version
npm --version
\\\

You should see version numbers for both. If not, install Node.js.

### Step 2: Navigate to Project

\\\ash
cd "C:\Users\sofia\Desktop\Paid projects\Dentist-clinic\Dentist-clinic"
\\\

### Step 3: Install Project Dependencies

\\\ash
npm install
\\\

This will install all required packages including:
- React & React DOM
- Supabase client
- Zustand (state management)
- i18next (translations)
- React Router
- Tailwind CSS
- date-fns
- lucide-react

Wait for the installation to complete (2-5 minutes depending on your internet speed).

### Step 4: Verify Installation

\\\ash
npm run build
\\\

This builds the project. You should see a "dist" folder created if successful.

---

## Supabase Integration

### Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Sign up"** in the top right
3. Sign up with:
   - Email and password, OR
   - GitHub account, OR
   - Google account
4. Confirm your email if you used email/password signup

### Step 2: Create a New Project

1. After logging in, click **"New project"**
2. Fill in the form:
   - **Project name**: \dentist-clinic\ (or your preferred name)
   - **Database password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
   - **Pricing plan**: Start with **Free** tier
3. Click **"Create new project"**
4. Wait for the project to initialize (2-3 minutes)

### Step 3: Get Your API Keys

Once your project is ready:

1. Go to **Settings** (gear icon in bottom left)
2. Click **API** in the sidebar
3. You'll see:
   - **Project URL** (your Supabase URL)
   - **Service Role Secret** (don't use this for frontend)
   - **Anon Public** (use this for frontend)

Copy these two values:
- **VITE_SUPABASE_URL** = Project URL
- **VITE_SUPABASE_ANON_KEY** = Anon Public key

### Step 4: Create Environment File

1. In your project root directory (\Dentist-clinic\ folder), create a file named \.env\
2. Add the following content (replace with your actual values):

\\\env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
\\\

**Example:**
\\\env
VITE_SUPABASE_URL=https://xyzabc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\\\

3. Save the file
4. **IMPORTANT**: Add \.env\ to \.gitignore\ (already done if present)

---

## Database Configuration

### Step 1: Access the SQL Editor

1. In Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** (or paste into the existing editor)

### Step 2: Create Tables

Copy the entire SQL schema from \database-schema.sql\ and paste it into the SQL editor.

The schema includes:
- **users** table
- **patients** table
- **appointments** table
- **queue** table
- Row Level Security (RLS) policies
- Helper functions

To find this file:

\\\
Project Root > database-schema.sql
\\\

### Step 3: Execute the SQL

1. Click **"Run"** button (or press Ctrl+Enter)
2. Wait for the query to execute
3. You should see "Query completed successfully"

If there are any errors, check the error message and try again.

### Step 4: Verify Tables Were Created

1. Click **"Table Editor"** in the left sidebar
2. You should see:
   - users
   - patients
   - appointments
   - queue

Click on each table to verify columns were created correctly.

### Step 5: Enable Row Level Security (RLS)

The SQL schema already includes RLS policies, but verify they're enabled:

1. Go to **Authentication** > **Policies**
2. Check that policies exist for each table
3. Verify RLS is enabled on each table (you should see a lock icon)

---

## User Setup

### Step 1: Create Admin User

1. Go to **Authentication** > **Users** in Supabase
2. Click **"Invite"** or **"Add user manually"**
3. Fill in:
   - **Email**: your-email@example.com
   - **Password**: temporary password (or auto-generate)
4. Click **"Send Invite"** or **"Create User"**

### Step 2: Assign Admin Role

1. Go to **SQL Editor**
2. Run this query (replace with the user's ID from Authentication):

\\\sql
INSERT INTO users (id, role) 
VALUES ('USER_ID_HERE', 'admin');
\\\

To get the USER_ID:
1. Go to **Authentication** > **Users**
2. Click on the user row
3. Copy the UUID from the URL or user details

### Step 3: Create Agent User (Optional)

Repeat steps 1-2 but use role \'agent'\ instead of \'admin'\:

\\\sql
INSERT INTO users (id, role) 
VALUES ('AGENT_USER_ID', 'agent');
\\\

---

## Testing the Integration

### Step 1: Start the Development Server

\\\ash
npm run dev
\\\

You should see:
\\\
  VITE v8.0.9  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
\\\

### Step 2: Open the Application

Open [http://localhost:5173/](http://localhost:5173/) in your browser

### Step 3: Login

1. You should see a login page
2. Enter the email and password of the admin user you created
3. Click **"Login"**

### Step 4: Test Features

**If login successful:**
- You'll see the Admin Dashboard
- Try adding a patient
- Try creating an appointment
- Navigate to the waiting room

**If login fails:**
- Check your Supabase credentials in \.env\
- Verify the user exists in Supabase Authentication
- Check browser console for errors (F12)

### Step 5: Verify Database Operations

1. After adding data through the app
2. Go to Supabase > **Table Editor**
3. Click on **patients** or **appointments** table
4. You should see the data you created in the app

---

## Environment Variables Reference

\\\env
# Required
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional (for production)
VITE_APP_ENV=development
VITE_APP_NAME=Dental Clinic Management
\\\

---

## File Structure for Supabase Integration

`
src/
├── lib/
│   └── supabase.js          # Supabase client configuration
├── context/
│   ├── authStore.js         # Authentication state
│   ├── patientStore.js      # Patient data management
│   ├── appointmentStore.js  # Appointment data management
│   └── queueStore.js        # Queue data management
└── pages/
    ├── Login.jsx            # Authentication page
    ├── AdminDashboard.jsx   # Admin interface
    ├── AgentDashboard.jsx   # Agent interface
    └── WaitingRoom.jsx      # Waiting room display
`

---

## Troubleshooting

### Issue: "VITE_SUPABASE_URL is undefined"

**Solution:**
1. Make sure \.env\ file exists in the project root
2. Restart the development server (\
pm run dev\)
3. Verify the exact format matches the template
4. Check for extra spaces before/after the \=\ sign

### Issue: "Invalid Supabase credentials"

**Solution:**
1. Go to Supabase > **Settings** > **API**
2. Copy the correct **Project URL** and **Anon Public** key
3. Update \.env\ file
4. Restart the development server

### Issue: Login page shows but can't login

**Solution:**
1. Verify user exists in Supabase > **Authentication** > **Users**
2. Make sure the user has a role assigned in the \users\ table
3. Check browser console (F12) for specific error messages
4. Verify RLS policies are correctly set up (should allow reading own data)

### Issue: "Table doesn't exist" error

**Solution:**
1. Go to Supabase > **SQL Editor**
2. Re-run the database schema SQL from \database-schema.sql\
3. Check that the SQL executed successfully
4. Go to **Table Editor** to verify all tables exist

### Issue: Can't create patients/appointments

**Solution:**
1. Check browser console for error messages (F12 > Console tab)
2. Verify RLS policies are enabled on the tables
3. Confirm user role is either 'admin' or 'agent' in the \users\ table
4. Check that Supabase project is not in "paused" state

### Issue: Real-time updates not working

**Solution:**
1. Go to Supabase > **Settings** > **Realtime**
2. Verify Realtime is enabled (should be by default)
3. Check that your browser allows WebSocket connections
4. Verify the subscription code in \WaitingRoom.jsx\

### Issue: CORS errors

**Solution:**
1. Supabase has CORS enabled by default for localhost
2. If deploying to production, add your domain to CORS settings in Supabase
3. Go to **Settings** > **API** > **CORS**
4. Add your production URL

---

## Next Steps

1. **Create test data**: Add sample patients and appointments
2. **Configure email notifications**: Set up email templates in Supabase
3. **Deploy to production**: Follow Supabase deployment guide
4. **Set up backups**: Enable automated backups in Supabase settings
5. **Monitor usage**: Check Supabase dashboard for usage statistics

---

## Useful Supabase Documentation

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
- [Database Basics](https://supabase.com/docs/guides/database)

---

## Quick Reference Commands

\\\ash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Install dependencies
npm install
\\\

---

## Getting Help

- **Supabase Community**: [discord.gg/supabase](https://discord.gg/supabase)
- **Project Issues**: Check GitHub issues or documentation
- **Browser Console**: Press F12 to see detailed error messages
- **Supabase Logs**: Check Supabase dashboard > **Settings** > **Logs**

---

**Last Updated**: April 21, 2026
**Version**: 1.0
