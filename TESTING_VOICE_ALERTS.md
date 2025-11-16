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
   - At **55 seconds**: "PS5 Station 2 - you have 5 minutes left for 1 hour"
   - At **60 seconds**: "PS5 Station 2 - you have completed 1 hour"
   - At **115 seconds**: "PS5 Station 2 - you have 5 minutes left for 2 hours"
   - At **120 seconds**: "PS5 Station 2 - you have completed 2 hours"
   - At **175 seconds**: "PS5 Station 2 - you have 5 minutes left for 3 hours"
   - At **180 seconds**: "PS5 Station 2 - you have completed 3 hours"
   - At **235 seconds**: "PS5 Station 2 - you have 5 minutes left for 4 hours"
   - At **240 seconds**: "PS5 Station 2 - you have completed 4 hours"

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

3. **Test the milestones (with test mode enabled - faster):**
   ```javascript
   localStorage.setItem('testMode', 'true')
   // Refresh page first, then:
   
   // 1 Hour milestones
   window.testStationTime_2(55)   // 5-minute warning before 1 hour
   window.testStationTime_2(60)   // 1-hour completion
   
   // 2 Hour milestones
   window.testStationTime_2(115)  // 5-minute warning before 2 hours
   window.testStationTime_2(120)  // 2-hour completion
   
   // 3 Hour milestones
   window.testStationTime_2(175)  // 5-minute warning before 3 hours
   window.testStationTime_2(180)  // 3-hour completion
   
   // 4 Hour milestones
   window.testStationTime_2(235)  // 5-minute warning before 4 hours
   window.testStationTime_2(240)  // 4-hour completion
   ```

4. **Or test without test mode (using actual seconds):**
   ```javascript
   // 1 Hour milestones
   window.testStationTime_2(3300)  // 55 minutes = 5-minute warning
   window.testStationTime_2(3600) // 1 hour = completion
   
   // 2 Hour milestones
   window.testStationTime_2(6900)  // 115 minutes = 5-minute warning
   window.testStationTime_2(7200) // 2 hours = completion
   
   // 3 Hour milestones
   window.testStationTime_2(10500) // 175 minutes = 5-minute warning
   window.testStationTime_2(10800) // 3 hours = completion
   
   // 4 Hour milestones
   window.testStationTime_2(14100) // 235 minutes = 5-minute warning
   window.testStationTime_2(14400) // 4 hours = completion
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

### Example 1: Test 1-hour milestones
```javascript
// Enable test mode
localStorage.setItem('testMode', 'true')
// Refresh page, then:
window.testStationTime_2(55)  // 5-minute warning before 1 hour
window.testStationTime_2(60)  // 1-hour completion
```

### Example 2: Test 2-hour milestones
```javascript
localStorage.setItem('testMode', 'true')
// Refresh page, then:
window.testStationTime_2(115)  // 5-minute warning before 2 hours
window.testStationTime_2(120)  // 2-hour completion
```

### Example 3: Test all milestones in sequence
```javascript
localStorage.setItem('testMode', 'true')
// Refresh page, then:
window.testStationTime_2(55)   // 1-hour warning
window.testStationTime_2(60)   // 1-hour completion
window.testStationTime_2(115)  // 2-hour warning
window.testStationTime_2(120)  // 2-hour completion
window.testStationTime_2(175)  // 3-hour warning
window.testStationTime_2(180)  // 3-hour completion
window.testStationTime_2(235)  // 4-hour warning
window.testStationTime_2(240)  // 4-hour completion
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

