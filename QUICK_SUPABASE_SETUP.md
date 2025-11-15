# Quick Supabase Setup (5 Minutes)

## 🚀 Step-by-Step Instructions

### 1. Get Connection String from Supabase

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **Settings** (⚙️) → **Database**
4. Scroll to **Connection string** → **URI** tab
5. Copy the connection string
6. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password
   - If you don't know it: **Database** → **Database Settings** → **Database Password** → **Reset**

### 2. Create Tables in Supabase

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `database/supabase_setup.sql` from this project
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **Run** (or Ctrl+Enter)
7. ✅ You should see "Success"

### 3. Add to Vercel

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Click **Add New**
3. **Key**: `POSTGRES_URL`
4. **Value**: Your Supabase connection string (with password replaced)
   - Should end with: `?sslmode=require`
   - Example: `postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres?sslmode=require`
5. Select: ✅ Production, ✅ Preview, ✅ Development
6. Click **Save**

### 4. Redeploy

1. Go to **Deployments**
2. Click **⋯** → **Redeploy**
3. Wait for deployment to complete

### 5. Test ✅

1. Open your app
2. Create/update a station
3. Go to Supabase → **Table Editor** → **stations**
4. You should see your data! 🎉

## Connection String Format

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

Replace:
- `[PASSWORD]` → Your database password
- `[PROJECT-REF]` → Your project reference (already in the string)

## Troubleshooting

**Can't connect?**
- Check password is correct (no brackets `[]`)
- Verify `?sslmode=require` is at the end
- Try resetting password in Supabase

**Tables missing?**
- Run the SQL from `database/supabase_setup.sql` again
- Check **Table Editor** to verify tables exist

**Still not working?**
- Check Vercel function logs
- Verify environment variable is saved
- Make sure you redeployed after adding the variable

## That's It! 🎮

Your app is now connected to Supabase PostgreSQL!

