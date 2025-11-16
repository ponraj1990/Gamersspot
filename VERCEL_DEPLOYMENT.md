# Vercel Deployment Guide with Supabase

This guide will help you deploy your application to Vercel with Supabase PostgreSQL database.

## Prerequisites

1. ✅ Supabase account with a project created
2. ✅ Vercel account
3. ✅ Database schema already created in Supabase

## Step 1: Get Your Supabase Connection String

### Option A: Direct Connection (Recommended for Vercel)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** (⚙️) → **Database**
4. Scroll to **Connection string** section
5. Click on **URI** tab
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your actual database password

**Format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

**Example (with URL-encoded password):**
```
postgresql://postgres:Welcome%4013195@db.ejzcfmsxibdanknonuiq.supabase.co:5432/postgres?sslmode=require
```

**Note:** If your password contains special characters like `@`, encode them:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`

### Option B: Pooled Connection (Alternative)

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection string** section
3. Click on **Connection pooling** tab
4. Select **Transaction** mode
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your actual password

**Format:**
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

## Step 2: Add Environment Variable to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `POSTGRES_URL`
   - **Value**: Your Supabase connection string (from Step 1)
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**

## Step 3: Verify Database Schema

Make sure your Supabase database has the required tables:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run the SQL from `database/supabase_setup.sql` if you haven't already
3. Verify tables exist:
   - Go to **Table Editor**
   - You should see: `stations` and `invoices` tables

## Step 4: Deploy to Vercel

### Option A: Deploy via Git (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel:
   - Go to Vercel Dashboard
   - Click **Add New Project**
   - Import your repository
   - Vercel will automatically detect Vite configuration
3. Environment variables will be automatically used from Step 2
4. Click **Deploy**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production:
   ```bash
   vercel --prod
   ```

## Step 5: Verify Deployment

1. **Check Deployment Logs**
   - Go to Vercel Dashboard → **Deployments**
   - Click on your latest deployment
   - Check for any errors in the build logs

2. **Test the Application**
   - Open your deployed URL
   - Create/update a station
   - Check browser console for errors

3. **Verify Database Connection**
   - Go to Supabase → **Table Editor** → **stations**
   - You should see data being saved

## Troubleshooting

### Error: "Cannot connect to database"

**Solutions:**
1. Verify `POSTGRES_URL` is set correctly in Vercel environment variables
2. Check that password is URL-encoded if it contains special characters
3. Ensure `?sslmode=require` is at the end of the connection string
4. Try using the pooled connection string instead

### Error: "Table does not exist"

**Solutions:**
1. Go to Supabase → **SQL Editor**
2. Run the schema SQL from `database/supabase_setup.sql`
3. Verify tables exist in **Table Editor**

### Error: "Authentication failed"

**Solutions:**
1. Verify your database password is correct
2. Try resetting your password in Supabase:
   - Settings → Database → Database Password → Reset
3. Update `POSTGRES_URL` in Vercel with the new password

### Build Fails

**Solutions:**
1. Check build logs in Vercel for specific errors
2. Ensure all dependencies are in `package.json`
3. Verify `vercel.json` configuration is correct
4. Check that API routes are in the `api/` directory

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_URL` | Supabase connection string | `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?sslmode=require` |

## Additional Notes

- The application automatically detects Vercel environment using `process.env.VERCEL`
- In Vercel, it uses the Supabase connection string from `POSTGRES_URL`
- Locally, it uses Docker PostgreSQL or the connection string from `.env.local`
- SSL is required for Supabase connections (`sslmode=require`)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase connection logs
3. Verify environment variables are set correctly
4. Test the connection string locally first

