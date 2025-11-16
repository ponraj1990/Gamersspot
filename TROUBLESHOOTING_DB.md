# Database Connection Troubleshooting

## Error: ENOTFOUND db.ejzcfmsxibdanknonuiq.supabase.co

This error means the DNS lookup is failing. This could be due to:

1. **Incorrect hostname** - The Supabase project hostname might be wrong
2. **Project deleted or changed** - The Supabase project might have been deleted or the hostname changed
3. **Connection string format** - The connection string might be malformed

## How to Get the Correct Supabase Connection String

### Step 1: Verify Your Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Make sure your project is active and not paused
3. Check the project reference ID (should match `ejzcfmsxibdanknonuiq`)

### Step 2: Get the Correct Connection String

1. In Supabase Dashboard, go to **Settings** (⚙️) → **Database**
2. Scroll to **Connection string** section
3. Click on **URI** tab (NOT Connection pooling)
4. Copy the connection string
5. It should look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### Step 3: Verify Your Password

1. Go to **Settings** → **Database** → **Database Password**
2. If you don't know your password, click **Reset** to create a new one
3. Make sure to URL-encode special characters:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`

### Step 4: Test the Connection String

Try using the **pooled connection** instead of direct connection:

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection string** section
3. Click on **Connection pooling** tab
4. Select **Transaction** mode
5. Copy the connection string
6. Format should be:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```

## Alternative: Check if Project is Paused

Supabase free tier projects can be paused after inactivity:

1. Go to Supabase Dashboard
2. Check if your project shows "Paused" status
3. If paused, click **Restore** to reactivate it
4. Wait a few minutes for the database to be available again

## For Vercel Deployment

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Update `POSTGRES_URL` with the correct connection string
3. Make sure to:
   - Use the pooled connection string (recommended)
   - URL-encode special characters in password
   - Include `?sslmode=require` at the end
4. Redeploy your application

## For Local Testing

1. Check your `.env.local` file (if using)
2. Or verify your local Docker PostgreSQL is running:
   ```bash
   docker ps
   ```
3. If using local PostgreSQL, the connection string should be:
   ```
   postgresql://postgres:postgres@localhost:5432/gamersspot
   ```

## Quick Test

You can test the connection string using `psql`:

```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
```

If this fails, the connection string is incorrect or the project is not accessible.

