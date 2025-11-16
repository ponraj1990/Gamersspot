-- Insert Default Stations into Database
-- This script creates the default 7 stations:
-- - 5 PS5 Stations (IDs 1-5)
-- - 1 Steering Wheel (ID 6)
-- - 1 System Game (ID 7)
-- Run this in your PostgreSQL database (Supabase SQL Editor, pgAdmin, etc.)

-- Insert 5 PS5 Stations
INSERT INTO stations (id, name, game_type, elapsed_time, is_running, is_done, extra_controllers, snacks, customer_name, start_time, end_time)
VALUES
  (1, 'PS5 Station 1', 'PS5', 0, false, false, 0, '{"cokeBottle": 0, "cokeCan": 0}'::jsonb, '', NULL, NULL),
  (2, 'PS5 Station 2', 'PS5', 0, false, false, 0, '{"cokeBottle": 0, "cokeCan": 0}'::jsonb, '', NULL, NULL),
  (3, 'PS5 Station 3', 'PS5', 0, false, false, 0, '{"cokeBottle": 0, "cokeCan": 0}'::jsonb, '', NULL, NULL),
  (4, 'PS5 Station 4', 'PS5', 0, false, false, 0, '{"cokeBottle": 0, "cokeCan": 0}'::jsonb, '', NULL, NULL),
  (5, 'PS5 Station 5', 'PS5', 0, false, false, 0, '{"cokeBottle": 0, "cokeCan": 0}'::jsonb, '', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  game_type = EXCLUDED.game_type,
  elapsed_time = EXCLUDED.elapsed_time,
  is_running = EXCLUDED.is_running,
  is_done = EXCLUDED.is_done,
  extra_controllers = EXCLUDED.extra_controllers,
  snacks = EXCLUDED.snacks,
  customer_name = EXCLUDED.customer_name,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time;

-- Insert Steering Wheel Station
INSERT INTO stations (id, name, game_type, elapsed_time, is_running, is_done, extra_controllers, snacks, customer_name, start_time, end_time)
VALUES
  (6, 'Steering Wheel', 'Steering Wheel', 0, false, false, 0, '{"cokeBottle": 0, "cokeCan": 0}'::jsonb, '', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  game_type = EXCLUDED.game_type,
  elapsed_time = EXCLUDED.elapsed_time,
  is_running = EXCLUDED.is_running,
  is_done = EXCLUDED.is_done,
  extra_controllers = EXCLUDED.extra_controllers,
  snacks = EXCLUDED.snacks,
  customer_name = EXCLUDED.customer_name,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time;

-- Insert System Game Station
INSERT INTO stations (id, name, game_type, elapsed_time, is_running, is_done, extra_controllers, snacks, customer_name, start_time, end_time)
VALUES
  (7, 'System Game', 'System', 0, false, false, 0, '{"cokeBottle": 0, "cokeCan": 0}'::jsonb, '', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  game_type = EXCLUDED.game_type,
  elapsed_time = EXCLUDED.elapsed_time,
  is_running = EXCLUDED.is_running,
  is_done = EXCLUDED.is_done,
  extra_controllers = EXCLUDED.extra_controllers,
  snacks = EXCLUDED.snacks,
  customer_name = EXCLUDED.customer_name,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time;

-- Verify the default stations were inserted
SELECT 
  id, 
  name, 
  game_type, 
  elapsed_time, 
  is_running, 
  is_done 
FROM stations 
ORDER BY id;

-- Success message
SELECT 'Default stations inserted successfully!' as status;

