# PostgreSQL Database Setup - Quick Start Guide

## 🚀 Setup in 3 Steps

### 1. Get Free PostgreSQL Database (Neon - Recommended)

1. Go to **https://neon.tech** and sign up (free, no credit card)
2. Create a new project
3. Copy your connection string from the dashboard
   - It looks like: `postgresql://user:password@host/database?sslmode=require`

### 2. Create Database Tables

1. In Neon dashboard, click **SQL Editor**
2. Open the file `database/schema.sql` from this project
3. Copy ALL the SQL code
4. Paste it in the SQL Editor and click **Run**
5. You should see "Success" - tables are now created!

### 3. Connect to Vercel

1. Go to your **Vercel project dashboard**
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Key**: `POSTGRES_URL`
   - **Value**: Paste your Neon connection string
5. Select all environments (Production, Preview, Development)
6. Click **Save**
7. Go to **Deployments** and click **Redeploy**

## ✅ Done!

Your app will now:
- ✅ Save all stations to PostgreSQL
- ✅ Save all invoices to PostgreSQL  
- ✅ Automatically migrate from localStorage
- ✅ Work offline with localStorage as backup

## 📊 What's Stored

**Stations Table:**
- Station name, game type, timer
- Customer name, start time, end time
- Extra controllers, snacks
- Running/done status

**Invoices Table:**
- Invoice number, date
- All station details
- Subtotal, discount, final total

## 🔧 Troubleshooting

**Database not connecting?**
- Check `POSTGRES_URL` is set in Vercel
- Verify connection string includes `?sslmode=require`
- Check Vercel function logs for errors

**Tables missing?**
- Run the SQL from `database/schema.sql` again
- Verify tables exist in your database

**Data not saving?**
- Check browser console for errors
- Verify API routes are working (check Network tab)
- App will fallback to localStorage if database fails

## 📝 Alternative Free Databases

- **Supabase**: https://supabase.com (500 MB free)
- **Railway**: https://railway.app ($5 credit/month)

All work the same way - just use their connection string in `POSTGRES_URL`!

