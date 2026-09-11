import { SpreadsheetRow } from './types';

/**
 * Sanitizes a string for use as a file name across operating systems (especially Windows)
 */
export function sanitizeFileName(name: string): string {
  // Remove characters invalid in Windows / POSIX file names: < > : " / \ | ? *
  let sanitized = name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .trim();

  if (!sanitized) {
    sanitized = 'Certificate';
  }

  // Windows file name length limit safeguard
  return sanitized.slice(0, 120);
}

/**
 * Generates an output filename from a pattern and row data
 * Pattern example: "Certificate_{recipient_name}_{certificate_id}"
 */
export function generateCertificateFileName(
  pattern: string,
  row: SpreadsheetRow,
  index: number,
  extension: 'png' | 'jpeg' = 'png'
): string {
  let resolved = pattern || 'Certificate_{index}';

  // Replace {index}
  resolved = resolved.replace(/{index}/gi, String(index + 1).padStart(3, '0'));

  // Replace any {key} with row[key]
  for (const [key, value] of Object.entries(row)) {
    const regex = new RegExp(`{${key}}`, 'gi');
    resolved = resolved.replace(regex, String(value || ''));
  }

  // Remove any unreplaced {placeholders}
  resolved = resolved.replace(/{[^}]+}/g, '');

  const cleanBase = sanitizeFileName(resolved);
  const ext = extension === 'jpeg' ? 'jpg' : 'png';
  return `${cleanBase}.${ext}`;
}
