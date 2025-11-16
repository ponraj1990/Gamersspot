/**
 * Database Cleanup API Endpoint
 * WARNING: This deletes ALL data from stations and invoices tables
 * Use with caution!
 */

import { getDbClient, closeDbClient } from './db.js'

export default async function handler(req, res) {
  // Only allow POST method for safety
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  // Optional: Add a confirmation token for extra safety
  // You can set this in your environment variables
  const requiredToken = process.env.CLEANUP_TOKEN || 'cleanup-confirm'
  const providedToken = req.body?.token || req.query?.token

  if (providedToken !== requiredToken) {
    return res.status(401).json({ 
      error: 'Unauthorized. Provide a valid cleanup token in the request body: { "token": "cleanup-confirm" }' 
    })
  }

  let db = null

  try {
    db = await getDbClient()
    const { client } = db

    // Start transaction
    await client.query('BEGIN')

    // Disable triggers temporarily
    await client.query("SET session_replication_role = 'replica'")

    // Delete all invoices
    const invoicesResult = await client.query('TRUNCATE TABLE invoices RESTART IDENTITY CASCADE')
    
    // Delete all stations
    const stationsResult = await client.query('TRUNCATE TABLE stations RESTART IDENTITY CASCADE')

    // Re-enable triggers
    await client.query("SET session_replication_role = 'origin'")

    // Commit transaction
    await client.query('COMMIT')

    // Verify cleanup
    const stationsCount = await client.query('SELECT COUNT(*) as count FROM stations')
    const invoicesCount = await client.query('SELECT COUNT(*) as count FROM invoices')

    await closeDbClient(db)

    return res.status(200).json({
      success: true,
      message: 'Database cleanup completed successfully',
      results: {
        stationsDeleted: stationsCount.rows[0].count === '0' ? 'All deleted' : stationsCount.rows[0].count,
        invoicesDeleted: invoicesCount.rows[0].count === '0' ? 'All deleted' : invoicesCount.rows[0].count,
        remainingStations: parseInt(stationsCount.rows[0].count),
        remainingInvoices: parseInt(invoicesCount.rows[0].count)
      }
    })
  } catch (error) {
    if (db) {
      try {
        await db.client.query('ROLLBACK')
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError)
      }
      await closeDbClient(db)
    }

    console.error('Database cleanup error:', error)
    return res.status(500).json({
      error: 'Failed to cleanup database',
      details: error.message
    })
  }
}

