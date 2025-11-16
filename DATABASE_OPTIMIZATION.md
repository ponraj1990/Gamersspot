# Database Optimization - Reduced Connection Dependency

## Problem
The application was saving to the database every second when timers were running, causing connection timeout issues, especially in non-Chrome browsers.

## Solution
Implemented intelligent throttling that:
1. **Saves critical changes immediately** (start/stop/done/customer name/extra controllers/snacks)
2. **Batches elapsed time updates** and saves them only once per minute
3. **Calculates elapsed time locally** based on `start_time` timestamp (no database dependency)

## How It Works

### Critical Changes (Saved Immediately)
These changes trigger an immediate database save:
- Timer start/stop (`isRunning` changes)
- Station marked as done (`isDone` changes)
- Customer name entered/changed
- Start time set (`startTime` changes)
- End time set (`endTime` changes)
- Extra controllers added/removed
- Snacks added/removed

### Elapsed Time Updates (Saved Every 1 Minute)
- Elapsed time is calculated locally using `start_time` timestamp
- UI updates every second (for display)
- Database is updated only once per minute (batched)
- Reduces database calls from 60 per minute to 1 per minute per station

## Benefits

1. **Reduced Connection Timeouts**
   - 60x fewer database calls during active sessions
   - Less strain on Supabase connection pooler
   - Better reliability across all browsers

2. **Better Performance**
   - Faster UI updates (no database wait)
   - Smoother timer display
   - Reduced serverless function invocations

3. **Data Integrity**
   - Critical changes saved immediately
   - Elapsed time calculated accurately from timestamps
   - No data loss if connection fails (local calculation continues)

## Technical Details

### Throttling Logic
- **Save Interval**: 60,000ms (1 minute)
- **Immediate Save**: Triggered by critical state changes
- **Batched Save**: Scheduled for elapsed time updates
- **Pending Updates**: Latest state is always saved (no data loss)

### Elapsed Time Calculation
- Uses `start_time` timestamp stored when timer starts
- Calculated locally: `elapsed = (now - start_time) + initial_elapsed`
- Works even when tab is inactive (timestamp-based)
- No database dependency for time calculation

## Code Changes

### `src/App.jsx`
- Added throttling logic in `useEffect` hook
- Compares previous state to detect critical changes
- Schedules batched saves for non-critical updates
- Maintains pending state to ensure latest data is saved

### Database Calls
- **Before**: ~60 calls/minute per running station
- **After**: 1 call/minute per station (or immediate for critical changes)

## Testing

To verify the optimization:
1. Start a timer and watch browser console
2. You should see database saves only:
   - Immediately when starting/stopping
   - Once per minute for elapsed time updates
3. Check Vercel function logs - should see far fewer `/api/stations` calls

## Notes

- Elapsed time is still displayed accurately (updated every second in UI)
- All critical operations (start/stop/done) save immediately
- If connection fails, elapsed time continues calculating locally
- On next successful save, the correct elapsed time will be persisted

