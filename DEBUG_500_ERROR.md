# Debugging 500 Errors - Step by Step

## Step 1: Check Vercel Function Logs

The 500 errors mean something is wrong on the server. Let's see the actual error:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project

2. **Go to Functions Tab**
   - Click **"Functions"** tab
   - You'll see a list of your API routes

3. **Check `/api/stations` Logs**
   - Click on `/api/stations`
   - Look at the **"Logs"** section
   - Find the most recent error
   - **Copy the full error message** (it will show the actual problem)

4. **Common Errors You Might See:**
   - `ENOTFOUND` - Still using wrong connection string
   - `Connection refused` - Database not accessible
   - `Authentication failed` - Wrong password
   - `Table does not exist` - Schema not created
   - `Environment variable not set` - POSTGRES_URL missing

## Step 2: Verify Environment Variable is Set

1. **Go to Settings → Environment Variables**
2. **Check `POSTGRES_URL` exists** and has the value:
   ```
   postgresql://postgres.ejzcfmsxibdanknonuiq:Welcome%4013195@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
3. **Verify it's selected for all environments** (Production, Preview, Development)

## Step 3: Test Database Connection

I've created a test endpoint. After redeploying, visit:

```
https://your-app.vercel.app/api/test-db
```

This will show:
- ✅ If connection works
- ❌ What the actual error is
- Environment variable status
- Connection string format

## Step 4: Check Recent Deployment

1. **Go to Deployments tab**
2. **Check if latest deployment completed successfully**
3. **Look for any build errors**
4. **Verify the deployment used the updated environment variable**

## Step 5: Common Issues and Fixes

### Issue: Still seeing ENOTFOUND
**Fix:** 
- Verify `POSTGRES_URL` in Vercel uses `pooler.supabase.com` (NOT `db.xxx.supabase.co`)
- Redeploy after updating

### Issue: Authentication failed
**Fix:**
- Verify password is correct in connection string
- Make sure `@` is encoded as `%40`
- Try resetting password in Supabase

### Issue: Table does not exist
**Fix:**
- Go to Supabase → SQL Editor
- Run the SQL from `database/supabase_setup.sql`
- Verify tables exist in Table Editor

### Issue: Environment variable not found
**Fix:**
- Make sure `POSTGRES_URL` is set in Vercel
- Select all environments when saving
- Redeploy after adding/updating

## Step 6: Share the Error Details

After checking the logs, share:
1. The exact error message from Vercel function logs
2. What you see when visiting `/api/test-db`
3. Screenshot of your Vercel environment variables (with password masked)

This will help identify the exact issue.

