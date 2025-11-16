# Fix: ENOTFOUND db.ejzcfmsxibdanknonuiq.supabase.co

## Quick Fix Steps

### Step 1: Check if Your Supabase Project is Active

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Check if your project shows **"Paused"** status
3. If paused:
   - Click **"Restore"** or **"Resume"** button
   - Wait 2-3 minutes for the database to be available
   - The hostname might change after restoration

### Step 2: Get the Correct Connection String

1. In Supabase Dashboard → **Settings** (⚙️) → **Database**
2. Scroll to **Connection string** section
3. **IMPORTANT**: Use the **Connection pooling** tab (NOT URI)
   - Click on **"Connection pooling"** tab
   - Select **"Transaction"** mode
   - Copy the connection string
4. It should look like:
   ```
   postgresql://postgres.ejzcfmsxibdanknonuiq:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Step 3: Format the Connection String

Replace `[YOUR-PASSWORD]` with your password and URL-encode special characters:

**If your password is `Welcome@13195`:**
```
postgresql://postgres.ejzcfmsxibdanknonuiq:Welcome%4013195@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**Key differences:**
- Uses `postgres.ejzcfmsxibdanknonuiq` (with project ref) instead of `postgres`
- Uses `pooler.supabase.com` host instead of `db.xxx.supabase.co`
- Uses port `6543` instead of `5432`
- Password `@` is encoded as `%40`

### Step 4: Update Vercel Environment Variable

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Find `POSTGRES_URL` or create it
3. Update the value with the pooled connection string from Step 3
4. Select all environments: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## Alternative: If Project Reference Changed

If your project was restored, the reference ID might have changed:

1. Check the new project reference in Supabase Dashboard
2. Update the connection string with the new reference ID
3. The format will be:
   ```
   postgresql://postgres.[NEW-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```

## Verify Connection String Format

The connection string should have:
- ✅ Protocol: `postgresql://`
- ✅ User: `postgres.[PROJECT-REF]` (for pooled) or `postgres` (for direct)
- ✅ Password: URL-encoded (special characters like `@` → `%40`)
- ✅ Host: `pooler.supabase.com` (for pooled) or `db.[PROJECT-REF].supabase.co` (for direct)
- ✅ Port: `6543` (for pooled) or `5432` (for direct)
- ✅ Database: `postgres`
- ✅ SSL: `?sslmode=require` at the end

## Test Locally First (Optional)

If you want to test the connection string locally:

1. Create a `.env.local` file in your project root:
   ```
   POSTGRES_URL=postgresql://postgres.ejzcfmsxibdanknonuiq:Welcome%4013195@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

2. Restart your local server:
   ```bash
   npm run dev:all
   ```

3. Check if the connection works

## Still Not Working?

1. **Verify project is active** in Supabase Dashboard
2. **Check the exact hostname** in Supabase → Settings → Database
3. **Try resetting your database password** in Supabase
4. **Use the exact connection string** from Supabase dashboard (don't modify it manually)
5. **Check Vercel function logs** for more detailed error messages

