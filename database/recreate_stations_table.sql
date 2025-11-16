-- Recreate Stations Table for Supabase
-- Run this in Supabase SQL Editor if you accidentally deleted the stations table

-- Create the stations table
CREATE TABLE IF NOT EXISTS stations (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  game_type VARCHAR(50) NOT NULL,
  elapsed_time INTEGER DEFAULT 0,
  is_running BOOLEAN DEFAULT false,
  is_done BOOLEAN DEFAULT false,
  extra_controllers INTEGER DEFAULT 0,
  snacks JSONB DEFAULT '{"cokeBottle": 0, "cokeCan": 0}'::jsonb,
  customer_name VARCHAR(255) DEFAULT '',
  start_time VARCHAR(50),
  end_time VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stations_is_done ON stations(is_done);
CREATE INDEX IF NOT EXISTS idx_stations_game_type ON stations(game_type);

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on station updates
DROP TRIGGER IF EXISTS update_stations_updated_at ON stations;
CREATE TRIGGER update_stations_updated_at 
    BEFORE UPDATE ON stations
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify table was created
SELECT 'Stations table created successfully!' as status;

