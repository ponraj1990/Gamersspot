# PostgreSQL Database Integration

Your Gamers Spot application is now configured to use PostgreSQL for data persistence. This guide will help you set it up.

## Quick Setup (5 minutes)

### Step 1: Choose a Free PostgreSQL Database

**Recommended: Neon (Free Tier)**
- Visit: https://neon.tech
- Sign up (free, no credit card required)
- Create a new project
- Copy your connection string

### Step 2: Set Up Database Schema

1. In your Neon dashboard, open the **SQL Editor**
2. Copy the entire contents of `database/schema.sql`
3. Paste and run it in the SQL Editor
4. This creates the `stations` and `invoices` tables

### Step 3: Configure Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Key**: `POSTGRES_URL`
   - **Value**: Your Neon connection string (e.g., `postgresql://user:pass@host/db?sslmode=require`)
4. Make sure to add it for **Production**, **Preview**, and **Development**
5. Click **Save**

### Step 4: Redeploy

1. Go to **Deployments** in Vercel
2. Click **Redeploy** on your latest deployment
3. Wait for deployment to complete

### Step 5: Verify

1. Open your deployed app
2. Create or update a station
3. Check the browser console for any errors
4. Data should now be saved to PostgreSQL!

## What Gets Stored

### Stations Table
- All gaming station data (name, game type, timer, status)
- Customer information (name, start time, end time)
- Extra controllers and snacks
- Real-time updates

### Invoices Table
- Complete invoice history
- Station details, subtotal, discount, total
- Timestamp for each invoice

## Migration from localStorage

The app automatically migrates data from localStorage to PostgreSQL:
- On first load, it checks the database
- If no data exists, it tries to load from localStorage
- If localStorage has data, it migrates to the database
- localStorage is kept as backup until migration succeeds

## Troubleshooting

### "Cannot connect to database"
- Verify `POSTGRES_URL` is set in Vercel environment variables
- Check that your connection string includes `?sslmode=require`
- Ensure your database allows connections from Vercel

### "Table does not exist"
- Run the SQL schema from `database/schema.sql` in your database
- Verify tables were created successfully

### API Routes Not Working
- Check Vercel function logs in the dashboard
- Ensure API files are in the `/api` directory
- Verify `vercel.json` includes API route configuration

### Data Not Saving
- Check browser console for errors
- Verify database connection string is correct
- Check Vercel function logs for database errors

## Free Tier Options

| Provider | Storage | Projects | Best For |
|----------|---------|----------|----------|
| **Neon** | 0.5 GB | Unlimited | Best overall |
| **Supabase** | 500 MB | 2 projects | Good alternative |
| **Railway** | $5 credit/month | Unlimited | Requires credit card |

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables are set
3. Test database connection directly
4. Check browser console for frontend errors

Your app will continue to work with localStorage as a fallback if the database is unavailable.

