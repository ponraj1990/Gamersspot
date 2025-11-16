# Testing Voice Alert Functionality

This guide explains how to quickly test the 5-minute warning and 1-hour completion voice alerts without waiting 55 minutes.

## Method 1: Test Mode (Recommended - Fastest)

Test mode makes **1 second = 1 minute**, so you can test in just 60 seconds!

### Steps:

1. **Open your browser's Developer Console**
   - Press `F12` or `Right-click` → `Inspect` → `Console` tab

2. **Enable Test Mode**
   ```javascript
   localStorage.setItem('testMode', 'true')
   ```

3. **Refresh the page** (to apply test mode)

4. **Start a timer** on any station (e.g., PS5 Station 2)

5. **Wait for the alerts:**
   - At **55 seconds**: You'll hear "PS5 Station 2 - you have 5 minutes left for 1 hour"
   - At **60 seconds**: You'll hear "PS5 Station 2 - you have completed 1 hour"

6. **Disable Test Mode** when done:
   ```javascript
   localStorage.removeItem('testMode')
   ```
   Then refresh the page to return to normal mode.

---

## Method 2: Manual Time Setting (Instant Testing)

You can instantly set the elapsed time to test specific milestones without waiting.

### Steps:

1. **Open your browser's Developer Console** (`F12`)

2. **Find the station ID** you want to test
   - Station IDs are usually: 1, 2, 3, 4, 5 (for PS5 stations), 6 (Steering Wheel), 7 (System Game)

3. **Test the 5-minute warning (55 minutes):**
   ```javascript
   // For PS5 Station 2 (assuming ID is 2)
   window.testStationTime_2(3300)  // 3300 seconds = 55 minutes
   ```

4. **Test the 1-hour completion:**
   ```javascript
   window.testStationTime_2(3600)  // 3600 seconds = 1 hour
   ```

5. **Or test with test mode enabled (faster):**
   ```javascript
   localStorage.setItem('testMode', 'true')
   // Refresh page first, then:
   window.testStationTime_2(55)   // 55 seconds = 55 minutes in test mode
   window.testStationTime_2(60)   // 60 seconds = 1 hour in test mode
   ```

### Available Test Functions:

- `window.testStationTime_1(seconds)` - Test Station 1
- `window.testStationTime_2(seconds)` - Test Station 2
- `window.testStationTime_3(seconds)` - Test Station 3
- `window.testStationTime_4(seconds)` - Test Station 4
- `window.testStationTime_5(seconds)` - Test Station 5
- `window.testStationTime_6(seconds)` - Test Steering Wheel
- `window.testStationTime_7(seconds)` - Test System Game
- `window.testAllStations(seconds)` - Test all stations at once

---

## Quick Test Examples

### Example 1: Test 5-minute warning instantly
```javascript
// Enable test mode
localStorage.setItem('testMode', 'true')
// Refresh page, then:
window.testStationTime_2(55)  // Instantly triggers 5-minute warning
```

### Example 2: Test 1-hour completion instantly
```javascript
// Enable test mode
localStorage.setItem('testMode', 'true')
// Refresh page, then:
window.testStationTime_2(60)  // Instantly triggers 1-hour completion
```

### Example 3: Test both in sequence
```javascript
// Enable test mode
localStorage.setItem('testMode', 'true')
// Refresh page, then:
window.testStationTime_2(55)  // First: 5-minute warning
// Wait 5 seconds, then:
window.testStationTime_2(60)  // Then: 1-hour completion
```

---

## Notes

- **Test mode** only affects milestone timing, not the actual timer display
- The voice alerts will play immediately when you set the time
- Make sure your browser allows audio/notifications
- Check your system volume is up
- You can test multiple times by calling the test functions again (milestone flags reset automatically)

---

## Troubleshooting

**No sound?**
- Check browser console for errors
- Verify browser allows audio (check site permissions)
- Check system volume
- Try refreshing the page

**Test functions not found?**
- Make sure the page is fully loaded
- Try refreshing the page
- Check that stations are loaded (you should see station cards on the page)

**Want to reset a station after testing?**
- Just click "Stop" and "Start" again on the station
- Or use the "Reset All" button if available

