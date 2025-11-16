-- Advanced Stations Cleanup Options
-- Choose the method that fits your needs
-- Run this in Supabase SQL Editor

-- ============================================
-- OPTION 1: Delete all stations (simple)
-- ============================================
-- DELETE FROM stations;

-- ============================================
-- OPTION 2: Delete only completed stations (is_done = true)
-- ============================================
-- DELETE FROM stations 
-- WHERE is_done = true;

-- ============================================
-- OPTION 3: Delete stations by game type
-- ============================================
-- Example: Delete all PS5 stations
-- DELETE FROM stations 
-- WHERE game_type = 'PS5';
--
-- Example: Delete all Steering Wheel stations
-- DELETE FROM stations 
-- WHERE game_type = 'Steering Wheel';
--
-- Example: Delete all System stations
-- DELETE FROM stations 
-- WHERE game_type = 'System';

-- ============================================
-- OPTION 4: Delete stations older than a specific date
-- ============================================
-- Example: Delete stations created more than 30 days ago
-- DELETE FROM stations 
-- WHERE created_at < NOW() - INTERVAL '30 days';
--
-- Example: Delete stations created before a specific date
-- DELETE FROM stations 
-- WHERE created_at < '2025-01-01';

-- ============================================
-- OPTION 5: Delete stations by specific IDs
-- ============================================
-- Example: Delete specific stations by ID
-- DELETE FROM stations 
-- WHERE id IN (1, 2, 3);

-- ============================================
-- OPTION 6: Delete stations with no activity (elapsed_time = 0)
-- ============================================
-- DELETE FROM stations 
-- WHERE elapsed_time = 0 
--   AND is_done = false 
--   AND is_running = false;

-- ============================================
-- OPTION 7: Reset stations to default state (keep structure, clear data)
-- ============================================
-- This will delete all stations and you can re-insert defaults
-- DELETE FROM stations;
-- Then run: database/insert_default_stations.sql

-- ============================================
-- OPTION 8: Delete and verify (with transaction)
-- ============================================
BEGIN;

-- Delete all stations
DELETE FROM stations;

-- Verify (should show 0)
SELECT COUNT(*) as remaining_stations FROM stations;

-- If you're satisfied, commit. Otherwise, ROLLBACK;
COMMIT;

-- ============================================
-- VERIFICATION QUERIES (run after cleanup)
-- ============================================

-- Check remaining station count
SELECT COUNT(*) as total_stations FROM stations;

-- View all remaining stations (if any)
-- SELECT * FROM stations ORDER BY id;

-- Check stations by game type
-- SELECT game_type, COUNT(*) as count 
-- FROM stations 
-- GROUP BY game_type;

-- Check completed vs active stations
-- SELECT 
--   is_done,
--   COUNT(*) as count 
-- FROM stations 
-- GROUP BY is_done;

