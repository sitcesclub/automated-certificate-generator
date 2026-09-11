import { CertificateField, BackgroundMeta, SpreadsheetRow } from './types';

export interface RenderOptions {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  backgroundImage: HTMLImageElement | ImageBitmap | null;
  backgroundMeta?: BackgroundMeta | null;
  fields: CertificateField[];
  dataRow?: SpreadsheetRow;
  scale?: number; // Visual preview scaling factor
  showFieldOutlines?: boolean;
  selectedFieldId?: string | null;
}

/**
 * Transforms string based on field's textTransform property
 */
export function applyTextTransform(text: string, transform: CertificateField['textTransform']): string {
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

/**
 * Resolves the display text for a field, using dataRow value or defaultValue
 */
export function getFieldValue(field: CertificateField, dataRow?: SpreadsheetRow): string {
  if (dataRow && (field.fieldKey in dataRow || field.label in dataRow)) {
    const val = dataRow[field.fieldKey] ?? dataRow[field.label] ?? '';
    return applyTextTransform(String(val), field.textTransform);
  }
  return applyTextTransform(field.defaultValue || '', field.textTransform);
}

/**
 * Word wraps text to fit within a maxWidth using Canvas measureText
 */
function wrapText(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  wrapMode: CertificateField['wrapMode']
): string[] {
  if (wrapMode === 'none' || maxWidth <= 0) {
    return [text];
  }

  // If word wrap
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      lines.push('');
      continue;
    }

    const words = paragraph.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines.length > 0 ? lines : [text];
}

/**
 * Draws text with letter spacing support across all canvas implementations
 */
function drawTextWithLetterSpacing(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
  textAlign: CertificateField['textAlign']
) {
  if (!letterSpacing || letterSpacing === 0) {
    ctx.fillText(text, x, y);
    return;
  }

  // Modern browsers support ctx.letterSpacing
  if ('letterSpacing' in ctx) {
    try {
      (ctx as unknown as { letterSpacing: string }).letterSpacing = `${letterSpacing}px`;
      ctx.fillText(text, x, y);
      return;
    } catch {
      // fallback to manual drawing if browser throws
    }
  }

  // Manual fallback for letter spacing
  const characters = text.split('');
  const totalSpacing = (characters.length - 1) * letterSpacing;
  let totalWidth = 0;
  const widths = characters.map((char) => {
    const w = ctx.measureText(char).width;
    totalWidth += w;
    return w;
  });
  totalWidth += totalSpacing;

  let currentX = x;
  if (textAlign === 'center') {
    currentX = x - totalWidth / 2;
  } else if (textAlign === 'right') {
    currentX = x - totalWidth;
  }

  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';

  for (let i = 0; i < characters.length; i++) {
    ctx.fillText(characters[i], currentX, y);
    currentX += widths[i] + letterSpacing;
  }

  ctx.textAlign = prevAlign;
}

/**
 * High-performance certificate renderer supporting HTMLCanvasElement and OffscreenCanvas
 */
