-- Cleanup Stations Table
-- This script will DELETE ALL DATA from the stations table only
-- WARNING: This action cannot be undone!
-- Run this in Supabase SQL Editor

-- Option 1: Delete all stations (keeps table structure)
DELETE FROM stations;

-- Verify cleanup
SELECT COUNT(*) as remaining_stations FROM stations;

-- Success message
SELECT 'Stations table cleaned successfully! All stations deleted.' as status;

