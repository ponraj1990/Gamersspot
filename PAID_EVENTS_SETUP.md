# Paid Events Multi-Browser Sync Setup

This feature enables the "Paid" button to work across multiple browsers/devices by tracking paid events in an intermediate database table.

## Database Setup

1. **Run the SQL schema** to create the `paid_events` table:
   ```sql
   -- Run this in your Supabase SQL Editor or PostgreSQL database
   -- File: database/paid_events_schema.sql
   ```

2. **The table will track:**
   - Invoice number
   - Station IDs that were reset
   - Reset data (all station properties after reset)
   - Timestamp
   - Processed flag (to prevent duplicate processing)

## How It Works

1. **When "Paid" is clicked in Browser A:**
   - Stations are reset locally
   - Reset data is saved to database
   - A paid event is created in `paid_events` table

2. **Browser B (and all other browsers):**
   - Polls the `paid_events` table every 3 seconds
   - Detects new paid events
   - Automatically resets the same stations
   - Updates local state and database

3. **Benefits:**
   - ✅ Works across all browsers/devices
   - ✅ No manual refresh needed
   - ✅ Automatic synchronization
   - ✅ Prevents duplicate processing (events marked as processed)

## API Endpoints

- `POST /api/paid-events` - Create a paid event
- `GET /api/paid-events` - Get recent unprocessed events (last 5 minutes)
- `GET /api/paid-events?since=ISO_TIMESTAMP` - Get events since a specific time

## Testing

1. Open the app in two different browsers
2. Complete a session and generate an invoice in Browser A
3. Click "Paid" in Browser A
4. Within 3 seconds, Browser B should automatically reset the same stations

## Cleanup

The system automatically marks events as "processed" after they're read. Old processed events (older than 24 hours) can be cleaned up using the cleanup function in the schema.

