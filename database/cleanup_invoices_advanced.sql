-- Advanced Invoices Cleanup Options
-- Choose the method that fits your needs
-- Run this in Supabase SQL Editor

-- ============================================
-- OPTION 1: Delete all invoices (simple)
-- ============================================
-- DELETE FROM invoices;
-- ALTER SEQUENCE invoices_id_seq RESTART WITH 1;

-- ============================================
-- OPTION 2: Delete invoices older than a specific date
-- ============================================
-- Example: Delete invoices older than 30 days
-- DELETE FROM invoices 
-- WHERE created_at < NOW() - INTERVAL '30 days';
-- 
-- Example: Delete invoices older than a specific date
-- DELETE FROM invoices 
-- WHERE created_at < '2025-01-01';

-- ============================================
-- OPTION 3: Delete invoices by date range
-- ============================================
-- Example: Delete invoices from a specific date range
-- DELETE FROM invoices 
-- WHERE created_at >= '2025-01-01' 
--   AND created_at < '2025-02-01';

-- ============================================
-- OPTION 4: Delete invoices with specific invoice numbers
-- ============================================
-- Example: Delete specific invoices by invoice number
-- DELETE FROM invoices 
-- WHERE invoice_number IN ('INV-123456', 'INV-789012');

-- ============================================
-- OPTION 5: Truncate table (fastest, resets everything)
-- ============================================
-- TRUNCATE TABLE invoices RESTART IDENTITY CASCADE;
-- This will:
-- - Delete all rows instantly
-- - Reset the sequence to 1
-- - Cannot be rolled back (no transaction)

-- ============================================
-- OPTION 6: Delete and verify (with transaction)
-- ============================================
BEGIN;

-- Delete all invoices
DELETE FROM invoices;

-- Reset sequence
ALTER SEQUENCE invoices_id_seq RESTART WITH 1;

-- Verify (should show 0)
SELECT COUNT(*) as remaining_invoices FROM invoices;

-- If you're satisfied, commit. Otherwise, ROLLBACK;
COMMIT;

-- ============================================
-- VERIFICATION QUERIES (run after cleanup)
-- ============================================

-- Check remaining invoice count
SELECT COUNT(*) as total_invoices FROM invoices;

-- Check the next invoice number that will be generated
SELECT nextval('invoices_id_seq') as next_invoice_id;
-- (Note: This will increment the sequence, so run this only if you want to check)

-- View all remaining invoices (if any)
-- SELECT * FROM invoices ORDER BY created_at DESC;

