# Docker PostgreSQL Setup Guide

## Prerequisites
- Docker Desktop installed and running
- Docker Desktop is started (you should see the Docker icon in your system tray)

## Step 1: Start PostgreSQL Container

1. **Open a terminal** in your project folder (`C:\Dev\New folder\Gamersspot`)

2. **Start the PostgreSQL container:**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Download the PostgreSQL 16 image (if not already downloaded)
   - Create a container named `gamersspot-db`
   - Start PostgreSQL on port 5432
   - Create a database named `gamersspot`
   - Set username: `postgres` and password: `postgres`

3. **Verify it's running:**
   ```bash
   docker ps
   ```
   You should see `gamersspot-db` container running.

## Step 2: Run Database Schema

You have two options:

### Option A: Using Docker Exec (Recommended)

```bash
# Copy schema file into container and run it
docker cp database/schema.sql gamersspot-db:/tmp/schema.sql
docker exec -i gamersspot-db psql -U postgres -d gamersspot -f /tmp/schema.sql
```

### Option B: Using pgAdmin4

1. In pgAdmin4, create a new server connection:
   - **General Tab**: Name: `Docker PostgreSQL` (or any name)
   - **Connection Tab**:
     - Host: `localhost`
     - Port: `5432`
     - Database: `gamersspot`
     - Username: `postgres`
     - Password: `postgres`
   - Click "Save"

2. Once connected:
   - Expand `gamersspot` database
   - Open Query Tool
   - Copy and paste contents of `database/schema.sql`
   - Execute (F5)

## Step 3: Create .env.local File

Create a `.env.local` file in your project root:

```
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/gamersspot
```

**Note:** The password is `postgres` (as set in docker-compose.yml)

## Step 4: Test the Connection

1. Start your development servers:
   ```bash
   npm run dev:all
   ```

2. Open browser: `http://localhost:5173`

## Useful Docker Commands

### Stop the database:
```bash
docker-compose down
```

### Start the database (if stopped):
```bash
docker-compose up -d
```

### View database logs:
```bash
docker logs gamersspot-db
```

### Access PostgreSQL command line:
```bash
docker exec -it gamersspot-db psql -U postgres -d gamersspot
```

### Remove everything (including data):
```bash
docker-compose down -v
```

## Troubleshooting

### Port 5432 already in use
If you get an error that port 5432 is already in use:
1. Check if another PostgreSQL is running: `netstat -ano | findstr ":5432"`
2. Either stop the other PostgreSQL service, or change the port in `docker-compose.yml`:
   ```yaml
   ports:
     - "5433:5432"  # Use 5433 on host, 5432 in container
   ```
   Then update `.env.local` to use port `5433`.

### Container won't start
- Make sure Docker Desktop is running
- Check logs: `docker logs gamersspot-db`
- Try: `docker-compose down` then `docker-compose up -d`

### Can't connect from pgAdmin4
- Make sure container is running: `docker ps`
- Verify port mapping: `docker port gamersspot-db`
- Check firewall settings

