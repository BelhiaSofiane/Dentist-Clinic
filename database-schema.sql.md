-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;

-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'agent')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
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

-- Queue table
CREATE TABLE queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  status TEXT CHECK (status IN ('waiting', 'current', 'done')) DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Patients policies
CREATE POLICY "Authenticated users can view patients" ON patients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert patients" ON patients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Agents can update patients" ON patients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

CREATE POLICY "Admins can delete patients" ON patients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Appointments policies
CREATE POLICY "Authenticated users can view appointments" ON appointments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert appointments" ON appointments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update appointments" ON appointments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete appointments" ON appointments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Queue policies
CREATE POLICY "Authenticated users can view queue" ON queue
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert queue" ON queue
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update queue" ON queue
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete queue" ON queue
  FOR DELETE USING (auth.role() = 'authenticated');

-- Functions for queue management
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS src/pages/WaitingRoom.jsx
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE queue SET position = position - 1 WHERE position > OLD.position;
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    UPDATE queue SET position = position + 1 WHERE position >= NEW.position AND id != NEW.id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
src/pages/WaitingRoom.jsx LANGUAGE plpgsql;

CREATE TRIGGER queue_position_trigger
  AFTER INSERT OR DELETE ON queue
  FOR EACH ROW EXECUTE FUNCTION update_queue_positions();
