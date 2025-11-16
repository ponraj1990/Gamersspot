/**
 * Database connection utility
 * Supports both local PostgreSQL (development) and Vercel/Supabase (production)
 */

let dbClient = null;
let dbPool = null;

export async function getDbClient() {
  // Check if we're in Vercel environment
  // VERCEL env var is automatically set by Vercel
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  
  if (isVercel) {
    // Use Supabase connection string for production
    // POSTGRES_URL should be set in Vercel environment variables
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.error('POSTGRES_URL or DATABASE_URL environment variable is required for Vercel deployment');
      throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required for Vercel deployment');
    }
    
    // Use connection pool for serverless (better for Vercel)
    const { Pool } = await import('pg');
    
    // Create pool if it doesn't exist
    if (!dbPool) {
      dbPool = new Pool({
        connectionString: connectionString,
        ssl: {
          rejectUnauthorized: false // Required for Supabase
        },
        max: 1, // Limit connections for serverless
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      });
      
      // Handle pool errors
      dbPool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });
    }
    
    // Get a client from the pool
    const client = await dbPool.connect();
    
    return {
      client,
      isVercel: true,
      release: () => client.release() // Return release function
    };
  } else {
    // Use local PostgreSQL client for development
    const { Client } = await import('pg');
    
    // For local development, use POSTGRES_URL from .env.local
    // If not set, use default local connection
    const connectionString = process.env.POSTGRES_URL || 
      process.env.DATABASE_URL || 
      'postgresql://postgres:postgres@localhost:5432/gamersspot';
    
    const client = new Client({
      connectionString: connectionString
    });
    
    try {
      await client.connect();
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
    
    return {
      client,
      isVercel: false,
      release: null
    };
  }
}

export async function closeDbClient(db) {
  if (db && db.client) {
    try {
      if (db.isVercel && db.release) {
        // Release client back to pool (don't close it)
        db.release();
      } else {
        // Close client for local development
        await db.client.end();
      }
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

