# Your Supabase Connection Setup

## Your Connection String

Your Supabase connection string is:
```
postgresql://postgres:Welcome@13195@db.ejzcfmsxibdanknonuiq.supabase.co:5432/postgres
```

## For Vercel Environment Variable

Add this to Vercel with `?sslmode=require` at the end:

**Key**: `POSTGRES_URL`

**Value**: 
```
postgresql://postgres:Welcome@13195@db.ejzcfmsxibdanknonuiq.supabase.co:5432/postgres?sslmode=require
```

**Important**: If the connection doesn't work, the password might need URL encoding. The `@` in your password (`Welcome@13195`) should be encoded as `%40`. Try this if the first one doesn't work:

```
postgresql://postgres:Welcome%4013195@db.ejzcfmsxibdanknonuiq.supabase.co:5432/postgres?sslmode=require
```

## Next Steps

1. **Run the SQL Schema** (if not done already):
   - Go to Supabase → SQL Editor
   - Run the SQL from `database/supabase_setup.sql`

2. **Add to Vercel**:
   - Settings → Environment Variables
   - Add `POSTGRES_URL` with the value above
   - Redeploy

3. **Test**:
   - Open your app
   - Create/update a station
   - Check Supabase Table Editor to see the data

