import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Sanitize File Name
function sanitizeFileName(name) {
  let sanitized = name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .trim();

  if (!sanitized) {
    sanitized = 'Certificate';
  }
  return sanitized.slice(0, 120);
}

// Test 2: Filename pattern substitution
function generateCertificateFileName(pattern, row, index, extension = 'png') {
  let resolved = pattern || 'Certificate_{index}';
  resolved = resolved.replace(/{index}/gi, String(index + 1).padStart(3, '0'));

  for (const [key, value] of Object.entries(row)) {
    const regex = new RegExp(`{${key}}`, 'gi');
    resolved = resolved.replace(regex, String(value || ''));
  }

  resolved = resolved.replace(/{[^}]+}/g, '');
  const cleanBase = sanitizeFileName(resolved);
  const ext = extension === 'jpeg' ? 'jpg' : 'png';
  return `${cleanBase}.${ext}`;
}

// Test 3: Text transform
function applyTextTransform(text, transform) {
  if (!text) return '';
  switch (transform) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return text.replace(/\b\w/g, (c) => c.toUpperCase());
    default:
      return text;
  }
}

// Test 4: Data Validation Logic
function validateSpreadsheetData(fields, rows, columnMapping, excludedIndices = []) {
  const errors = [];
  const warnings = [];
  const requiredFields = fields.filter((f) => f.required && f.visible);
  let invalidRowsCount = 0;

  rows.forEach((row, rowIndex) => {
    if (excludedIndices.includes(rowIndex)) return;
    let rowHasError = false;

    for (const field of requiredFields) {
      const mappedCol = columnMapping[field.fieldKey];
      const val = mappedCol ? row[mappedCol] : row[field.fieldKey] ?? row[field.label];

      if (!val || String(val).trim() === '') {
        errors.push({
          row: rowIndex + 1,
          fieldKey: field.fieldKey,
          message: `Required field "${field.label}" is missing or empty.`,
        });
        rowHasError = true;
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
  };
}

test('sanitizeFileName handles Windows restricted characters', () => {
  assert.equal(sanitizeFileName('Certificate: John <Doe> *Winner*?'), 'Certificate_John_Doe_Winner');
  assert.equal(sanitizeFileName('Event/2026\\Cert|Rank#1'), 'Event_2026_Cert_Rank#1');
  assert.equal(sanitizeFileName('   '), 'Certificate');
});

test('generateCertificateFileName replaces placeholders correctly', () => {
  const row = {
    recipient_name: 'Aarav Sharma',
    certificate_id: 'CES-001',
    event_name: 'Hackathon 2026',
  };

  const name1 = generateCertificateFileName('Certificate_{recipient_name}_{certificate_id}', row, 0, 'png');
  assert.equal(name1, 'Certificate_Aarav_Sharma_CES-001.png');

  const name2 = generateCertificateFileName('{index}_{recipient_name}', row, 4, 'jpeg');
  assert.equal(name2, '005_Aarav_Sharma.jpg');
});

test('applyTextTransform applies case formatting correctly', () => {
  assert.equal(applyTextTransform('computer engineers society', 'uppercase'), 'COMPUTER ENGINEERS SOCIETY');
  assert.equal(applyTextTransform('CES Chapter', 'lowercase'), 'ces chapter');
  assert.equal(applyTextTransform('aarav sharma', 'capitalize'), 'Aarav Sharma');
  assert.equal(applyTextTransform('Unchanged Text', 'none'), 'Unchanged Text');
});

test('validateSpreadsheetData catches missing required fields', () => {
  const fields = [
    { fieldKey: 'recipient_name', label: 'Recipient Name', required: true, visible: true },
    { fieldKey: 'event_name', label: 'Event Name', required: false, visible: true },
  ];

  const rows = [
    { recipient_name: 'Alice', event_name: 'AI Workshop' },
    { recipient_name: '', event_name: 'Web Bootcamp' }, // missing name
    { recipient_name: 'Charlie', event_name: 'Cybersecurity' },
  ];

  const mapping = { recipient_name: 'recipient_name', event_name: 'event_name' };

  const report = validateSpreadsheetData(fields, rows, mapping, []);
  assert.equal(report.valid, false);
  assert.equal(report.errors.length, 1);
  assert.equal(report.errors[0].row, 2);
  assert.equal(report.validRowCount, 2);
  assert.equal(report.invalidRowCount, 1);
});

test('validateSpreadsheetData respects excluded rows', () => {
  const fields = [
    { fieldKey: 'recipient_name', label: 'Recipient Name', required: true, visible: true },
  ];

  const rows = [
    { recipient_name: 'Alice' },
    { recipient_name: '' }, // row index 1 has error
  ];

  const mapping = { recipient_name: 'recipient_name' };

  // Exclude row index 1
  const report = validateSpreadsheetData(fields, rows, mapping, [1]);
  assert.equal(report.valid, true);
  assert.equal(report.validRowCount, 1);
  assert.equal(report.invalidRowCount, 0);
  assert.equal(report.errors.length, 0);
});
