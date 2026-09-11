export type FontStyle = 'normal' | 'italic';
export type TextAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'middle' | 'bottom';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type TextDecoration = 'none' | 'underline';
export type WrapMode = 'none' | 'word' | 'char';
export type OverflowBehavior = 'visible' | 'clip' | 'shrink';
export type OutputFormat = 'png' | 'jpeg';

export interface CertificateField {
  id: string;
  label: string;
  fieldKey: string;
  defaultValue: string;

  // Position & size in percentage (0 - 100) of original background dimensions
  x: number;
  y: number;
  width: number;
  height: number;

  // Typography
  fontFamily: string;
  fontSize: number; // in pixels relative to original certificate dimensions
  fontWeight: number; // 100 - 900
  fontStyle: FontStyle;
  textColor: string;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
  letterSpacing: number; // in pixels or em
  lineHeight: number; // multiplier e.g. 1.2
  textTransform: TextTransform;
  textDecoration: TextDecoration;

  // Multi-line and wrapping
  multiLine: boolean;
  wrapMode: WrapMode;
  overflowBehavior: OverflowBehavior;

  // Layering and State
  zIndex: number;
  locked: boolean;
  visible: boolean;
  required: boolean;
  maxLength?: number;
}

export interface OutputSettings {
  format: OutputFormat;
  quality: number; // 0.1 - 1.0 (for JPEG)
  filenamePattern: string; // e.g. "Certificate_{recipient_name}_{certificate_id}"
  zipFilename: string; // e.g. "CES_Certificates_{event_name}"
}

export interface BackgroundMeta {
  width: number;
  height: number;
  format: string;
  name: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  backgroundImageDataUrl?: string; // Data URL for preview / storage
  backgroundMeta: BackgroundMeta;
  fields: CertificateField[];
  outputSettings: OutputSettings;
}

export interface CustomFont {
  id: string;
  name: string;
  style: FontStyle;
  weight: number;
  blob: Blob;
  format: string; // 'ttf' | 'otf' | 'woff' | 'woff2'
  addedAt: string;
}

export type SpreadsheetRow = Record<string, string>;

export interface ColumnMapping {
  [fieldKey: string]: string; // fieldKey -> spreadsheetColumnHeader
}

export interface ValidationError {
  row: number;
  fieldKey: string;
  fieldLabel: string;
  message: string;
}

export interface ValidationWarning {
  row: number;
  fieldKey: string;
  fieldLabel: string;
  message: string;
}

export interface ValidationReport {
  valid: boolean;
  totalRows: number;
  validRowCount: number;
  invalidRowCount: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  excludedRows: number[]; // Set of row indices excluded by user
}

export interface GenerationProgress {
  status: 'idle' | 'generating' | 'packaging' | 'completed' | 'error' | 'cancelled';
  total: number;
  current: number;
  percentage: number;
  currentName?: string;
  error?: string;
}

export interface TestPreviewResult {
  rowIndex: number;
  dataUrl: string;
  recipientName: string;
}
