# Multi-Device Synchronization

## Problem
Changes made on one device (browser/mobile) were not reflected on other devices. For example, marking a station as "Done" on desktop wouldn't show on mobile.

## Solution
Implemented real-time synchronization that polls the database every 10 seconds and intelligently merges changes from all devices.

## How It Works

### 1. Periodic Sync
- **Sync Interval**: Every 10 seconds
- **Sync Trigger**: Also syncs when page becomes visible (user switches back to tab)
- **Method**: GET request to fetch latest stations from database

### 2. Intelligent Merge Logic

The system uses priority-based merging to handle conflicts:

#### Priority 1: "Done" Status (Highest Priority)
- If another device marks a station as "Done", **always accept it**
- Stops local timer if it's running
- Uses the higher elapsed time (most accurate)
- Accepts end time from remote

#### Priority 2: Running Timers
- If local timer is running, preserve:
  - Local `elapsedTime` (calculated from timestamp)
  - Local `isRunning` state
  - Local `startTime`
- But accept from remote:
  - `customerName` changes
  - `extraControllers` changes
  - `snacks` changes

#### Priority 3: Remote Timer Started
- If remote timer is running and local is not, accept remote state
- This allows timers started on other devices to appear locally

#### Priority 4: Default Merge
- For stopped/non-running timers, accept remote state
- Use higher elapsed time if available

### 3. Conflict Resolution

**Scenario 1: Timer running on Device A, marked Done on Device B**
- Device A will stop timer and show "Done" status
- Elapsed time preserved (uses maximum of both)

**Scenario 2: Timer running on Device A, customer name changed on Device B**
- Device A keeps timer running
- Device A accepts new customer name

**Scenario 3: Timer started on Device A**
- Device B will see timer start within 10 seconds
- Elapsed time calculated from `startTime` timestamp

## Benefits

1. **Real-Time Updates**
   - Changes appear on all devices within 10 seconds
   - No manual refresh needed

2. **No Data Loss**
   - Running timers preserved locally
   - Critical changes (Done status) always accepted
   - Highest elapsed time used (most accurate)

3. **Conflict-Free**
   - Priority system prevents conflicts
   - "Done" status always wins (prevents double-billing)

4. **Efficient**
   - Only GET requests for sync (no save overhead)
   - Sync only updates when changes detected
   - Prevents sync loops with `isSyncingRef` flag

## Technical Details

### Sync Function
```javascript
syncStationsFromDatabase()
```
- Checks if already syncing (prevents loops)
- Fetches stations from database
- Merges with local state intelligently
- Only updates if changes detected

### Merge Function
```javascript
mergeStations(localStations, remoteStations)
```
- Handles all conflict scenarios
- Preserves local running timers
- Accepts critical remote changes
- Returns merged station array

### Sync Triggers
1. **Periodic**: Every 10 seconds via `setInterval`
2. **Visibility**: When page becomes visible (tab switch)
3. **Initial Load**: On app startup

## Testing

To verify sync is working:

1. **Open app on two devices** (e.g., desktop and mobile)
2. **Start a timer on Device A**
3. **Check Device B** - timer should appear within 10 seconds
4. **Mark as Done on Device A**
5. **Check Device B** - should show "Done" status within 10 seconds
6. **Change customer name on Device B**
7. **Check Device A** - should see new name within 10 seconds

## Performance

- **Sync Frequency**: 10 seconds (reduces database calls)
- **Network Impact**: Minimal (GET requests only)
- **Database Load**: Low (read-only sync, 6 calls per minute per device)
- **UI Impact**: None (async, non-blocking)

## Notes

- Sync only reads from database (no save conflicts)
- Local saves are throttled (1 minute) to reduce connection issues
- Sync merges intelligently (no data overwrites)
- Works across all browsers and devices
- Handles offline gracefully (syncs when connection restored)

