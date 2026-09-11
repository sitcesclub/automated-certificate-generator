'use client';

import React, { useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { SYSTEM_FONTS } from '@/lib/constants';
import { registerCustomFontFile, removeCustomFontFromDb } from '@/lib/font-manager';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Upload, Type, Trash2 } from 'lucide-react';

interface FontPickerProps {
  value: string;
  onChange: (fontName: string) => void;
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  const { customFonts, addCustomFont, removeCustomFont } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const font = await registerCustomFontFile(file);
      addCustomFont(font);
      onChange(font.name);
    } catch (err) {
      alert(`Failed to load font: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFont = async (fontId: string, fontName: string) => {
    if (confirm(`Remove custom font "${fontName}"?`)) {
      await removeCustomFontFromDb(fontId);
      removeCustomFont(fontId);
      if (value === fontName) {
        onChange('Montserrat');
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Type className="h-3.5 w-3.5 text-blue-400" />
          Font Family
        </Label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
        >
          <Upload className="h-3 w-3" />
          Upload Font (.ttf/.otf)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          className="hidden"
          onChange={handleFontUpload}
        />
      </div>

      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-xs"
      >
        <optgroup label="Bundled Certificate Fonts">
          {SYSTEM_FONTS.map((font) => (
            <option
              key={font.name}
              value={font.name}
              style={{ fontFamily: font.name }}
            >
              {font.name} ({font.category})
            </option>
          ))}
        </optgroup>

        {customFonts.length > 0 && (
          <optgroup label="Uploaded Custom Fonts">
            {customFonts.map((font) => (
              <option
                key={font.id}
                value={font.name}
                style={{ fontFamily: font.name }}
              >
                ★ {font.name} (Custom .{font.format})
              </option>
            ))}
          </optgroup>
        )}
      </Select>

      {/* List custom fonts with delete option if selected */}
      {customFonts.length > 0 && (
        <div className="text-[10px] text-slate-500 flex flex-wrap gap-1.5 pt-1">
          {customFonts.map((f) => (
            <span
              key={f.id}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
            >
              <span style={{ fontFamily: f.name }}>{f.name}</span>
              <button
                onClick={() => handleDeleteFont(f.id, f.name)}
                className="text-slate-500 hover:text-red-400"
                title="Delete font"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
