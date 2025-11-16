import { getDbClient, closeDbClient } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
      const { type, date, month, year } = req.query;

      if (type === 'usage') {
        // System usage report by date
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        const { rows } = await client.query(`
          SELECT 
            id,
            name,
            game_type,
            customer_name,
            elapsed_time,
            start_time,
            end_time,
            extra_controllers,
            snacks,
            created_at,
            updated_at
          FROM stations
          WHERE DATE(created_at) = $1::date 
             OR DATE(updated_at) = $1::date
          ORDER BY updated_at DESC
        `, [targetDate]);

        // Calculate totals
        const totalStations = rows.length;
        const totalTime = rows.reduce((sum, row) => sum + (parseInt(row.elapsed_time) || 0), 0);
        const activeStations = rows.filter(row => row.customer_name && row.customer_name.trim() !== '').length;
        
        // Group by game type with detailed information
        const byGameType = rows.reduce((acc, row) => {
          const type = row.game_type || 'Unknown';
          if (!acc[type]) {
            acc[type] = { 
              count: 0, 
              totalTime: 0,
              customers: [],
              stations: []
            };
          }
          acc[type].count++;
          acc[type].totalTime += parseInt(row.elapsed_time) || 0;
          
          // Add customer name if exists
          if (row.customer_name && row.customer_name.trim() !== '') {
            if (!acc[type].customers.includes(row.customer_name)) {
              acc[type].customers.push(row.customer_name);
            }
          }
          
          // Add station details
          acc[type].stations.push({
            id: row.id,
            name: row.name,
            customerName: row.customer_name || null,
            elapsedTime: parseInt(row.elapsed_time) || 0,
            startTime: row.start_time,
            endTime: row.end_time
          });
          
          return acc;
        }, {});

        await closeDbClient(db);
        return res.status(200).json({
          date: targetDate,
          summary: {
            totalStations,
            activeStations,
            totalTime,
            totalHours: (totalTime / 3600).toFixed(2),
            byGameType
          },
          stations: rows.map(row => ({
            ...row,
            snacks: typeof row.snacks === 'string' ? JSON.parse(row.snacks) : row.snacks
          }))
        });
      }

      if (type === 'daily-revenue') {
        // Daily revenue report
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        const { rows } = await client.query(`
          SELECT 
            invoice_number,
            subtotal,
            discount,
            total,
            created_at,
            stations
          FROM invoices
          WHERE DATE(created_at) = $1::date
          ORDER BY created_at DESC
        `, [targetDate]);

        const totalRevenue = rows.reduce((sum, row) => sum + parseFloat(row.total || 0), 0);
        const totalSubtotal = rows.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0);
        const totalDiscount = rows.reduce((sum, row) => sum + parseFloat(row.discount || 0), 0);
        const invoiceCount = rows.length;

        // Calculate game type breakdown from all invoices
        const gameTypeBreakdown = {
          'PS5': { totalTime: 0, totalRevenue: 0, customers: [], stationCount: 0 },
          'PlayStation': { totalTime: 0, totalRevenue: 0, customers: [], stationCount: 0 }, // Legacy support
          'Steering Wheel': { totalTime: 0, totalRevenue: 0, customers: [], stationCount: 0 },
          'System': { totalTime: 0, totalRevenue: 0, customers: [], stationCount: 0 }
        };

        // Extract customer names and game type info from stations data
        const invoicesWithCustomers = rows.map(row => {
          let customerNames = 'N/A';
          try {
            // Handle JSONB - PostgreSQL returns it as object or string depending on driver
            let stations = row.stations;
            
            // Debug: Log the raw row structure
            console.log('=== Daily Revenue - Invoice:', row.invoice_number, '===');
            console.log('Row keys:', Object.keys(row));
            console.log('Raw stations type:', typeof stations);
            console.log('Raw stations is array?', Array.isArray(stations));
            
            // Normalize: Convert to array if needed
            if (!Array.isArray(stations)) {
              if (typeof stations === 'string') {
                // If it's a string, parse it
                stations = JSON.parse(stations);
              } else if (typeof stations === 'object' && stations !== null) {
                // If it's an object, check if it's already an array-like structure
                // or if we need to stringify and parse
                if (Array.isArray(stations)) {
                  // Already an array, use it
                } else {
                  // Try to stringify and parse to normalize
                  const str = JSON.stringify(stations);
                  stations = JSON.parse(str);
                }
              }
            }
            
            console.log('Normalized stations type:', typeof stations);
            console.log('Normalized stations is array?', Array.isArray(stations));
            console.log('Normalized stations:', JSON.stringify(stations, null, 2));
            
            if (Array.isArray(stations) && stations.length > 0) {
              console.log('Processing', stations.length, 'stations');
              const names = stations
                .map((station, index) => {
                  // Debug each station
                  console.log(`Station ${index}:`, {
                    id: station?.id,
                    name: station?.name,
                    hasCustomerName: station && 'customerName' in station,
                    customerName: station?.customerName,
                    customerNameType: typeof station?.customerName,
                    allKeys: station ? Object.keys(station) : []
                  });
                  
                  // Try multiple possible field names - customerName should be the correct one
                  const name = station?.customerName || 
                         station?.customer_name || 
                         station?.customer || 
                         '';
                  
                  // Track game type breakdown
                  const gameType = station?.gameType || station?.game_type || 'Unknown';
                  const elapsedTime = parseInt(station?.elapsedTime || station?.elapsed_time || 0);
                  const stationRevenue = parseFloat(row.total || 0) / stations.length; // Approximate per station
                  
                  // Update game type breakdown
                  // Normalize game type (PS5 = PlayStation for display)
                  const normalizedGameType = (gameType === 'PS5' || gameType === 'PlayStation') ? 'PS5' : gameType;
                  if (gameTypeBreakdown[normalizedGameType] || gameTypeBreakdown[gameType]) {
                    const targetType = gameTypeBreakdown[normalizedGameType] || gameTypeBreakdown[gameType];
                    if (targetType) {
                      targetType.totalTime += elapsedTime;
                      targetType.totalRevenue += stationRevenue;
                      targetType.stationCount += 1;
                      if (name && name.trim() !== '' && !targetType.customers.includes(name)) {
                        targetType.customers.push(name);
                      }
                    }
                  }
                  
                  console.log(`  -> Extracted name: "${name}"`);
                  return name;
                })
                .filter(name => name && typeof name === 'string' && name.trim() !== '')
                .filter((name, index, self) => self.indexOf(name) === index); // Remove duplicates
              
              console.log('Final extracted customer names array:', names);
              customerNames = names.length > 0 ? names.join(', ') : 'N/A';
              console.log('Final customerNames string:', customerNames);
            } else {
              console.log('Stations is not an array or is empty. Type:', typeof stations, 'Is array:', Array.isArray(stations), 'Value:', stations);
            }
          } catch (e) {
            console.error('Error parsing stations for customer names:', e);
            console.error('Error stack:', e.stack);
            console.error('Row data:', JSON.stringify(row, null, 2));
          }
          return {
            ...row,
            customer_names: customerNames
          };
        });

        await closeDbClient(db);
        return res.status(200).json({
          date: targetDate,
          summary: {
            invoiceCount,
            totalRevenue: totalRevenue.toFixed(2),
            totalSubtotal: totalSubtotal.toFixed(2),
            totalDiscount: totalDiscount.toFixed(2),
            gameTypeBreakdown
          },
          invoices: invoicesWithCustomers
        });
      }

      if (type === 'monthly-revenue') {
        // Monthly revenue report
        const targetMonth = month || new Date().getMonth() + 1;
        const targetYear = year || new Date().getFullYear();
        
        const { rows } = await client.query(`
          SELECT 
            invoice_number,
            subtotal,
            discount,
            total,
            created_at,
            stations
          FROM invoices
          WHERE EXTRACT(MONTH FROM created_at) = $1 
            AND EXTRACT(YEAR FROM created_at) = $2
          ORDER BY created_at DESC
        `, [targetMonth, targetYear]);

        const totalRevenue = rows.reduce((sum, row) => sum + parseFloat(row.total || 0), 0);
        const totalSubtotal = rows.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0);
        const totalDiscount = rows.reduce((sum, row) => sum + parseFloat(row.discount || 0), 0);
        const invoiceCount = rows.length;

        // Calculate game type breakdown from all invoices
        const gameTypeBreakdown = {
          'PS5': { totalTime: 0, totalRevenue: 0, customers: [], stationCount: 0 },
          'PlayStation': { totalTime: 0, totalRevenue: 0, customers: [], stationCount: 0 }, // Legacy support
          'Steering Wheel': { totalTime: 0, totalRevenue: 0, customers: [], stationCount: 0 },
          'System': { totalTime: 0, totalRevenue: 0, customers: [], stationCount: 0 }
        };

        // Daily breakdown
        const dailyBreakdown = rows.reduce((acc, row) => {
          const day = new Date(row.created_at).getDate();
          if (!acc[day]) {
            acc[day] = { count: 0, revenue: 0 };
          }
          acc[day].count++;
          acc[day].revenue += parseFloat(row.total || 0);
          return acc;
        }, {});

        // Extract customer names and game type info from stations data
        const invoicesWithCustomers = rows.map(row => {
          let customerNames = 'N/A';
          try {
            // Handle JSONB - PostgreSQL returns it as object or string depending on driver
            let stations = row.stations;
            
            // Debug: Log the raw row structure
            console.log('=== Monthly Revenue - Invoice:', row.invoice_number, '===');
            console.log('Row keys:', Object.keys(row));
            console.log('Raw stations type:', typeof stations);
            console.log('Raw stations is array?', Array.isArray(stations));
            
            // Normalize: Convert to array if needed
            if (!Array.isArray(stations)) {
              if (typeof stations === 'string') {
                // If it's a string, parse it
                stations = JSON.parse(stations);
              } else if (typeof stations === 'object' && stations !== null) {
                // If it's an object, check if it's already an array-like structure
                // or if we need to stringify and parse
                if (Array.isArray(stations)) {
                  // Already an array, use it
                } else {
                  // Try to stringify and parse to normalize
                  const str = JSON.stringify(stations);
                  stations = JSON.parse(str);
                }
              }
            }
            
            console.log('Normalized stations type:', typeof stations);
            console.log('Normalized stations is array?', Array.isArray(stations));
            console.log('Normalized stations:', JSON.stringify(stations, null, 2));
            
            if (Array.isArray(stations) && stations.length > 0) {
              console.log('Processing', stations.length, 'stations');
              const names = stations
                .map((station, index) => {
                  // Debug each station
                  console.log(`Station ${index}:`, {
                    id: station?.id,
                    name: station?.name,
                    hasCustomerName: station && 'customerName' in station,
                    customerName: station?.customerName,
                    customerNameType: typeof station?.customerName,
                    allKeys: station ? Object.keys(station) : []
                  });
                  
                  // Try multiple possible field names - customerName should be the correct one
                  const name = station?.customerName || 
                         station?.customer_name || 
                         station?.customer || 
                         '';
                  
                  // Track game type breakdown
                  const gameType = station?.gameType || station?.game_type || 'Unknown';
                  const elapsedTime = parseInt(station?.elapsedTime || station?.elapsed_time || 0);
                  const stationRevenue = parseFloat(row.total || 0) / stations.length; // Approximate per station
                  
                  // Update game type breakdown
                  // Normalize game type (PS5 = PlayStation for display)
                  const normalizedGameType = (gameType === 'PS5' || gameType === 'PlayStation') ? 'PS5' : gameType;
                  if (gameTypeBreakdown[normalizedGameType] || gameTypeBreakdown[gameType]) {
                    const targetType = gameTypeBreakdown[normalizedGameType] || gameTypeBreakdown[gameType];
                    if (targetType) {
                      targetType.totalTime += elapsedTime;
                      targetType.totalRevenue += stationRevenue;
                      targetType.stationCount += 1;
                      if (name && name.trim() !== '' && !targetType.customers.includes(name)) {
                        targetType.customers.push(name);
                      }
                    }
                  }
                  
                  console.log(`  -> Extracted name: "${name}"`);
                  return name;
                })
                .filter(name => name && typeof name === 'string' && name.trim() !== '')
                .filter((name, index, self) => self.indexOf(name) === index); // Remove duplicates
              
              console.log('Final extracted customer names array:', names);
              customerNames = names.length > 0 ? names.join(', ') : 'N/A';
              console.log('Final customerNames string:', customerNames);
            } else {
              console.log('Stations is not an array or is empty. Type:', typeof stations, 'Is array:', Array.isArray(stations), 'Value:', stations);
            }
          } catch (e) {
            console.error('Error parsing stations for customer names:', e);
            console.error('Error stack:', e.stack);
            console.error('Row data:', JSON.stringify(row, null, 2));
          }
          return {
            ...row,
            customer_names: customerNames
          };
        });

        await closeDbClient(db);
        return res.status(200).json({
          month: targetMonth,
          year: targetYear,
          summary: {
            invoiceCount,
            totalRevenue: totalRevenue.toFixed(2),
            totalSubtotal: totalSubtotal.toFixed(2),
            totalDiscount: totalDiscount.toFixed(2)
          },
          dailyBreakdown: Object.entries(dailyBreakdown).map(([day, data]) => ({
            day: parseInt(day),
            invoiceCount: data.count,
            revenue: parseFloat(data.revenue.toFixed(2))
          })).sort((a, b) => a.day - b.day),
          invoices: invoicesWithCustomers
        });
      }

      await closeDbClient(db);
      return res.status(400).json({ error: 'Invalid report type. Use: usage, daily-revenue, or monthly-revenue' });
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

