/*
  # Initial Restaurant Website Schema

  1. New Tables
    - `meals`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `category` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `active` (boolean)

    - `reservations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `date` (timestamp)
      - `guests` (integer)
      - `special_requests` (text)
      - `created_at` (timestamp)
      - `status` (text)

  2. Security
    - Enable RLS on all tables
    - Public can read active meals
    - Public can create reservations
    - Admin can manage all data
*/

-- Create meals table
CREATE TABLE meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

-- Create reservations table
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  date timestamptz NOT NULL,
  guests integer NOT NULL,
  special_requests text,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Policies for meals
CREATE POLICY "Public can view active meals" ON meals
  FOR SELECT USING (active = true);

CREATE POLICY "Admin can manage meals" ON meals
  FOR ALL TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com')
  WITH CHECK (auth.email() = 'miguel.haudek@gmail.com');

-- Policies for reservations
CREATE POLICY "Public can create reservations" ON reservations
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Admin can view all reservations" ON reservations
  FOR SELECT TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com');

CREATE POLICY "Admin can manage reservations" ON reservations
  FOR ALL TO authenticated
  USING (auth.email() = 'miguel.haudek@gmail.com')
  WITH CHECK (auth.email() = 'miguel.haudek@gmail.com');