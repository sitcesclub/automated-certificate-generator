import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CertificateTemplate, CustomFont } from './types';
import { db } from './db';
import { loadFontIntoDocument } from './font-manager';

/**
 * Packages a template, its background image, and any referenced custom fonts
 * into a shareable .ces-template archive.
 */
export async function exportTemplatePackage(
  template: CertificateTemplate,
  customFonts: CustomFont[] = []
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Add template configuration JSON
  const templateConfig = {
    version: '1.0',
    id: template.id,
    name: template.name,
    description: template.description,
    createdAt: template.createdAt,
    updatedAt: new Date().toISOString(),
    backgroundMeta: template.backgroundMeta,
    fields: template.fields,
    outputSettings: template.outputSettings,
  };
  zip.file('template.json', JSON.stringify(templateConfig, null, 2));

  // 2. Add background image if available
  if (template.backgroundImageDataUrl) {
    const base64Data = template.backgroundImageDataUrl.split(',')[1];
    if (base64Data) {
      const ext = template.backgroundMeta?.format?.toLowerCase().includes('png') ? 'png' : 'jpg';
      zip.file(`background.${ext}`, base64Data, { base64: true });
    }
  }

  // 3. Add any custom fonts used by the template's fields
  const usedFontNames = new Set(template.fields.map((f) => f.fontFamily.toLowerCase()));
  const fontsToInclude = customFonts.filter((f) => usedFontNames.has(f.name.toLowerCase()));

  if (fontsToInclude.length > 0) {
    const fontsFolder = zip.folder('fonts');
    if (fontsFolder) {
      for (const font of fontsToInclude) {
        const buffer = await font.blob.arrayBuffer();
        fontsFolder.file(`${font.name}.${font.format}`, buffer);
      }
    }
  }

  // Generate zip blob
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return content;
}

/**
 * Downloads a template as a .ces-template file
 */
export async function downloadTemplatePackage(
  template: CertificateTemplate,
  customFonts: CustomFont[] = []
): Promise<void> {
  const blob = await exportTemplatePackage(template, customFonts);
  const cleanName = template.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  saveAs(blob, `${cleanName || 'Template'}.ces-template`);
}

/**
 * Imports a .ces-template archive and restores template, background, and fonts
 */
export async function importTemplatePackage(file: File): Promise<CertificateTemplate> {
  const zip = await JSZip.loadAsync(file);

  // 1. Read template.json
  const configFile = zip.file('template.json');
  if (!configFile) {
    throw new Error('Invalid .ces-template package: missing template.json');
  }

  const jsonText = await configFile.async('text');
  const parsed = JSON.parse(jsonText);

  // 2. Read background image
  let bgDataUrl: string | undefined = undefined;
  const bgFile = zip.file(/^background\.(png|jpg|jpeg)$/i)[0];
  if (bgFile) {
    const bgBase64 = await bgFile.async('base64');
    const ext = bgFile.name.split('.').pop()?.toLowerCase();
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    bgDataUrl = `data:${mime};base64,${bgBase64}`;
  }

  // 3. Read and register any custom fonts
  const fontFiles = zip.folder('fonts')?.file(/.+/i) || [];
  for (const fontFile of fontFiles) {
    try {
      const fontBuffer = await fontFile.async('arraybuffer');
      const ext = fontFile.name.split('.').pop()?.toLowerCase() || 'ttf';
      const fontName = fontFile.name.replace(/\.[^/.]+$/, '');
      const blob = new Blob([fontBuffer]);

      const customFont: CustomFont = {
        id: `font-imported-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: fontName,
        style: fontName.toLowerCase().includes('italic') ? 'italic' : 'normal',
        weight: fontName.toLowerCase().includes('bold') ? 700 : 400,
        blob,
        format: ext,
        addedAt: new Date().toISOString(),
      };

      await db.fonts.put(customFont);
      await loadFontIntoDocument(customFont);
    } catch (fontErr) {
      console.warn('Failed to extract/load font from template package:', fontErr);
    }
  }

  const reconstructedTemplate: CertificateTemplate = {
    id: parsed.id || `template-${Date.now()}`,
    name: parsed.name || 'Imported Template',
    description: parsed.description || '',
    createdAt: parsed.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    backgroundImageDataUrl: bgDataUrl,
    backgroundMeta: parsed.backgroundMeta || {
      width: 1920,
      height: 1080,
      format: 'png',
      name: 'background.png',
    },
    fields: parsed.fields || [],
    outputSettings: parsed.outputSettings || {
      format: 'png',
      quality: 0.95,
      filenamePattern: 'Certificate_{recipient_name}',
      zipFilename: 'Certificates',
    },
  };

  // Save imported template to IndexedDB
  await db.templates.put(reconstructedTemplate);

  return reconstructedTemplate;
}
