import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { parseRoestCSV } from '../services/csv-parser.service.js';

export const importRoestCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file required' });
  }

  try {
    const parsed = await parseRoestCSV(req.file.path);

    if (!parsed.roastData || !parsed.temperatureLogs) {
      return res.status(400).json({ error: 'Invalid CSV format' });
    }

    const roastId = uuidv4();

    const roastData = {
      id: roastId,
      user_id: req.user.id,
      status: 'completed',
      ...parsed.roastData,
      start_time: parsed.roastData.start_time || new Date(),
      csv_source_file: req.file.originalname
    };

    await db('roasts').insert(roastData);

    for (const log of parsed.temperatureLogs) {
      await db('temperature_logs').insert({
        ...log,
        id: uuidv4(),
        roast_id: roastId
      });
    }

    for (const event of parsed.events) {
      await db('roast_events').insert({
        ...event,
        id: uuidv4(),
        roast_id: roastId
      });
    }

    const roast = await db('roasts').where('id', roastId).first();

    return res.status(201).json({
      message: 'CSV imported successfully',
      roast,
      recordCount: parsed.recordCount
    });
  } catch (error) {
    console.error('CSV import error:', error);
    return res.status(500).json({
      error: 'Failed to import CSV',
      details: error.message
    });
  }
};
