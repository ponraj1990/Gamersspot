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
    let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    
    if (!connectionString) {
      console.error('POSTGRES_URL or DATABASE_URL environment variable is required for Vercel deployment');
      throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required for Vercel deployment');
    }
    
    // Sanitize connection string: remove whitespace, newlines, and trim
    connectionString = connectionString.trim().replace(/\s+/g, '').replace(/\n/g, '').replace(/\r/g, '');
    
    // Validate connection string format
    if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
      console.error('Invalid connection string format. Must start with postgresql:// or postgres://');
      throw new Error('Invalid connection string format. Must start with postgresql:// or postgres://');
    }
    
    // Extract and validate hostname
    try {
      const url = new URL(connectionString);
      const hostname = url.hostname;
      
      // Check if hostname is complete (should contain pooler.supabase.com or db.xxx.supabase.co)
      if (!hostname || hostname.length < 10) {
        console.error('Connection string hostname appears to be truncated:', hostname);
        throw new Error(`Connection string hostname is incomplete: "${hostname}". Please check your POSTGRES_URL environment variable in Vercel - it may have been cut off or contain hidden characters.`);
      }
      
      if (!hostname.includes('supabase.com') && !hostname.includes('supabase.co')) {
        console.error('Connection string hostname does not appear to be a Supabase hostname:', hostname);
        throw new Error(`Connection string hostname "${hostname}" does not appear to be a valid Supabase hostname. Please verify your POSTGRES_URL in Vercel.`);
      }
      
      // Log connection string (without password) for debugging
      const connectionStringForLog = connectionString.replace(/:[^:@]+@/, ':****@');
      console.log('Attempting to connect with:', connectionStringForLog);
      console.log('Hostname:', hostname);
      console.log('Port:', url.port || '5432');
    } catch (urlError) {
      if (urlError.message.includes('incomplete') || urlError.message.includes('truncated')) {
        throw urlError;
      }
      console.error('Error parsing connection string URL:', urlError);
      throw new Error(`Invalid connection string format: ${urlError.message}. Please verify your POSTGRES_URL environment variable in Vercel.`);
    }
    
    // Check if using pooled connection (recommended for serverless)
    const isPooledConnection = connectionString.includes('pooler.supabase.com') || connectionString.includes(':6543');
    if (!isPooledConnection && connectionString.includes('db.') && connectionString.includes('.supabase.co')) {
      console.warn('WARNING: Using direct connection. Consider using pooled connection for better serverless performance.');
      console.warn('Get pooled connection string from Supabase Dashboard → Settings → Database → Connection pooling');
    }
    
    // Use connection pool for serverless (better for Vercel)
    const { Pool } = await import('pg');
    
    // Create pool if it doesn't exist
    if (!dbPool) {
      try {
        // Parse connection string to modify SSL settings
        // Remove sslmode from connection string to avoid conflicts with Pool SSL config
        const url = new URL(connectionString);
        const originalSslMode = url.searchParams.get('sslmode');
        url.searchParams.delete('sslmode');
        const modifiedConnectionString = url.toString();
        
        console.log('Creating pool with SSL configuration');
        console.log('Original sslmode:', originalSslMode || 'not set');
        console.log('Using Pool SSL config: rejectUnauthorized=false');
        
        dbPool = new Pool({
          connectionString: modifiedConnectionString,
          // SSL configuration - explicitly set to allow self-signed certificates
          // This is required for Supabase
          ssl: {
            rejectUnauthorized: false // Required for Supabase self-signed certificates
          },
          max: 1, // Limit connections for serverless
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000
        });
        
        // Handle pool errors
        dbPool.on('error', (err) => {
          console.error('Unexpected error on idle client', err);
        });
      } catch (poolError) {
        console.error('Error creating connection pool:', poolError);
        throw new Error(`Failed to create database connection pool: ${poolError.message}. Please verify your POSTGRES_URL environment variable in Vercel.`);
      }
    }
    
    // Get a client from the pool
    let client;
    try {
      client = await dbPool.connect();
    } catch (connectError) {
      console.error('Error connecting to database:', connectError);
      console.error('Connection error details:', {
        code: connectError.code,
        errno: connectError.errno,
        syscall: connectError.syscall,
        hostname: connectError.hostname || 'unknown',
        message: connectError.message
      });
      
      // Provide helpful error message
      if (connectError.code === 'ENOTFOUND') {
        throw new Error(
          `Cannot resolve database hostname. This usually means:\n` +
          `1. Your Supabase project might be paused - check Supabase Dashboard and restore if needed\n` +
          `2. The connection string hostname is incorrect - verify in Supabase Dashboard → Settings → Database\n` +
          `3. You should use the pooled connection string (pooler.supabase.com) instead of direct connection\n` +
          `Original error: ${connectError.message}`
        );
      }
      throw connectError;
    }
    
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

