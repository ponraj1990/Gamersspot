/**
 * Database connection utility
 * Supports both local PostgreSQL (development) and Vercel/Supabase (production)
 */

let dbClient = null;

export async function getDbClient() {
  // Check if we're in Vercel environment
  // VERCEL env var is automatically set by Vercel
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  
  if (isVercel) {
    // Use Supabase connection string for production
    // POSTGRES_URL should be set in Vercel environment variables
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required for Vercel deployment');
    }
    
    // Use pg client for Supabase connection
    const { Client } = await import('pg');
    
    const client = new Client({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false // Required for Supabase
      }
    });
    
    await client.connect();
    return {
      client,
      isVercel: true
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
    
    await client.connect();
    return {
      client,
      isVercel: false
    };
  }
}

export async function closeDbClient(db) {
  if (db && db.client) {
    try {
      if (db.isVercel) {
        await db.client.end();
      } else {
        await db.client.end();
      }
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

