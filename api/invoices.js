import { getDbClient, closeDbClient } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
      // Get all invoices or a specific invoice
      const { invoiceNumber } = req.query;

      if (invoiceNumber) {
        const { rows } = await client.query(
          'SELECT * FROM invoices WHERE invoice_number = $1 ORDER BY created_at DESC',
          [invoiceNumber]
        );
        
        if (rows.length === 0) {
          await closeDbClient(db);
          return res.status(404).json({ error: 'Invoice not found' });
        }

        const invoice = rows[0];
        await closeDbClient(db);
        return res.status(200).json({
          invoiceNumber: invoice.invoice_number,
          stations: typeof invoice.stations === 'string' ? JSON.parse(invoice.stations) : invoice.stations,
          subtotal: parseFloat(invoice.subtotal),
          discount: parseFloat(invoice.discount || 0),
          total: parseFloat(invoice.total),
          date: invoice.created_at
        });
      }

      // Get all invoices
      const { rows } = await client.query(`
        SELECT 
          invoice_number as "invoiceNumber",
          subtotal,
          discount,
          total,
          created_at as "createdAt"
        FROM invoices
        ORDER BY created_at DESC
        LIMIT 100
      `);

      await closeDbClient(db);
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      // Create a new invoice
      const { invoiceNumber, stations, subtotal, discount, total } = req.body;

      if (!invoiceNumber || !stations || total === undefined) {
        await closeDbClient(db);
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Debug: Log stations data to see if customerName is included
      console.log('Creating invoice:', invoiceNumber);
      console.log('Stations data:', JSON.stringify(stations, null, 2));
      if (Array.isArray(stations)) {
        stations.forEach((station, index) => {
          console.log(`Station ${index} customerName:`, station.customerName);
        });
      }

      await client.query(
        `INSERT INTO invoices (invoice_number, stations, subtotal, discount, total)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          invoiceNumber,
          JSON.stringify(stations),
          subtotal || total,
          discount || 0,
          total
        ]
      );

      await closeDbClient(db);
      return res.status(201).json({ success: true, invoiceNumber });
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
