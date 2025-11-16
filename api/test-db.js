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
      const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || 'NOT SET';
      const maskedConnection = connectionString !== 'NOT SET' 
        ? connectionString.replace(/:[^:@]+@/, ':****@')
        : 'NOT SET';

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
          hostname: maskedConnection.includes('pooler.supabase.com') ? 'pooler (correct)' : 
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
      
      return res.status(500).json({
        success: false,
        error: error.message,
        details: {
          code: error.code,
          errno: error.errno,
          syscall: error.syscall,
          hostname: error.hostname
        },
        environment: {
          isVercel: process.env.VERCEL === '1' || process.env.VERCEL === 'true',
          hasPostgresUrl: !!process.env.POSTGRES_URL,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          connectionString: (process.env.POSTGRES_URL || process.env.DATABASE_URL || 'NOT SET')
            .replace(/:[^:@]+@/, ':****@')
        }
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

