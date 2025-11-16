# Final Setup Steps - Copy This Connection String

## ✅ Your Pooled Connection String (Ready to Use)

Copy this EXACT string to Vercel:

```
postgresql://postgres.ejzcfmsxibdanknonuiq:Welcome%4013195@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**What was changed:**
- `[YOUR-PASSWORD]` → `Welcome%4013195` (password with `@` encoded as `%40`)
- Added `?sslmode=require` at the end

## Step-by-Step: Update Vercel

### Step 1: Go to Vercel Environment Variables

1. Open https://vercel.com/dashboard
2. Select your project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Update POSTGRES_URL

1. **Find `POSTGRES_URL`** in the list
   - If it exists: Click on it to edit
   - If it doesn't exist: Click **"Add New"** button

2. **Set the values:**
   - **Key**: `POSTGRES_URL`
   - **Value**: Paste this EXACT string:
     ```
     postgresql://postgres.ejzcfmsxibdanknonuiq:Welcome%4013195@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
     ```
   - **Environments**: Select ALL three checkboxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

3. **Click "Save"**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **three dots (⋯)** next to it
4. Click **"Redeploy"**
5. Wait for deployment to complete (1-2 minutes)

### Step 4: Test

1. Open your deployed app
2. Try to create or update a station
3. Check browser console - should see no errors
4. Check Vercel Function Logs:
   - Go to **Functions** tab
   - Click on `/api/stations`
   - Should see "Attempting to connect with: ..." in logs
   - Should NOT see ENOTFOUND errors

## ✅ Verification Checklist

Your connection string should have:
- [x] `pooler.supabase.com` (NOT `db.xxx.supabase.co`)
- [x] Port `6543` (NOT `5432`)
- [x] `postgres.ejzcfmsxibdanknonuiq` as username (with project ref)
- [x] Password is URL-encoded (`Welcome@13195` → `Welcome%4013195`)
- [x] `?sslmode=require` at the end
- [x] Region: `aws-1-ap-south-1` (your region)

## Expected Result

After redeploying, you should see:
- ✅ No more ENOTFOUND errors
- ✅ Database connections working
- ✅ Stations saving to Supabase
- ✅ Invoices saving to Supabase
- ✅ Reports working

## If You Still See Errors

1. **Double-check the connection string** in Vercel matches exactly what's above
2. **Verify Supabase project is active** (not paused)
3. **Check Vercel function logs** for detailed error messages
4. **Wait 1-2 minutes** after redeploy for changes to take effect

