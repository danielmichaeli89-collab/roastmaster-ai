import { parse } from 'csv-parse/sync';
import fs from 'fs';

export const parseRoestCSV = async (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (!records || records.length === 0) {
      throw new Error('CSV file is empty or invalid');
    }

    const roastData = extractRoastMetadata(records);
    const temperatureLogs = extractTemperatureLogs(records);
    const events = extractEvents(records);

    return {
      roastData,
      temperatureLogs,
      events,
      recordCount: records.length
    };
  } catch (error) {
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
};

const extractRoastMetadata = (records) => {
  if (!records || records.length === 0) return {};

  const firstRecord = records[0];
  const lastRecord = records[records.length - 1];

  const startTime = parseTimestamp(firstRecord);
  const endTime = parseTimestamp(lastRecord);

  const duration = startTime && endTime ?
    Math.floor((endTime - startTime) / 1000) : null;

  return {
    batch_weight_g: parseFloat(firstRecord['Batch Weight (g)']) || null,
    charge_temp: parseFloat(firstRecord['Charge Temp (°C)']) || parseFloat(firstRecord['Inlet Temp (°C)']) || null,
    start_time: startTime,
    end_time: endTime,
    total_duration: duration,
    ambient_temperature: parseFloat(firstRecord['Ambient Temp (°C)']) || null,
    ambient_humidity_percent: parseFloat(firstRecord['Ambient Humidity (%)']) || null,
    csv_source_file: 'roest_export.csv'
  };
};

const extractTemperatureLogs = (records) => {
  return records.map((record, index) => {
    const timestamp = parseTimestamp(record);
    const elapsedSeconds = record['Time (s)'] ? parseInt(record['Time (s)']) : index;

    return {
      timestamp,
      elapsed_seconds: elapsedSeconds,
      bean_temp_1: parseFloat(record['BT1 (°C)']) || parseFloat(record['Bean Temp 1 (°C)']) || null,
      bean_temp_2: parseFloat(record['BT2 (°C)']) || parseFloat(record['Bean Temp 2 (°C)']) || null,
      air_temp: parseFloat(record['Air Temp (°C)']) || null,
      inlet_temp: parseFloat(record['Inlet Temp (°C)']) || null,
      drum_temp: parseFloat(record['Drum Temp (°C)']) || null,
      exhaust_temp: parseFloat(record['Exhaust Temp (°C)']) || null,
      drum_pressure: parseFloat(record['Drum Pressure (bar)']) || null,
      ror_bt: calculateRoR(records, index, 'BT1') || calculateRoR(records, index, 'Bean Temp 1'),
      ror_et: calculateRoR(records, index, 'Air Temp'),
      power_pct: parseFloat(record['Power (%)']) || null,
      airflow_pct: parseFloat(record['Airflow (%)']) || null,
      rpm: parseInt(record['RPM']) || null,
      phase: classifyPhase(index, records.length, parseFloat(record['BT1 (°C)'] || record['Bean Temp 1 (°C)']) || 0)
    };
  });
};

const extractEvents = (records) => {
  const events = [];

  if (!records || records.length < 2) return events;

  let firstCrackDetected = false;
  let secondCrackDetected = false;

  for (let i = 1; i < records.length; i++) {
    const prevTemp = parseFloat(records[i - 1]['BT1 (°C)'] || records[i - 1]['Bean Temp 1 (°C)']) || 0;
    const currTemp = parseFloat(records[i]['BT1 (°C)'] || records[i]['Bean Temp 1 (°C)']) || 0;
    const elapsedSeconds = parseInt(records[i]['Time (s)']) || i;

    if (currTemp >= 196 && prevTemp < 196 && !firstCrackDetected) {
      firstCrackDetected = true;
      events.push({
        event_type: 'first_crack',
        elapsed_seconds: elapsedSeconds,
        temperature: currTemp,
        description: 'First crack detected from temperature curve',
        auto_detected: true
      });
    }

    if (currTemp >= 225 && prevTemp < 225 && !secondCrackDetected) {
      secondCrackDetected = true;
      events.push({
        event_type: 'second_crack',
        elapsed_seconds: elapsedSeconds,
        temperature: currTemp,
        description: 'Second crack detected from temperature curve',
        auto_detected: true
      });
    }

    if (currTemp >= 140 && currTemp <= 160 && !firstCrackDetected) {
      const maillardStart = parseInt(records[0]['Time (s)']) || 0;
      if (elapsedSeconds - maillardStart > 30) {
        events.push({
          event_type: 'yellowing',
          elapsed_seconds: elapsedSeconds,
          temperature: currTemp,
          description: 'Browning/Maillard reaction window detected',
          auto_detected: true
        });
        break;
      }
    }
  }

  return events;
};

const parseTimestamp = (record) => {
  const timeStr = record['Timestamp'] || record['Time'] || record['Date Time'];
  if (!timeStr) return null;

  try {
    return new Date(timeStr);
  } catch {
    return null;
  }
};

const calculateRoR = (records, index, tempKey) => {
  if (index < 1) return null;

  const currKey = tempKey.includes('1') || tempKey.includes('Bean') ?
    (tempKey.includes('(°C)') ? tempKey : tempKey + ' (°C)') :
    tempKey;

  const prevKey = currKey.includes('BT1') ? 'BT1 (°C)' :
                  currKey.includes('Bean Temp 1') ? 'Bean Temp 1 (°C)' :
                  currKey;

  const altKey = currKey.includes('BT1') ? 'Bean Temp 1 (°C)' :
                 currKey.includes('Bean Temp 1') ? 'BT1 (°C)' :
                 currKey;

  const prevTemp = parseFloat(records[index - 1][prevKey] || records[index - 1][altKey]) || 0;
  const currTemp = parseFloat(records[index][currKey] || records[index][altKey]) || 0;

  const prevTime = parseInt(records[index - 1]['Time (s)']) || (index - 1);
  const currTime = parseInt(records[index]['Time (s)']) || index;

  const timeDiffSeconds = Math.max(1, currTime - prevTime);
  const tempDiff = currTemp - prevTemp;

  return parseFloat((tempDiff / (timeDiffSeconds / 60)).toFixed(2));
};

const classifyPhase = (index, totalRecords, currentTemp) => {
  const percentProgress = index / totalRecords;

  if (currentTemp < 100) return 'drying';
  if (currentTemp < 160) return 'yellowing';
  if (currentTemp < 196) return 'browning';
  if (currentTemp < 225) return 'first_crack';
  return 'development';
};
