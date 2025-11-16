-- Gamers Spot Database Complete Cleanup Script
-- This script will DELETE ALL DATA and RESET tables to default state
-- WARNING: This action cannot be undone!
-- Run this in your PostgreSQL database (Supabase SQL Editor, pgAdmin, etc.)

BEGIN;

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- Delete all data from invoices table
TRUNCATE TABLE invoices RESTART IDENTITY CASCADE;

-- Delete all data from stations table
TRUNCATE TABLE stations RESTART IDENTITY CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

COMMIT;

-- Verify cleanup
SELECT 
    'stations' as table_name, 
    COUNT(*) as remaining_rows 
FROM stations
UNION ALL
SELECT 
    'invoices' as table_name, 
    COUNT(*) as remaining_rows 
FROM invoices;

SELECT 'Database cleanup completed successfully! All tables are now empty.' as status;

