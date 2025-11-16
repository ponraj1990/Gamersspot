import { getDbClient, closeDbClient } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    let db = null;
    try {
      // Get environment info (without sensitive data)
      const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
      const hasPostgresUrl = !!process.env.POSTGRES_URL;
      const hasDatabaseUrl = !!process.env.DATABASE_URL;
      
      // Mask connection string for logging
      let connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'NOT SET';
      const maskedConnection = connectionString !== 'NOT SET' 
        ? connectionString.replace(/:[^:@]+@/, ':****@')
        : 'NOT SET';

      // Parse connection string to check for truncation
      let connectionInfo = {
        length: connectionString !== 'NOT SET' ? connectionString.length : 0,
        hostname: 'unknown',
        port: 'unknown',
        isTruncated: false,
        isValidFormat: false
      };

      if (connectionString !== 'NOT SET') {
        try {
          const url = new URL(connectionString);
          connectionInfo.hostname = url.hostname;
          connectionInfo.port = url.port || '5432';
          connectionInfo.isValidFormat = true;
          
          // Check if hostname looks truncated
          if (connectionInfo.hostname.length < 10 || !connectionInfo.hostname.includes('supabase')) {
            connectionInfo.isTruncated = true;
          }
        } catch (e) {
          connectionInfo.isValidFormat = false;
        }
      }

      // Try to connect
      db = await getDbClient();
      const client = db.client;

      // Test query
      const { rows } = await client.query('SELECT NOW() as current_time, version() as pg_version');
      
      await closeDbClient(db);

      return res.status(200).json({
        success: true,
        message: 'Database connection successful',
        environment: {
          isVercel,
          hasPostgresUrl,
          hasDatabaseUrl,
          connectionString: maskedConnection,
          connectionInfo: {
            ...connectionInfo,
            hostname: connectionInfo.hostname.replace(/:[^:@]+@/, ':****@') // Mask password if in hostname
          },
          hostnameType: maskedConnection.includes('pooler.supabase.com') ? 'pooler (correct)' : 
                       maskedConnection.includes('db.') ? 'direct (wrong - use pooler)' : 'unknown'
        },
        database: {
          currentTime: rows[0].current_time,
          version: rows[0].pg_version
        }
      });
    } catch (error) {
      if (db) {
        await closeDbClient(db);
      }
      
      // Parse connection string for error details
      const errorConnectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'NOT SET';
      let errorConnectionInfo = {
        length: errorConnectionString !== 'NOT SET' ? errorConnectionString.length : 0,
        hostname: 'unknown',
        port: 'unknown',
        isTruncated: false,
        isValidFormat: false
      };

      if (errorConnectionString !== 'NOT SET') {
        try {
          const url = new URL(errorConnectionString);
          errorConnectionInfo.hostname = url.hostname;
          errorConnectionInfo.port = url.port || '5432';
          errorConnectionInfo.isValidFormat = true;
          
          // Check if hostname looks truncated
          if (errorConnectionInfo.hostname.length < 10 || !errorConnectionInfo.hostname.includes('supabase')) {
            errorConnectionInfo.isTruncated = true;
          }
        } catch (e) {
          errorConnectionInfo.isValidFormat = false;
        }
      }

      return res.status(500).json({
        success: false,
        error: error.message,
        details: {
          code: error.code,
          errno: error.errno,
          syscall: error.syscall,
          hostname: error.hostname || errorConnectionInfo.hostname
        },
        environment: {
          isVercel: process.env.VERCEL === '1' || process.env.VERCEL === 'true',
          hasPostgresUrl: !!process.env.POSTGRES_URL,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          connectionString: errorConnectionString !== 'NOT SET' 
            ? errorConnectionString.replace(/:[^:@]+@/, ':****@')
            : 'NOT SET',
          connectionInfo: errorConnectionInfo,
          recommendation: errorConnectionInfo.isTruncated 
            ? 'Connection string appears to be truncated. Please update POSTGRES_URL in Vercel with the complete connection string (see FIX_CONNECTION_STRING.md)'
            : errorConnectionInfo.hostname.includes('db.') && !errorConnectionInfo.hostname.includes('pooler')
              ? 'Using direct connection. Switch to Transaction Pooler connection (pooler.supabase.com:6543)'
              : 'Check connection string format and ensure Supabase project is not paused'
        }
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

