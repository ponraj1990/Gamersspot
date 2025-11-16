-- Gamers Spot Database Cleanup Script
-- This script will DELETE ALL DATA from stations and invoices tables
-- WARNING: This action cannot be undone!
-- Run this in your PostgreSQL database (Supabase SQL Editor, pgAdmin, etc.)

-- Disable triggers temporarily to avoid issues
SET session_replication_role = 'replica';

-- Delete all data from invoices table
DELETE FROM invoices;

-- Reset the sequence for invoices.id (since it uses SERIAL)
ALTER SEQUENCE invoices_id_seq RESTART WITH 1;

-- Delete all data from stations table
DELETE FROM stations;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify cleanup (optional - uncomment to check)
-- SELECT COUNT(*) as stations_count FROM stations;
-- SELECT COUNT(*) as invoices_count FROM invoices;

-- Success message
SELECT 'Database cleanup completed successfully!' as status;

