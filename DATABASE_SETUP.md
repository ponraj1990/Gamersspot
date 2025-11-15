# PostgreSQL Database Setup Guide

This guide will help you set up a free PostgreSQL database for your Gamers Spot application.

## Option 1: Neon (Recommended - Free Tier)

Neon offers a generous free tier with 0.5 GB storage and works seamlessly with Vercel.

### Steps:

1. **Sign up for Neon**
   - Go to https://neon.tech
   - Sign up for a free account
   - Create a new project

2. **Get Connection String**
   - In your Neon dashboard, go to your project
   - Click on "Connection Details"
   - Copy the connection string (it will look like: `postgresql://user:password@host/database?sslmode=require`)

3. **Set up Database Schema**
   - In Neon dashboard, go to "SQL Editor"
   - Copy and paste the contents of `database/schema.sql`
   - Run the SQL script to create tables

4. **Configure Vercel Environment Variables**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add the following variable:
     - **Name**: `POSTGRES_URL`
     - **Value**: Your Neon connection string
   - Make sure to add it for all environments (Production, Preview, Development)

## Option 2: Supabase (Free Tier)

Supabase also offers a free PostgreSQL database.

### Steps:

1. **Sign up for Supabase**
   - Go to https://supabase.com
   - Sign up and create a new project

2. **Get Connection String**
   - Go to Project Settings → Database
   - Find "Connection string" section
   - Copy the "URI" connection string

3. **Set up Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `database/schema.sql`
   - Run the SQL script

4. **Configure Vercel Environment Variables**
   - Same as Neon steps above
   - Add `POSTGRES_URL` with your Supabase connection string

## Option 3: Railway (Free Tier with Credit Card)

Railway offers a free tier that requires a credit card.

### Steps:

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up and link your credit card (for free tier)

2. **Create PostgreSQL Database**
   - Create a new project
   - Add a PostgreSQL service
   - Railway will automatically create the database

3. **Get Connection String**
   - Click on your PostgreSQL service
   - Go to "Variables" tab
   - Copy the `DATABASE_URL` value

4. **Set up Database Schema**
   - Use Railway's built-in database browser or connect via psql
   - Run the SQL from `database/schema.sql`

5. **Configure Vercel Environment Variables**
   - Add `POSTGRES_URL` with your Railway connection string

## After Setup

1. **Redeploy on Vercel**
   - After adding environment variables, redeploy your application
   - Vercel will automatically use the `POSTGRES_URL` environment variable

2. **Verify Connection**
   - Check your Vercel function logs to ensure database connection is working
   - Test creating/updating stations in your app

## Environment Variables Summary

Add this to your Vercel project:

```
POSTGRES_URL=your_connection_string_here
```

## Troubleshooting

### Connection Issues
- Make sure your connection string includes `?sslmode=require` for secure connections
- Check that your database allows connections from Vercel's IP addresses
- Verify the connection string is correct in Vercel environment variables

### Migration from localStorage
- The app will automatically migrate data from localStorage to the database on first load
- Old localStorage data will be preserved as backup until migration is successful

### API Routes Not Working
- Ensure your `vercel.json` includes the API route rewrites
- Check that API files are in the `/api` directory
- Verify serverless functions are deployed correctly

## Database Schema

The database includes:
- **stations** table: Stores all gaming station data
- **invoices** table: Stores invoice history
- Automatic timestamps and indexes for performance

## Free Tier Limits

- **Neon**: 0.5 GB storage, unlimited projects
- **Supabase**: 500 MB database, 2 projects
- **Railway**: $5 free credit monthly

Choose the option that best fits your needs!

