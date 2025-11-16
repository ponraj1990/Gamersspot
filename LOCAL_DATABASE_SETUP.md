# Local PostgreSQL Database Setup

This guide will help you set up a local PostgreSQL database for development.

## Prerequisites

1. **PostgreSQL installed on Windows**
   - Download from: https://www.postgresql.org/download/windows/
   - Or use PostgreSQL installer: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Default installation includes:
     - PostgreSQL server
     - pgAdmin (GUI tool)
     - Command line tools

## Step 1: Install PostgreSQL

1. Download and run the PostgreSQL installer
2. During installation:
   - Remember the password you set for the `postgres` superuser
   - Default port is `5432` (keep this)
   - Default installation directory is fine

## Step 2: Create Database

Open **pgAdmin** or use **psql** command line:

### Option A: Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to your PostgreSQL server (use the password you set during installation)
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `gamersspot`
5. Click "Save"

### Option B: Using psql (Command Line)
```bash
# Open Command Prompt or PowerShell
psql -U postgres

# Enter your password when prompted
# Then run:
CREATE DATABASE gamersspot;

# Exit psql
\q
```

## Step 3: Run Database Schema

1. Open pgAdmin or psql
2. Connect to the `gamersspot` database
3. Open the SQL Editor (pgAdmin) or connect to the database (psql):
   ```bash
   psql -U postgres -d gamersspot
   ```
4. Copy and paste the contents of `database/schema.sql`
5. Execute the SQL script

### Quick Command Line Method:
```bash
psql -U postgres -d gamersspot -f database/schema.sql
```

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the project root (copy from `.env.local.example`):
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your local PostgreSQL credentials:
   ```
   POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gamersspot
   ```
   
   Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation.

   **Example:**
   ```
   POSTGRES_URL=postgresql://postgres:mypassword123@localhost:5432/gamersspot
   ```

## Step 5: Start Development Servers

You need to run two servers:
1. **Vite dev server** (frontend) - Port 5173
2. **API server** (backend) - Port 3001

### Option A: Run Both Servers Together (Recommended)
```bash
npm run dev:all
```

This will start both the frontend and API server simultaneously.

### Option B: Run Servers Separately

**Terminal 1** - Frontend:
```bash
npm run dev
```

**Terminal 2** - API Server:
```bash
npm run dev:api
```

## Step 6: Test the Connection

1. Open your browser to: `http://localhost:5173`
2. The app should now connect to your local PostgreSQL database
3. Check the browser console and terminal for any connection errors
4. The API server will be available at: `http://localhost:3001/api`

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL service is running:
  - Windows: Open Services (services.msc) → Find "postgresql" → Start if stopped
  - Or: `net start postgresql-x64-XX` (replace XX with your version)

### Authentication Failed
- Check your password in `.env.local`
- Try connecting with pgAdmin first to verify credentials
- If you forgot the password, you may need to reset it

### Database Not Found
- Make sure you created the `gamersspot` database
- Verify the database name in your connection string matches

### Port Already in Use
- Check if another PostgreSQL instance is running
- Change the port in PostgreSQL config (usually not needed)

## Verification

To verify everything is working:

1. Open pgAdmin
2. Connect to `gamersspot` database
3. Check if `stations` and `invoices` tables exist
4. Run a test query:
   ```sql
   SELECT * FROM stations;
   ```

## Production (Vercel) vs Development

- **Local Development**: Uses `.env.local` with local PostgreSQL
- **Vercel Deployment**: Uses `POSTGRES_URL` environment variable from Vercel dashboard (Supabase connection)

The app automatically detects the environment and uses the appropriate connection method.