export function renderCertificate({
  canvas,
  backgroundImage,
  backgroundMeta,
  fields,
  dataRow,
  scale = 1.0,
  showFieldOutlines = false,
  selectedFieldId = null,
}: RenderOptions): void {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!ctx) return;

  const targetWidth = backgroundMeta?.width || 1920;
  const targetHeight = backgroundMeta?.height || 1080;

  // Set canvas dimensions
  if (canvas.width !== Math.round(targetWidth * scale)) {
    canvas.width = Math.round(targetWidth * scale);
  }
  if (canvas.height !== Math.round(targetHeight * scale)) {
    canvas.height = Math.round(targetHeight * scale);
  }

  // Enable high-quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply visual scaling
  ctx.save();
  ctx.scale(scale, scale);

  // 1. Draw background image
  if (backgroundImage) {
    ctx.drawImage(backgroundImage as CanvasImageSource, 0, 0, targetWidth, targetHeight);
  } else {
    // Elegant fallback background if no image is uploaded
    const grad = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, targetWidth - 60, targetHeight - 60);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, targetWidth - 90, targetHeight - 90);
  }

  // Sort fields by z-index
  const sortedFields = [...fields].sort((a, b) => a.zIndex - b.zIndex);

  // 2. Render each field
  for (const field of sortedFields) {
    if (!field.visible) continue;

    const rawText = getFieldValue(field, dataRow);
    if (!rawText && !showFieldOutlines) continue;

    // Convert percentage to actual pixels
    const boxX = (field.x / 100) * targetWidth;
    const boxY = (field.y / 100) * targetHeight;
    const boxW = (field.width / 100) * targetWidth;
    const boxH = (field.height / 100) * targetHeight;

    // Draw field outline for editor mode if enabled
    if (showFieldOutlines) {
      ctx.save();
      const isSelected = field.id === selectedFieldId;
      ctx.strokeStyle = isSelected ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.setLineDash(isSelected ? [6, 4] : [4, 4]);
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Draw small label tag in editor
      if (isSelected) {
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(boxX, boxY - 20, Math.min(boxW, 140), 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(field.label.slice(0, 18), boxX + 6, boxY - 10);
      }
      ctx.restore();
    }

    if (!rawText) continue;

    ctx.save();

    // Clip to box if overflowBehavior is 'clip'
    if (field.overflowBehavior === 'clip') {
      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();
    }

    let currentFontSize = field.fontSize;
    const fontStyleStr = field.fontStyle === 'italic' ? 'italic ' : '';
    const fontWeightStr = `${field.fontWeight} `;
    ctx.font = `${fontStyleStr}${fontWeightStr}${currentFontSize}px "${field.fontFamily}", system-ui, sans-serif`;

    // Handle 'shrink' overflow behavior
    if (field.overflowBehavior === 'shrink') {
      let measuredWidth = ctx.measureText(rawText).width;
      const minFontSize = 10;
      while (measuredWidth > boxW && currentFontSize > minFontSize) {
        currentFontSize -= 1;
        ctx.font = `${fontStyleStr}${fontWeightStr}${currentFontSize}px "${field.fontFamily}", system-ui, sans-serif`;
        measuredWidth = ctx.measureText(rawText).width;
      }
    }

    ctx.fillStyle = field.textColor;
    ctx.textAlign = field.textAlign;

    // Multi-line wrapping
    const lines = field.multiLine
      ? wrapText(ctx, rawText, boxW, field.wrapMode)
      : [rawText];

    const lineHeightPx = currentFontSize * (field.lineHeight || 1.2);
    const totalTextHeight = lines.length * lineHeightPx;

    // Calculate anchor X
    let anchorX = boxX;
    if (field.textAlign === 'center') {
      anchorX = boxX + boxW / 2;
    } else if (field.textAlign === 'right') {
      anchorX = boxX + boxW;
    }

    // Calculate starting Y based on vertical alignment
    let startY = boxY + currentFontSize;
    if (field.verticalAlign === 'middle') {
      startY = boxY + (boxH - totalTextHeight) / 2 + currentFontSize * 0.85;
    } else if (field.verticalAlign === 'bottom') {
      startY = boxY + boxH - totalTextHeight + currentFontSize * 0.85;
    }

    // Draw each line
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      const lineY = startY + i * lineHeightPx;

      drawTextWithLetterSpacing(
        ctx,
        lineText,
        anchorX,
        lineY,
        field.letterSpacing,
        field.textAlign
      );

      // Text decoration underline
      if (field.textDecoration === 'underline') {
        const metrics = ctx.measureText(lineText);
        let lineStartX = anchorX;
        if (field.textAlign === 'center') {
          lineStartX = anchorX - metrics.width / 2;
        } else if (field.textAlign === 'right') {
          lineStartX = anchorX - metrics.width;
        }
        ctx.lineWidth = Math.max(1, currentFontSize / 16);
        ctx.strokeStyle = field.textColor;
        ctx.beginPath();
        ctx.moveTo(lineStartX, lineY + 4);
        ctx.lineTo(lineStartX + metrics.width, lineY + 4);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Exports a canvas or OffscreenCanvas to a Blob (PNG or JPEG)
 */
export async function exportCanvasToBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 0.95
): Promise<Blob> {
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

  if ('convertToBlob' in canvas) {
    // OffscreenCanvas
    return await (canvas as OffscreenCanvas).convertToBlob({
      type: mimeType,
      quality: format === 'jpeg' ? quality : undefined,
    });
  }

  return new Promise((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas export failed'));
      },
      mimeType,
      quality
    );
  });
}
