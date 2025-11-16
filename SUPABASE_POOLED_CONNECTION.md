# Supabase Pooled Connection String Setup

## The Issue

`@vercel/postgres` requires a **pooled connection string** for serverless functions. Supabase provides connection pooling through their pooler.

## Solution: Get Pooled Connection String from Supabase

### Step 1: Get Pooled Connection String

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project

2. **Get Connection Pooling String**
   - Go to **Settings** (⚙️) → **Database**
   - Scroll to **Connection string** section
   - Look for **"Connection pooling"** tab (NOT "URI")
   - Select **"Transaction"** mode
   - Copy the connection string
   - It will look like: `postgresql://postgres.ejzcfmsxibdanknonuiq:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

### Step 2: Format for Vercel

Your pooled connection string should be:
```
postgresql://postgres.ejzcfmsxibdanknonuiq:Welcome%4013195@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**Key differences from direct connection:**
- Uses `postgres.ejzcfmsxibdanknonuiq` (with project ref) instead of just `postgres`
- Uses `pooler.supabase.com` host instead of `db.xxx.supabase.co`
- Uses port `6543` instead of `5432`
- Password still needs URL encoding: `Welcome@13195` → `Welcome%4013195`

### Step 3: Add to Vercel

1. Go to **Vercel** → Your Project → **Settings** → **Environment Variables**
2. Update or add:
   - **Key**: `POSTGRES_URL`
   - **Value**: Your pooled connection string (from Step 2)
3. Select all environments
4. **Save**

### Step 4: Redeploy

- Go to **Deployments** → **Redeploy**

## Alternative: Use Direct Connection with createClient()

The code has been updated to use `createClient()` which should work with direct connections. If you prefer to use the direct connection string:

1. Use your original connection string:
   ```
   postgresql://postgres:Welcome%4013195@db.ejzcfmsxibdanknonuiq.supabase.co:5432/postgres?sslmode=require
   ```

2. The updated API code should now work with direct connections using `createClient()`

## Which to Use?

- **Pooled Connection** (Recommended): Better for serverless, handles connections more efficiently
- **Direct Connection**: Simpler, but may hit connection limits with high traffic

Try the direct connection first (with the updated code), and if you still get errors, switch to the pooled connection string.

## Your Connection Strings

### Direct Connection (for createClient):
```
postgresql://postgres:Welcome%4013195@db.ejzcfmsxibdanknonuiq.supabase.co:5432/postgres?sslmode=require
```

### Pooled Connection (if direct doesn't work):
Get from Supabase Dashboard → Settings → Database → Connection pooling → Transaction mode


