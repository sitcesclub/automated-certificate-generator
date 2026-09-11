import * as XLSX from 'xlsx';
import { SpreadsheetRow } from './types';

export interface ParsedSpreadsheet {
  fileName: string;
  sheetNames: string[];
  activeSheet: string;
  headers: string[];
  rows: SpreadsheetRow[];
  totalRows: number;
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV file client-side into structured rows
 */
export async function parseSpreadsheetFile(file: File): Promise<ParsedSpreadsheet> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, {
    type: 'array',
    cellDates: true,
    cellText: true,
  });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded spreadsheet contains no sheets.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) {
    throw new Error('Unable to read sheet contents.');
  }

  // Convert worksheet to raw array of arrays to reliably extract header names
  const rawData: (string | number | boolean | null | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (rawData.length === 0) {
    throw new Error('The spreadsheet is empty.');
  }

  const rawHeaders = rawData[0];
  const headers = rawHeaders.map((h, idx) => {
    const val = String(h || '').trim();
    return val || `Column_${idx + 1}`;
  });

  const rows: SpreadsheetRow[] = [];
  for (let r = 1; r < rawData.length; r++) {
    const rowValues = rawData[r];
    // Check if entire row is empty
    const hasValues = rowValues.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== '');
    if (!hasValues) continue;

    const rowObj: SpreadsheetRow = {};
    headers.forEach((header, colIdx) => {
      const cellVal = rowValues[colIdx] as unknown;
      if (cellVal instanceof Date) {
        rowObj[header] = cellVal.toLocaleDateString();
      } else if (cellVal !== undefined && cellVal !== null) {
        rowObj[header] = String(cellVal).trim();
      } else {
        rowObj[header] = '';
      }
    });
    rows.push(rowObj);
  }

  return {
    fileName: file.name,
    sheetNames: workbook.SheetNames,
    activeSheet: firstSheetName,
    headers,
    rows,
    totalRows: rows.length,
  };
}
