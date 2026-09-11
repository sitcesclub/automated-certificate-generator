import { CertificateField, ColumnMapping, SpreadsheetRow, ValidationError, ValidationWarning, ValidationReport } from './types';

export function validateSpreadsheetData(
  fields: CertificateField[],
  rows: SpreadsheetRow[],
  columnMapping: ColumnMapping,
  excludedIndices: number[] = []
): ValidationReport {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const requiredFields = fields.filter((f) => f.required && f.visible);

  // Track duplicates for common unique identifiers like certificate_id, email, reg_no
  const uniqueTracker: Record<string, Set<string>> = {};
  fields.forEach((f) => {
    if (f.fieldKey.toLowerCase().includes('id') || f.fieldKey.toLowerCase().includes('code')) {
      uniqueTracker[f.fieldKey] = new Set();
    }
  });

  let invalidRowsCount = 0;

  rows.forEach((row, rowIndex) => {
    if (excludedIndices.includes(rowIndex)) return;

    let rowHasError = false;

    // Check required fields
    for (const field of requiredFields) {
      const mappedCol = columnMapping[field.fieldKey];
      const val = mappedCol ? row[mappedCol] : row[field.fieldKey] ?? row[field.label];

      if (!val || String(val).trim() === '') {
        errors.push({
          row: rowIndex + 1,
          fieldKey: field.fieldKey,
          fieldLabel: field.label,
          message: `Required field "${field.label}" is missing or empty.`,
        });
        rowHasError = true;
      }
    }

    // Check max length
    for (const field of fields) {
      if (field.maxLength && field.maxLength > 0) {
        const mappedCol = columnMapping[field.fieldKey];
        const val = mappedCol ? row[mappedCol] : row[field.fieldKey] ?? row[field.label] ?? '';
        if (String(val).length > field.maxLength) {
          warnings.push({
            row: rowIndex + 1,
            fieldKey: field.fieldKey,
            fieldLabel: field.label,
            message: `Value exceeds recommended length (${String(val).length}/${field.maxLength} chars).`,
          });
        }
      }
    }

    // Check duplicate IDs
    for (const [key, seenSet] of Object.entries(uniqueTracker)) {
      const mappedCol = columnMapping[key];
      const val = mappedCol ? row[mappedCol] : row[key];
      if (val && String(val).trim() !== '') {
        const cleanVal = String(val).trim();
        if (seenSet.has(cleanVal)) {
          warnings.push({
            row: rowIndex + 1,
            fieldKey: key,
            fieldLabel: key,
            message: `Duplicate ID detected: "${cleanVal}"`,
          });
        } else {
          seenSet.add(cleanVal);
        }
      }
    }

    if (rowHasError) {
      invalidRowsCount++;
    }
  });

  const totalActiveRows = rows.length - excludedIndices.length;
  const validRowCount = Math.max(0, totalActiveRows - invalidRowsCount);

  return {
    valid: errors.length === 0,
    totalRows: rows.length,
    validRowCount,
    invalidRowCount: invalidRowsCount,
    errors,
    warnings,
    excludedRows: excludedIndices,
  };
}
