# Quick Local Development Setup

## Prerequisites
- Node.js installed
- PostgreSQL installed and running on Windows
- Database `gamersspot` created

## Quick Start

1. **Set up your local database:**
   ```bash
   # Create database (using psql)
   psql -U postgres
   CREATE DATABASE gamersspot;
   \q
   
   # Run schema
   psql -U postgres -d gamersspot -f database/schema.sql
   ```

2. **Create `.env.local` file:**
   ```
   POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gamersspot
   ```
   Replace `YOUR_PASSWORD` with your PostgreSQL password.

3. **Start both servers:**
   ```bash
   npm run dev:all
   ```

4. **Open your browser:**
   - Frontend: http://localhost:5173
   - API: http://localhost:3001/api

## Environment Detection

- **Local Development**: Uses `.env.local` with local PostgreSQL
- **Vercel Production**: Automatically uses Supabase connection from Vercel environment variables

The app automatically detects the environment and uses the appropriate database connection.

## Troubleshooting

- **Port 3001 already in use**: Change `PORT` in `server.js` or `.env.local`
- **Database connection error**: Check your `.env.local` connection string
- **API not responding**: Make sure both servers are running (`npm run dev:all`)

