# Supabase PostgreSQL Setup Guide

This guide will help you connect your Gamers Spot app to your Supabase PostgreSQL database.

## Step 1: Get Your Supabase Connection String

1. **Log in to Supabase**
   - Go to https://supabase.com/dashboard
   - Select your project (or create a new one)

2. **Get Connection String**
   - Go to **Project Settings** (gear icon in left sidebar)
   - Click on **Database** in the settings menu
   - Scroll down to **Connection string** section
   - Select **URI** tab
   - Copy the connection string
   - It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password
   - If you don't know your password, you can reset it in **Database** → **Database Settings** → **Database Password**

## Step 2: Create Database Tables

1. **Open SQL Editor**
   - In Supabase dashboard, click **SQL Editor** in the left sidebar
   - Click **New query**

2. **Run the Schema**
   - Open the file `database/schema.sql` from this project
   - Copy ALL the SQL code
   - Paste it into the Supabase SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - You should see "Success" message

3. **Verify Tables Created**
   - Go to **Table Editor** in left sidebar
   - You should see two tables: `stations` and `invoices`

## Step 3: Configure Vercel Environment Variable

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click **Settings** → **Environment Variables**

2. **Add POSTGRES_URL**
   - Click **Add New**
   - **Key**: `POSTGRES_URL`
   - **Value**: Paste your Supabase connection string
     - Make sure to replace `[YOUR-PASSWORD]` with your actual password
     - The connection string should include `?sslmode=require` at the end
     - Example: `postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres?sslmode=require`
   - Select all environments: **Production**, **Preview**, **Development**
   - Click **Save**

## Step 4: Redeploy on Vercel

1. **Redeploy Application**
   - Go to **Deployments** tab
   - Click the three dots (⋯) on your latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger redeployment

2. **Wait for Deployment**
   - Wait for the deployment to complete
   - Check the deployment logs for any errors

## Step 5: Test the Connection

1. **Open Your App**
   - Visit your deployed Vercel URL
   - Open browser console (F12)

2. **Test Data Saving**
   - Create or update a station
   - Check console for any errors
   - Go to Supabase **Table Editor** → **stations** table
   - You should see your data there!

## Supabase Connection String Format

Your connection string should look like this:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

**Important Notes:**
- Replace `[PASSWORD]` with your actual database password
- Replace `[PROJECT-REF]` with your project reference ID
- The `?sslmode=require` is important for secure connections
- Supabase uses port `5432` by default

## Troubleshooting

### "Connection refused" or "Cannot connect"
- Verify your connection string is correct
- Check that password is correct (no brackets)
- Ensure `?sslmode=require` is at the end
- Try resetting your database password in Supabase

### "Table does not exist"
- Go back to SQL Editor in Supabase
- Run the schema SQL again
- Check Table Editor to verify tables exist

### "Authentication failed"
- Your database password might be incorrect
- Reset password in Supabase: **Database** → **Database Settings** → **Database Password**
- Update the `POSTGRES_URL` in Vercel with new password

### API Routes Not Working
- Check Vercel function logs
- Verify environment variable is set correctly
- Make sure you redeployed after adding the variable

## Supabase Free Tier Limits

- **Database Size**: 500 MB
- **Projects**: 2 free projects
- **API Requests**: Unlimited
- **Bandwidth**: 5 GB/month

This should be more than enough for your gaming zone application!

## Verify Everything Works

1. **Check Supabase Tables**
   - Go to **Table Editor** → **stations**
   - You should see your stations data
   - Go to **Table Editor** → **invoices**  
   - Invoices will appear here when generated

2. **Check Vercel Logs**
   - Go to Vercel → **Functions** tab
   - Check `/api/stations` and `/api/invoices` logs
   - Should see successful database operations

3. **Test in App**
   - Create a station
   - Update customer name
   - Generate an invoice
   - All should save to Supabase!

## Next Steps

Once everything is working:
- Your data is now safely stored in Supabase
- You can view/edit data directly in Supabase dashboard
- All invoices are saved for historical records
- Data persists across app deployments

Enjoy your fully database-backed gaming zone management system! 🎮

