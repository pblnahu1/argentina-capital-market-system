/*
  # Market System Database Schema

  1. New Tables
    - `market_data`
      - `symbol` (text, primary key) - Stock symbol
      - `price` (decimal) - Current stock price
      - `change` (decimal) - Price change percentage
      - `volume` (bigint) - Trading volume
      - `last_update` (timestamptz) - Last update timestamp
    
    - `instructions`
      - `id` (uuid, primary key) - Unique instruction ID
      - `symbol` (text) - Stock symbol
      - `type` (text) - BUY or SELL
      - `quantity` (integer) - Number of shares
      - `price` (decimal) - Price per share
      - `status` (text) - PENDING, EXECUTED, or CANCELLED
      - `timestamp` (timestamptz) - Creation timestamp
      - `user_id` (uuid) - Reference to auth.users
  
  2. Security
    - Enable RLS on both tables
    - Market data is readable by all authenticated users
    - Instructions are only readable/writable by their owners
*/

-- Create market_data table
CREATE TABLE market_data (
  symbol text PRIMARY KEY,
  price decimal NOT NULL CHECK (price > 0),
  change decimal NOT NULL,
  volume bigint NOT NULL CHECK (volume >= 0),
  last_update timestamptz NOT NULL DEFAULT now()
);

-- Create instructions table
CREATE TABLE instructions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  type text NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity integer NOT NULL CHECK (quantity > 0),
  price decimal NOT NULL CHECK (price > 0),
  status text NOT NULL CHECK (status IN ('PENDING', 'EXECUTED', 'CANCELLED')) DEFAULT 'PENDING',
  timestamp timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructions ENABLE ROW LEVEL SECURITY;

-- Market data policies
CREATE POLICY "Market data is viewable by authenticated users"
  ON market_data
  FOR SELECT
  TO authenticated
  USING (true);

-- Instructions policies
CREATE POLICY "Users can view their own instructions"
  ON instructions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own instructions"
  ON instructions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert sample market data
INSERT INTO market_data (symbol, price, change, volume) VALUES
  ('GGAL', 850.25, 2.5, 1500000),
  ('YPF', 945.75, -1.2, 2100000),
  ('PAMP', 625.50, 0.8, 980000)
ON CONFLICT (symbol) DO UPDATE SET
  price = EXCLUDED.price,
  change = EXCLUDED.change,
  volume = EXCLUDED.volume,
  last_update = now();