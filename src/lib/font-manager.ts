import { db } from './db';
import { CustomFont } from './types';

/**
 * Loads a font blob into document.fonts via the FontFace API
 */
export async function loadFontIntoDocument(font: CustomFont): Promise<void> {
  try {
    const arrayBuffer = await font.blob.arrayBuffer();
    const fontFace = new FontFace(font.name, arrayBuffer, {
      style: font.style,
      weight: String(font.weight),
    });
    const loadedFace = await fontFace.load();
    document.fonts.add(loadedFace);
  } catch (err) {
    console.error(`Failed to register font ${font.name}:`, err);
  }
}

/**
 * Reads a user-uploaded font File, registers it, and persists it to IndexedDB
 */
export async function registerCustomFontFile(file: File): Promise<CustomFont> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'ttf';
  const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  const font: CustomFont = {
    id: `font-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: rawName,
    style: file.name.toLowerCase().includes('italic') ? 'italic' : 'normal',
    weight: file.name.toLowerCase().includes('bold') ? 700 : 400,
    blob: file,
    format: extension,
    addedAt: new Date().toISOString(),
  };

  // 1. Register with document.fonts
  if (typeof window !== 'undefined' && 'fonts' in document) {
    await loadFontIntoDocument(font);
  }

  // 2. Persist in IndexedDB
  await db.fonts.put(font);

  return font;
}

/**
 * Restores all custom fonts from IndexedDB into document.fonts on app load
 */
export async function initCustomFontsFromDb(): Promise<CustomFont[]> {
  try {
    const storedFonts = await db.fonts.toArray();
    if (typeof window !== 'undefined' && 'fonts' in document) {
      for (const font of storedFonts) {
        await loadFontIntoDocument(font);
      }
    }
    return storedFonts;
  } catch (err) {
    console.error('Failed to load stored fonts from IndexedDB:', err);
    return [];
  }
}

/**
 * Removes a custom font from IndexedDB
 */
export async function removeCustomFontFromDb(fontId: string): Promise<void> {
  await db.fonts.delete(fontId);
}
