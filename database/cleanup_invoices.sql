-- Cleanup Invoices Table
-- This script will DELETE ALL DATA from the invoices table only
-- WARNING: This action cannot be undone!
-- Run this in Supabase SQL Editor

-- Option 1: Delete all invoices (keeps table structure)
DELETE FROM invoices;

-- Reset the sequence for invoices.id (starts from 1 again)
ALTER SEQUENCE invoices_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT COUNT(*) as remaining_invoices FROM invoices;

-- Success message
SELECT 'Invoices table cleaned successfully! All invoices deleted and sequence reset.' as status;

