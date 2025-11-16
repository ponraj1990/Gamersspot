import { getDbClient, closeDbClient } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get database client (local or Vercel)
  let db = null;
  try {
    db = await getDbClient();
    const client = db.client;
    
    if (!client) {
      console.error('Database client is null');
      return res.status(500).json({ error: 'Database connection failed' });
    }
    
    if (req.method === 'GET') {
      // Get all stations
      const { rows } = await client.query(`
        SELECT 
          id,
          name,
          game_type as "gameType",
          elapsed_time as "elapsedTime",
          is_running as "isRunning",
          is_done as "isDone",
          extra_controllers as "extraControllers",
          snacks,
          customer_name as "customerName",
          start_time as "startTime",
          end_time as "endTime"
        FROM stations
        ORDER BY id ASC
      `);
      
      // Transform snacks from JSONB to object
      const stations = rows.map(row => ({
        ...row,
        snacks: typeof row.snacks === 'string' ? JSON.parse(row.snacks) : row.snacks
      }));

      await closeDbClient(db);
      return res.status(200).json(stations);
    }

    if (req.method === 'POST') {
      // Create or update stations (bulk)
      const { stations } = req.body;

      if (!Array.isArray(stations)) {
        await closeDbClient(db);
        return res.status(400).json({ error: 'Stations must be an array' });
      }

      // Delete all existing stations
      await client.query('DELETE FROM stations');

      if (stations.length > 0) {
        // Insert stations one by one
        for (const station of stations) {
          await client.query(`
            INSERT INTO stations (
              id, name, game_type, elapsed_time, is_running, is_done,
              extra_controllers, snacks, customer_name, start_time, end_time
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              game_type = EXCLUDED.game_type,
              elapsed_time = EXCLUDED.elapsed_time,
              is_running = EXCLUDED.is_running,
              is_done = EXCLUDED.is_done,
              extra_controllers = EXCLUDED.extra_controllers,
              snacks = EXCLUDED.snacks,
              customer_name = EXCLUDED.customer_name,
              start_time = EXCLUDED.start_time,
              end_time = EXCLUDED.end_time
          `, [
            station.id,
            station.name,
            station.gameType || 'PS5',
            station.elapsedTime || 0,
            station.isRunning || false,
            station.isDone || false,
            station.extraControllers || 0,
            JSON.stringify(station.snacks || { cokeBottle: 0, cokeCan: 0 }),
            station.customerName || '',
            station.startTime || null,
            station.endTime || null
          ]);
        }
      }

      await closeDbClient(db);
      return res.status(200).json({ success: true, count: stations.length });
    }

    if (req.method === 'PUT') {
      // Update a single station
      const { id, ...updates } = req.body;

      if (!id) {
        await closeDbClient(db);
        return res.status(400).json({ error: 'Station ID is required' });
      }

      // Build update query dynamically
      const updateParts = [];
      const values = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        updateParts.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }
      if (updates.gameType !== undefined) {
        updateParts.push(`game_type = $${paramIndex++}`);
        values.push(updates.gameType);
      }
      if (updates.elapsedTime !== undefined) {
        updateParts.push(`elapsed_time = $${paramIndex++}`);
        values.push(updates.elapsedTime);
      }
      if (updates.isRunning !== undefined) {
        updateParts.push(`is_running = $${paramIndex++}`);
        values.push(updates.isRunning);
      }
      if (updates.isDone !== undefined) {
        updateParts.push(`is_done = $${paramIndex++}`);
        values.push(updates.isDone);
      }
      if (updates.extraControllers !== undefined) {
        updateParts.push(`extra_controllers = $${paramIndex++}`);
        values.push(updates.extraControllers);
      }
      if (updates.snacks !== undefined) {
        updateParts.push(`snacks = $${paramIndex++}`);
        values.push(JSON.stringify(updates.snacks));
      }
      if (updates.customerName !== undefined) {
        updateParts.push(`customer_name = $${paramIndex++}`);
        values.push(updates.customerName);
      }
      if (updates.startTime !== undefined) {
        updateParts.push(`start_time = $${paramIndex++}`);
        values.push(updates.startTime);
      }
      if (updates.endTime !== undefined) {
        updateParts.push(`end_time = $${paramIndex++}`);
        values.push(updates.endTime);
      }

      if (updateParts.length === 0) {
        await closeDbClient(db);
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);
      const query = `
        UPDATE stations
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex}
      `;

      await client.query(query, values);

      await closeDbClient(db);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      // Delete a station
      const { id } = req.query;

      if (!id) {
        await closeDbClient(db);
        return res.status(400).json({ error: 'Station ID is required' });
      }

      await client.query('DELETE FROM stations WHERE id = $1', [id]);

      await closeDbClient(db);
      return res.status(200).json({ success: true });
    }

    await closeDbClient(db);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    if (db) {
      await closeDbClient(db);
    }
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
