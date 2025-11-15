import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get all stations
      const { rows } = await sql`
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
      `;
      
      // Transform snacks from JSONB to object
      const stations = rows.map(row => ({
        ...row,
        snacks: typeof row.snacks === 'string' ? JSON.parse(row.snacks) : row.snacks
      }));

      return res.status(200).json(stations);
    }

    if (req.method === 'POST') {
      // Create or update stations (bulk)
      const { stations } = req.body;

      if (!Array.isArray(stations)) {
        return res.status(400).json({ error: 'Stations must be an array' });
      }

      // Delete all existing stations and insert new ones
      await sql`DELETE FROM stations`;

      if (stations.length > 0) {
        // Insert stations one by one (simpler approach)
        for (const station of stations) {
          await sql`
            INSERT INTO stations (
              id, name, game_type, elapsed_time, is_running, is_done,
              extra_controllers, snacks, customer_name, start_time, end_time
            ) VALUES (
              ${station.id},
              ${station.name},
              ${station.gameType || 'PS5'},
              ${station.elapsedTime || 0},
              ${station.isRunning || false},
              ${station.isDone || false},
              ${station.extraControllers || 0},
              ${JSON.stringify(station.snacks || { cokeBottle: 0, cokeCan: 0 })},
              ${station.customerName || ''},
              ${station.startTime || null},
              ${station.endTime || null}
            )
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
          `;
        }
      }

      return res.status(200).json({ success: true, count: stations.length });
    }

    if (req.method === 'PUT') {
      // Update a single station
      const { id, ...updates } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Station ID is required' });
      }

      // Build update query dynamically
      const updateParts = [];
      if (updates.name !== undefined) updateParts.push(sql`name = ${updates.name}`);
      if (updates.gameType !== undefined) updateParts.push(sql`game_type = ${updates.gameType}`);
      if (updates.elapsedTime !== undefined) updateParts.push(sql`elapsed_time = ${updates.elapsedTime}`);
      if (updates.isRunning !== undefined) updateParts.push(sql`is_running = ${updates.isRunning}`);
      if (updates.isDone !== undefined) updateParts.push(sql`is_done = ${updates.isDone}`);
      if (updates.extraControllers !== undefined) updateParts.push(sql`extra_controllers = ${updates.extraControllers}`);
      if (updates.snacks !== undefined) updateParts.push(sql`snacks = ${JSON.stringify(updates.snacks)}`);
      if (updates.customerName !== undefined) updateParts.push(sql`customer_name = ${updates.customerName}`);
      if (updates.startTime !== undefined) updateParts.push(sql`start_time = ${updates.startTime}`);
      if (updates.endTime !== undefined) updateParts.push(sql`end_time = ${updates.endTime}`);

      if (updateParts.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const setClause = updateParts.reduce((acc, curr, index) => 
        index === 0 ? curr : sql`${acc}, ${curr}`
      );

      await sql`
        UPDATE stations
        SET ${setClause}
        WHERE id = ${id}
      `;

      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      // Delete a station
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Station ID is required' });
      }

      await sql`DELETE FROM stations WHERE id = ${id}`;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
