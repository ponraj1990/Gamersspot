# pgAdmin4 Setup Guide

## Step 1: Connect to PostgreSQL Server

1. In pgAdmin4, you should see a server in the left panel (usually named "PostgreSQL" or similar)
2. Click on it and enter your PostgreSQL password if prompted
3. If you don't see a server, right-click "Servers" → "Create" → "Server"
   - **General Tab**: Name it "PostgreSQL" (or any name)
   - **Connection Tab**: 
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: (your PostgreSQL password)
   - Click "Save"

## Step 2: Create the Database

1. Expand your PostgreSQL server in the left panel
2. Right-click on "Databases" → "Create" → "Database..."
3. In the "Create Database" dialog:
   - **Database**: `gamersspot`
   - **Owner**: `postgres` (default)
   - Click "Save"

## Step 3: Run the Schema SQL

1. Click on the `gamersspot` database in the left panel to select it
2. Click on the "Query Tool" icon (looks like a play button) in the toolbar, or right-click `gamersspot` → "Query Tool"
3. Open the `database/schema.sql` file from your project folder
4. Copy the entire contents of `schema.sql`
5. Paste it into the Query Tool editor
6. Click the "Execute" button (or press F5)
7. You should see "Query returned successfully" in the Messages tab

## Step 4: Verify Tables Were Created

1. In the left panel, expand `gamersspot` → "Schemas" → "public" → "Tables"
2. You should see two tables:
   - `stations`
   - `invoices`
3. If you see these tables, the setup is complete! ✅

## Step 5: Create .env.local File

1. In your project root folder, create a file named `.env.local`
2. Add the following line (replace `YOUR_PASSWORD` with your PostgreSQL password):

```
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/gamersspot
```

**Example:**
If your password is `mypassword123`, it would be:
```
POSTGRES_URL=postgresql://postgres:mypassword123@localhost:5432/gamersspot
```

## Step 6: Test the Connection

1. Open a terminal in your project folder
2. Run: `npm run dev:all`
3. Open your browser to `http://localhost:5173`
4. The app should now connect to your local database!

## Troubleshooting

### Can't connect to server
- Make sure PostgreSQL service is running (Windows Services)
- Check if port 5432 is correct
- Verify your password is correct

### Database already exists
- If `gamersspot` already exists, you can either:
  - Delete it and recreate it, OR
  - Just run the schema SQL on the existing database

### Permission denied
- Make sure you're using the `postgres` user (superuser)
- Or create a new user with proper permissions

