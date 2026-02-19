-- ============================================================
-- Gourmet Haven - Complete Supabase Setup
-- ============================================================
-- Paste this entire file into the Supabase SQL Editor and run it.
--
-- IMPORTANT: Change the admin email below to match your Supabase auth user.
-- Currently set to: miguel.haudek@gmail.com
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  date date NOT NULL,
  time text NOT NULL,
  guests integer NOT NULL,
  notes text,
  special_requests text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  active boolean DEFAULT true,
  image_path text,
  created_at timestamptz DEFAULT now()
);

-- Opening Hours
CREATE TABLE IF NOT EXISTS opening_hours (
  id text PRIMARY KEY,
  day text NOT NULL,
  open text DEFAULT '09:00',
  close text DEFAULT '22:00',
  closed boolean DEFAULT false
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Emails
CREATE TABLE IF NOT EXISTS emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "to" text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- ----- Reservations -----
-- Anyone can create a reservation
CREATE POLICY "Anyone can insert reservations"
  ON reservations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admin can view reservations
CREATE POLICY "Admin can view reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com');

-- Only admin can update reservations
CREATE POLICY "Admin can update reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com');

-- Only admin can delete reservations
CREATE POLICY "Admin can delete reservations"
  ON reservations FOR DELETE
  TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com');

-- ----- Menu Items -----
-- Anyone can view active menu items
CREATE POLICY "Anyone can view active menu items"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (active = true OR auth.email() = 'miguel.haudek@gmail.com');

-- Admin can insert menu items
CREATE POLICY "Admin can insert menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() = 'miguel.haudek@gmail.com');

-- Admin can update menu items
CREATE POLICY "Admin can update menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com');

-- Admin can delete menu items
CREATE POLICY "Admin can delete menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com');

-- ----- Opening Hours -----
-- Anyone can view opening hours
CREATE POLICY "Anyone can view opening hours"
  ON opening_hours FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin can insert opening hours
CREATE POLICY "Admin can insert opening hours"
  ON opening_hours FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() = 'miguel.haudek@gmail.com');

-- Admin can update opening hours
CREATE POLICY "Admin can update opening hours"
  ON opening_hours FOR UPDATE
  TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com');

-- Admin can delete opening hours
CREATE POLICY "Admin can delete opening hours"
  ON opening_hours FOR DELETE
  TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com');

-- ----- System Settings -----
-- Anyone can view system settings
CREATE POLICY "Anyone can view system settings"
  ON system_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin can insert system settings
CREATE POLICY "Admin can insert system settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() = 'miguel.haudek@gmail.com');

-- Admin can update system settings
CREATE POLICY "Admin can update system settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com');

-- Admin can delete system settings
CREATE POLICY "Admin can delete system settings"
  ON system_settings FOR DELETE
  TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com');

-- ----- Emails -----
-- Anyone can insert emails (for reservation confirmations)
CREATE POLICY "Anyone can insert emails"
  ON emails FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin can view emails
CREATE POLICY "Admin can view emails"
  ON emails FOR SELECT
  TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com');

-- ============================================================
-- 3. STORAGE
-- ============================================================

-- Create menu-images bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view menu images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'menu-images');

CREATE POLICY "Admin can upload menu images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'menu-images' AND auth.email() = 'miguel.haudek@gmail.com');

CREATE POLICY "Admin can update menu images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'menu-images' AND auth.email() = 'miguel.haudek@gmail.com');

CREATE POLICY "Admin can delete menu images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'menu-images' AND auth.email() = 'miguel.haudek@gmail.com');

-- ============================================================
-- 4. SEED DATA
-- ============================================================

-- Opening Hours (Monday-Sunday)
INSERT INTO opening_hours (id, day, open, close, closed) VALUES
  ('monday', 'Monday', '11:00', '23:00', false),
  ('tuesday', 'Tuesday', '11:00', '23:00', false),
  ('wednesday', 'Wednesday', '11:00', '23:00', false),
  ('thursday', 'Thursday', '11:00', '23:00', false),
  ('friday', 'Friday', '11:00', '23:00', false),
  ('saturday', 'Saturday', '12:00', '23:00', false),
  ('sunday', 'Sunday', '12:00', '23:00', false)
ON CONFLICT (id) DO NOTHING;

-- System Settings
INSERT INTO system_settings (key, value, description) VALUES
  ('total_tables', '10', 'Total number of tables'),
  ('seats_per_table', '4', 'Seats per table'),
  ('reservation_duration', '120', 'Reservation duration in minutes'),
  ('min_reservation_notice', '60', 'Minimum reservation notice in minutes'),
  ('time_slot_interval', '30', 'Time slot interval in minutes')
ON CONFLICT (key) DO NOTHING;
