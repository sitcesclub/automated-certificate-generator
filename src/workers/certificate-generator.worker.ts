import JSZip from 'jszip';
import { renderCertificate, exportCanvasToBlob } from '../lib/canvas-renderer';
import { generateCertificateFileName } from '../lib/filename-generator';
import { CertificateField, BackgroundMeta, SpreadsheetRow, OutputSettings } from '../lib/types';

export interface WorkerGeneratePayload {
  fields: CertificateField[];
  backgroundMeta: BackgroundMeta | null;
  backgroundImageBitmap: ImageBitmap | null;
  rows: SpreadsheetRow[];
  columnMapping: Record<string, string>;
  outputSettings: OutputSettings;
  chunkSize?: number;
}

self.onmessage = async (e: MessageEvent<WorkerGeneratePayload>) => {
  const {
    fields,
    backgroundMeta,
    backgroundImageBitmap,
    rows,
    columnMapping,
    outputSettings,
    chunkSize = 25,
  } = e.data;

  try {
    const total = rows.length;
    if (total === 0) {
      self.postMessage({ type: 'error', message: 'No rows provided' });
      return;
    }

    const zip = new JSZip();
    const certsFolder = zip.folder('certificates') || zip;

    const targetWidth = backgroundMeta?.width || 1920;
    const targetHeight = backgroundMeta?.height || 1080;

    const offscreen = new OffscreenCanvas(targetWidth, targetHeight);

    self.postMessage({
      type: 'progress',
      status: 'generating',
      total,
      current: 0,
      percentage: 0,
    });

    for (let i = 0; i < total; i++) {
      const row = rows[i];

      const mappedRow: SpreadsheetRow = { ...row };
      for (const [fieldKey, colHeader] of Object.entries(columnMapping)) {
        if (colHeader && row[colHeader] !== undefined) {
          mappedRow[fieldKey] = row[colHeader];
        }
      }

      renderCertificate({
        canvas: offscreen,
        backgroundImage: backgroundImageBitmap,
        backgroundMeta,
        fields,
        dataRow: mappedRow,
        scale: 1.0,
        showFieldOutlines: false,
      });

      const blob = await exportCanvasToBlob(offscreen, outputSettings.format, outputSettings.quality);
      const filename = generateCertificateFileName(
        outputSettings.filenamePattern,
        mappedRow,
        i,
        outputSettings.format
      );

      certsFolder.file(filename, blob);

      const currentCount = i + 1;
      const percentage = Math.round((currentCount / total) * 100);

      self.postMessage({
        type: 'progress',
        status: 'generating',
        total,
        current: currentCount,
        percentage,
        currentName: mappedRow['recipient_name'] || `Certificate #${currentCount}`,
      });

      if (i % chunkSize === 0) {
        await new Promise((res) => setTimeout(res, 0));
      }
    }

    self.postMessage({
      type: 'progress',
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
        self.postMessage({
          type: 'progress',
          status: 'packaging',
          total,
          current: total,
          percentage: Math.round(metadata.percent),
          currentName: `Compressing files: ${Math.round(metadata.percent)}%`,
        });
      }
    );

    self.postMessage({
      type: 'completed',
      zipBlob,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    self.postMessage({ type: 'error', message: msg });
  }
};
