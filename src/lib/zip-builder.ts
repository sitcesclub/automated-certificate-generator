import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  CertificateField,
  BackgroundMeta,
  SpreadsheetRow,
  OutputSettings,
  GenerationProgress,
} from './types';
import { renderCertificate, exportCanvasToBlob } from './canvas-renderer';
import { generateCertificateFileName } from './filename-generator';
import { BATCH_CHUNK_SIZE } from './constants';

export interface BatchGenerationParams {
  fields: CertificateField[];
  backgroundMeta: BackgroundMeta | null;
  backgroundImageElement: HTMLImageElement | null;
  rows: SpreadsheetRow[];
  columnMapping: Record<string, string>;
  outputSettings: OutputSettings;
  onProgress: (progress: GenerationProgress) => void;
  isCancelledRef: { current: boolean };
}

/**
 * Bulk generates certificates in the browser in non-blocking batches and packages them into a ZIP
 */
export async function generateCertificatesBatch({
  fields,
  backgroundMeta,
  backgroundImageElement,
  rows,
  columnMapping,
  outputSettings,
  onProgress,
  isCancelledRef,
}: BatchGenerationParams): Promise<Blob | null> {
  const total = rows.length;
  if (total === 0) return null;

  const zip = new JSZip();
  const certsFolder = zip.folder('certificates') || zip;

  // Create an offscreen canvas for rendering
  const canvas = document.createElement('canvas');
  const targetWidth = backgroundMeta?.width || 1920;
  const targetHeight = backgroundMeta?.height || 1080;
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  onProgress({
    status: 'generating',
    total,
    current: 0,
    percentage: 0,
    currentName: 'Starting generation...',
  });

  // Process rows in chunks
  for (let i = 0; i < total; i++) {
    if (isCancelledRef.current) {
      onProgress({
        status: 'cancelled',
        total,
        current: i,
        percentage: Math.round((i / total) * 100),
      });
      return null;
    }

    const row = rows[i];

    // Map row values using columnMapping
    const mappedRow: SpreadsheetRow = { ...row };
    for (const [fieldKey, colHeader] of Object.entries(columnMapping)) {
      if (colHeader && row[colHeader] !== undefined) {
        mappedRow[fieldKey] = row[colHeader];
      }
    }

    // Render single certificate to canvas
    renderCertificate({
      canvas,
      backgroundImage: backgroundImageElement,
      backgroundMeta,
      fields,
      dataRow: mappedRow,
      scale: 1.0,
      showFieldOutlines: false,
    });

    // Export canvas to blob
    const blob = await exportCanvasToBlob(canvas, outputSettings.format, outputSettings.quality);

    // Generate output filename
    const filename = generateCertificateFileName(
      outputSettings.filenamePattern,
      mappedRow,
      i,
      outputSettings.format
    );

    // Add to ZIP
    certsFolder.file(filename, blob);

    // Report progress
    const currentCount = i + 1;
    const pct = Math.round((currentCount / total) * 100);
    const recipientName = mappedRow['recipient_name'] || mappedRow['name'] || `Certificate #${currentCount}`;

    onProgress({
      status: 'generating',
      total,
      current: currentCount,
      percentage: pct,
      currentName: recipientName,
    });

    // Yield control to main thread periodically so UI stays smooth & responsive
    if (i % BATCH_CHUNK_SIZE === 0 || i === total - 1) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  // Packaging into ZIP
  onProgress({
    status: 'packaging',
    total,
    current: total,
    percentage: 100,
    currentName: 'Compiling ZIP archive...',
  });

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress({
        status: 'packaging',
        total,
        current: total,
        percentage: Math.round(metadata.percent),
        currentName: `Compressing files: ${Math.round(metadata.percent)}%`,
      });
    }
  );

  onProgress({
    status: 'completed',
    total,
    current: total,
    percentage: 100,
    currentName: 'Ready for download!',
  });

  return zipBlob;
}

/**
 * Initiates download of the generated ZIP archive
 */
export function downloadCertificatesZip(zipBlob: Blob, filename?: string) {
  const name = filename?.trim() || 'CES_Certificates';
  const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  saveAs(zipBlob, `${cleanName}.zip`);
}
