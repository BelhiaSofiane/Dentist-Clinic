-- =========================================
-- 1. TABLES
-- =========================================

CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'agent')) NOT NULL DEFAULT 'agent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'in-progress', 'completed', 'canceled')) DEFAULT 'scheduled',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  status TEXT CHECK (status IN ('waiting', 'current', 'done')) DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 2. ENABLE RLS
-- =========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 3. ROLE HELPER (NO RLS RECURSION FIX)
-- =========================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- =========================================
-- 4. USERS POLICIES
-- =========================================

CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can manage users"
ON users
FOR ALL
USING (public.get_my_role() = 'admin');

-- =========================================
-- 5. PATIENTS POLICIES
-- =========================================

CREATE POLICY "View patients"
ON patients
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Insert patients"
ON patients
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Update patients (admin/agent)"
ON patients
FOR UPDATE
USING (public.get_my_role() IN ('admin', 'agent'));

CREATE POLICY "Delete patients (admin only)"
ON patients
FOR DELETE
USING (public.get_my_role() = 'admin');

-- =========================================
-- 6. APPOINTMENTS POLICIES
-- =========================================

CREATE POLICY "View appointments"
ON appointments
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Insert appointments"
ON appointments
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Update appointments"
ON appointments
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Delete appointments (admin only)"
ON appointments
FOR DELETE
USING (public.get_my_role() = 'admin');

-- =========================================
-- 7. QUEUE POLICIES
-- =========================================

CREATE POLICY "View queue"
ON queue
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Insert queue"
ON queue
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Update queue"
ON queue
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Delete queue"
ON queue
FOR DELETE
USING (auth.role() = 'authenticated');

-- =========================================
-- 8. SAFE QUEUE POSITIONING SYSTEM
-- =========================================

CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE queue
    SET position = position + 1
    WHERE position >= NEW.position
      AND id != NEW.id;

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE queue
    SET position = position - 1
    WHERE position > OLD.position;

    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER queue_position_trigger
AFTER INSERT OR DELETE ON queue
FOR EACH ROW
EXECUTE FUNCTION update_queue_positions();

-- =========================================
-- 9. INDEXES (PERFORMANCE)
-- =========================================

CREATE INDEX idx_queue_position ON queue(position);
CREATE INDEX idx_queue_status ON queue(status);
CREATE INDEX idx_appointments_date ON appointments(date_time);

-- =========================================
-- 10. REALTIME ENABLEMENT
-- =========================================

ALTER PUBLICATION supabase_realtime ADD TABLE queue;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;