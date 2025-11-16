# When Data is Saved to PostgreSQL Database

## Automatic Saving

Data is **automatically saved** to your local PostgreSQL database whenever you:

1. **Start a timer** - When you click "Start" and enter a customer name
2. **Update a station** - Any change to a station triggers a save:
   - Customer name changes
   - Timer starts/stops
   - Extra controllers added
   - Snacks added
   - Customer name edited
   - Timer paused/resumed
   - Timer reset
   - Timer marked as done

3. **Generate an invoice** - When you click "Generate Invoice" in the billing panel

## How It Works

### Stations Data
- **Trigger**: Every time the `stations` array changes in `App.jsx`
- **Location**: `src/App.jsx` - `useEffect` hook watches `stations` state
- **Function**: Calls `saveStations()` from `src/utils/storage.js`
- **API**: Makes POST request to `/api/stations`
- **Database**: Saves to `stations` table in PostgreSQL

### Invoices Data
- **Trigger**: When you click "Generate Invoice"
- **Location**: `src/App.jsx` - `handleGenerateInvoice()` function
- **Function**: Calls `invoicesAPI.create()` from `src/utils/api.js`
- **API**: Makes POST request to `/api/invoices`
- **Database**: Saves to `invoices` table in PostgreSQL

## Initial Data Load

When the app starts:
1. Tries to load stations from PostgreSQL database
2. If database is empty, creates default 7 stations (5 PS5, 1 Steering Wheel, 1 System)
3. These default stations are saved to the database automatically

## Checking Your Database

### Using pgAdmin4:
1. Connect to your Docker PostgreSQL server
2. Expand `gamersspot` → `Schemas` → `public` → `Tables`
3. Right-click `stations` → "View/Edit Data" → "All Rows"
4. You should see your stations data

### Using SQL:
```sql
-- View all stations
SELECT * FROM stations;

-- View all invoices
SELECT * FROM invoices;

-- Count stations
SELECT COUNT(*) FROM stations;
```

## Troubleshooting

### No Data in Database?

1. **Check if API server is running**:
   - Should be on port 3001
   - Check: `http://localhost:3001/api/stations`

2. **Check browser console**:
   - Open Developer Tools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed API requests

3. **Check API server logs**:
   - Look at the terminal where `npm run dev:api` is running
   - Check for database connection errors

4. **Verify database connection**:
   - Make sure Docker PostgreSQL is running: `docker ps`
   - Check `.env.local` file has correct connection string
   - Test connection: `docker exec -it gamersspot-db psql -U postgres -d gamersspot -c "SELECT COUNT(*) FROM stations;"`

5. **Manual Save Test**:
   - Start a timer on any station
   - Enter a customer name
   - Wait 1-2 seconds
   - Check database - data should appear

## Data Flow

```
User Action (Start Timer, Edit Name, etc.)
    ↓
StationCard updates station state
    ↓
App.jsx handleStationUpdate() called
    ↓
stations state updated
    ↓
useEffect detects change
    ↓
saveStations() called
    ↓
stationsAPI.saveAll() POST request
    ↓
/api/stations endpoint (server.js)
    ↓
api/stations.js handler
    ↓
Database connection (api/db.js)
    ↓
PostgreSQL INSERT/UPDATE
    ↓
Data saved! ✅
```

## Important Notes

- **Automatic**: No manual save button needed - saves happen automatically
- **Real-time**: Data is saved within seconds of any change
- **Backup**: Data is also saved to localStorage as a backup
- **Error Handling**: If database save fails, data is saved to localStorage instead

