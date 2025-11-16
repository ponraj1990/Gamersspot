# Update Vercel Connection String - URGENT FIX

## The Problem
You're currently using the **direct connection** string which doesn't work:
```
db.ejzcfmsxibdanknonuiq.supabase.co
```

You need to use the **pooled connection** string instead:
```
pooler.supabase.com
```

## Step-by-Step Fix

### Step 1: Get Pooled Connection String from Supabase

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project

2. **Navigate to Database Settings**
   - Click **Settings** (⚙️ icon) in the left sidebar
   - Click **Database** in the settings menu

3. **Get Pooled Connection String**
   - Scroll down to **"Connection string"** section
   - Click on **"Connection pooling"** tab (NOT "URI")
   - Select **"Transaction"** mode from the dropdown
   - You'll see a connection string like:
     ```
     postgresql://postgres.ejzcfmsxibdanknonuiq:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```
   - **Copy this entire string**

### Step 2: Format the Connection String

Replace `[YOUR-PASSWORD]` with your actual password and URL-encode special characters.

**If your password is `Welcome@13195`:**

1. The `@` symbol needs to be encoded as `%40`
2. So `Welcome@13195` becomes `Welcome%4013195`

**Final connection string should be:**
```
postgresql://postgres.ejzcfmsxibdanknonuiq:Welcome%4013195@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**Key differences from direct connection:**
- ✅ Uses `postgres.ejzcfmsxibdanknonuiq` (with project ref)
- ✅ Uses `pooler.supabase.com` (NOT `db.xxx.supabase.co`)
- ✅ Uses port `6543` (NOT `5432`)
- ✅ Includes `?sslmode=require` at the end

### Step 3: Update Vercel Environment Variable

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project

2. **Navigate to Environment Variables**
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Update POSTGRES_URL**
   - Find `POSTGRES_URL` in the list
   - Click on it to edit, OR
   - If it doesn't exist, click **"Add New"**
   - **Key**: `POSTGRES_URL`
   - **Value**: Paste the pooled connection string from Step 2
     ```
     postgresql://postgres.ejzcfmsxibdanknonuiq:Welcome%4013195@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
     ```
   - **Environments**: Select ALL three:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - Click **Save**

### Step 4: Redeploy

1. **Go to Deployments tab**
2. **Find your latest deployment**
3. **Click the three dots (⋯)** next to it
4. **Click "Redeploy"**
5. **Wait for deployment to complete** (usually 1-2 minutes)

### Step 5: Verify It Works

1. **Open your deployed app**
2. **Try to create/update a station**
3. **Check browser console** - should see no errors
4. **Check Vercel Function Logs**:
   - Go to Vercel → Your Project → **Functions** tab
   - Click on `/api/stations`
   - Check logs - should see "Attempting to connect with: ..." (without password)
   - Should NOT see ENOTFOUND errors

## Quick Checklist

Before redeploying, verify your connection string has:
- [ ] `pooler.supabase.com` (NOT `db.xxx.supabase.co`)
- [ ] Port `6543` (NOT `5432`)
- [ ] `postgres.ejzcfmsxibdanknonuiq` as username (with project ref)
- [ ] Password is URL-encoded (`@` → `%40`)
- [ ] `?sslmode=require` at the end

## If Still Not Working

1. **Verify Supabase project is active**
   - Go to Supabase Dashboard
   - Make sure project is NOT paused
   - If paused, click "Restore"

2. **Double-check the connection string**
   - Copy it directly from Supabase Dashboard
   - Don't modify it manually except for password encoding

3. **Test the connection string format**
   - Should start with: `postgresql://`
   - Should contain: `pooler.supabase.com`
   - Should end with: `?sslmode=require`

4. **Check Vercel logs**
   - Go to Functions → Click on the function
   - Look for the connection attempt log
   - Should show the hostname being used

## Example of Correct Format

```
postgresql://postgres.ejzcfmsxibdanknonuiq:Welcome%4013195@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

This is what should be in your Vercel `POSTGRES_URL` environment variable.

