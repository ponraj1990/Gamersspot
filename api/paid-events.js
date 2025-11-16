import { getDbClient, closeDbClient } from './db.js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  let db = null

  try {
    db = await getDbClient()

    if (req.method === 'POST') {
      // Create a new paid event
      const { invoiceNumber, stationIds, resetData } = req.body

      if (!stationIds || !Array.isArray(stationIds) || stationIds.length === 0) {
        await closeDbClient(db)
        return res.status(400).json({ error: 'stationIds array is required' })
      }

      if (!resetData) {
        await closeDbClient(db)
        return res.status(400).json({ error: 'resetData is required' })
      }

      console.log(`[Paid Events] Creating paid event for invoice ${invoiceNumber || 'N/A'}, stations: ${stationIds.join(', ')}`)

      const result = await db.client.query(
        `INSERT INTO paid_events (invoice_number, station_ids, reset_data, processed)
         VALUES ($1, $2, $3, $4)
         RETURNING id, created_at`,
        [
          invoiceNumber || null,
          stationIds,
          JSON.stringify(resetData),
          false
        ]
      )

      await closeDbClient(db)
      return res.status(201).json({ 
        success: true, 
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at
      })
    }

    if (req.method === 'GET') {
      // Get recent unprocessed paid events (last 5 minutes)
      const { since } = req.query
      
      let query
      let params

      if (since) {
        // Get events since a specific timestamp
        query = `
          SELECT 
            id,
            invoice_number as "invoiceNumber",
            station_ids as "stationIds",
            reset_data as "resetData",
            created_at as "createdAt",
            processed
          FROM paid_events
          WHERE created_at > $1
          ORDER BY created_at DESC
          LIMIT 50
        `
        params = [since]
      } else {
        // Get unprocessed events from last 5 minutes
        query = `
          SELECT 
            id,
            invoice_number as "invoiceNumber",
            station_ids as "stationIds",
            reset_data as "resetData",
            created_at as "createdAt",
            processed
          FROM paid_events
          WHERE processed = false 
          AND created_at > NOW() - INTERVAL '5 minutes'
          ORDER BY created_at DESC
          LIMIT 50
        `
        params = []
      }

      const { rows } = await db.client.query(query, params)

      // Mark events as processed
      if (rows.length > 0) {
        const eventIds = rows.map(r => r.id)
        await db.client.query(
          `UPDATE paid_events SET processed = true WHERE id = ANY($1)`,
          [eventIds]
        )
      }

      await closeDbClient(db)
      return res.status(200).json(rows)
    }

    await closeDbClient(db)
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('[Paid Events API] Error:', error)
    if (db) {
      await closeDbClient(db)
    }
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

