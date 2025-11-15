# Your Supabase Setup - Ready to Go! 🚀

## Your Connection Details

**Host**: `db.ejzcfmsxibdanknonuiq.supabase.co`  
**Database**: `postgres`  
**User**: `postgres`  
**Password**: `Welcome@13195`

## Step 1: Run Database Schema

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New query**

3. **Run the Schema**
   - Copy ALL the SQL from `database/supabase_setup.sql`
   - Paste into SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - ✅ You should see "Success"

4. **Verify Tables Created**
   - Click **Table Editor** in left sidebar
   - You should see: `stations` and `invoices` tables

## Step 2: Add to Vercel

Your password contains special characters (`@`), so we need to URL-encode it.

### Option 1: Try This First (URL-Encoded Password)

1. Go to **Vercel** → Your Project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Enter:
   - **Key**: `POSTGRES_URL`
   - **Value**: 
     ```
     postgresql://postgres:Welcome%4013195@db.ejzcfmsxibdanknonuiq.supabase.co:5432/postgres?sslmode=require
     ```
   - Note: `@` in password is encoded as `%40`
4. Select all environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

### Option 2: If Option 1 Doesn't Work

Try without URL encoding (some systems handle it automatically):

```
postgresql://postgres:Welcome@13195@db.ejzcfmsxibdanknonuiq.supabase.co:5432/postgres?sslmode=require
```

## Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## Step 4: Test Connection

1. **Open Your App**
   - Visit your Vercel deployment URL
   - Open browser console (F12)

2. **Test Data Saving**
   - Create or update a station
   - Check console for errors
   - Go to Supabase → **Table Editor** → **stations**
   - You should see your data! 🎉

3. **Test Invoice**
   - Generate an invoice
   - Check Supabase → **Table Editor** → **invoices**
   - Invoice should be saved!

## Troubleshooting

### "Connection failed" or "Authentication failed"
- Try the URL-encoded version first (`Welcome%4013195`)
- If that doesn't work, try without encoding
- Verify password is correct: `Welcome@13195`

### "Table does not exist"
- Go back to Supabase SQL Editor
- Run the schema SQL again
- Check Table Editor to verify tables exist

### Still not working?
- Check Vercel function logs: **Functions** tab → `/api/stations`
- Verify environment variable is saved correctly
- Make sure you redeployed after adding the variable

## Quick Reference

**Connection String for Vercel** (URL-encoded):
```
postgresql://postgres:Welcome%4013195@db.ejzcfmsxibdanknonuiq.supabase.co:5432/postgres?sslmode=require
```

**Connection String for Vercel** (if URL-encoded doesn't work):
```
postgresql://postgres:Welcome@13195@db.ejzcfmsxibdanknonuiq.supabase.co:5432/postgres?sslmode=require
```

## What Happens Next

Once set up:
- ✅ All stations save to Supabase automatically
- ✅ All invoices save to Supabase automatically
- ✅ Data persists across deployments
- ✅ You can view/edit data in Supabase dashboard
- ✅ App falls back to localStorage if database unavailable

You're all set! 🎮

