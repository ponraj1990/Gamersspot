import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get all invoices or a specific invoice
      const { invoiceNumber } = req.query;

      if (invoiceNumber) {
        const { rows } = await sql`
          SELECT * FROM invoices
          WHERE invoice_number = ${invoiceNumber}
          ORDER BY created_at DESC
        `;
        
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Invoice not found' });
        }

        const invoice = rows[0];
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
      const { rows } = await sql`
        SELECT 
          invoice_number as "invoiceNumber",
          subtotal,
          discount,
          total,
          created_at as "createdAt"
        FROM invoices
        ORDER BY created_at DESC
        LIMIT 100
      `;

      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      // Create a new invoice
      const { invoiceNumber, stations, subtotal, discount, total } = req.body;

      if (!invoiceNumber || !stations || total === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await sql`
        INSERT INTO invoices (invoice_number, stations, subtotal, discount, total)
        VALUES (
          ${invoiceNumber},
          ${JSON.stringify(stations)},
          ${subtotal || total},
          ${discount || 0},
          ${total}
        )
      `;

      return res.status(201).json({ success: true, invoiceNumber });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
