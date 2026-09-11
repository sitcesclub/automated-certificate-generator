'use client';

import React, { useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Undo2,
  Redo2,
  Plus,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Magnet,
  Sparkles,
  Trash2,
  Layers,
} from 'lucide-react';

export function EditorToolbar() {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    addField,
    setBackground,
    clearBackground,
    backgroundMeta,
    zoom,
    setZoom,
    snapToGuides,
    setSnapToGuides,
    fields,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid PNG or JPG image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setBackground(dataUrl, {
          width: img.naturalWidth || 1920,
          height: img.naturalHeight || 1080,
          format: file.type,
          name: file.name,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddPreset = (type: 'name' | 'event' | 'date' | 'id' | 'position') => {
    switch (type) {
      case 'name':
        addField({
          label: 'Recipient Name',
          fieldKey: 'recipient_name',
          defaultValue: 'Johnathan Doe',
          fontSize: 52,
          fontWeight: 700,
          fontFamily: 'Montserrat',
          textColor: '#1a365d',
          y: 44,
          height: 12,
          required: true,
        });
        break;
      case 'event':
        addField({
          label: 'Event Name',
          fieldKey: 'event_name',
          defaultValue: 'CodeCraft Hackathon 2026',
          fontSize: 28,
          fontWeight: 600,
          fontFamily: 'Roboto',
          textColor: '#2b6cb0',
          y: 56,
          height: 8,
          multiLine: true,
        });
        break;
      case 'date':
        addField({
          label: 'Date of Issue',
          fieldKey: 'date',
          defaultValue: 'September 11, 2026',
          fontSize: 18,
          fontWeight: 400,
          fontFamily: 'Inter',
          textColor: '#4a5568',
          y: 80,
          width: 25,
          height: 6,
        });
        break;
      case 'id':
        addField({
          label: 'Certificate ID',
          fieldKey: 'certificate_id',
          defaultValue: 'CES-CERT-2026-99',
          fontSize: 16,
          fontWeight: 600,
          fontFamily: 'Courier New',
          textColor: '#718096',
          y: 80,
          x: 65,
          width: 25,
          height: 6,
        });
        break;
      case 'position':
        addField({
          label: 'Position / Rank',
          fieldKey: 'position',
          defaultValue: '1st Place Winner',
          fontSize: 32,
          fontWeight: 700,
          fontFamily: 'Playfair Display',
          textColor: '#b45309',
          y: 65,
          height: 9,
        });
        break;
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-4 py-2 text-xs">
      {/* Left side: Upload background, add field, presets */}
      <div className="flex items-center space-x-2">
        {/* Upload Background Image */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleImageUpload}
        />
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-blue-600/40 text-blue-400 hover:bg-blue-600/10"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Upload Background</span>
        </Button>

        {backgroundMeta ? (
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            <span className="truncate max-w-[110px]">{backgroundMeta.name}</span>
            <Badge variant="secondary" className="text-[9px] py-0 px-1">
              {backgroundMeta.width}×{backgroundMeta.height}
            </Badge>
            <button
              onClick={clearBackground}
              className="text-slate-500 hover:text-red-400 ml-1 cursor-pointer"
              title="Remove background"
            >
              ×
            </button>
          </div>
        ) : (
          <Badge variant="secondary" className="text-[10px] text-slate-400 hidden sm:inline-flex">
            Using Default Background
          </Badge>
        )}

        <div className="h-4 w-px bg-slate-800 hidden sm:block" />

        {/* Add custom field */}
        <Button
          variant="default"
          size="sm"
          className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-500"
          onClick={() => addField()}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Text Field</span>
        </Button>

        {/* Quick Presets Dropdown */}
        <div className="hidden lg:flex items-center space-x-1 pl-1">
          <span className="text-[10px] text-slate-500 font-medium mr-1">Presets:</span>
          <button
            onClick={() => handleAddPreset('name')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
          >
            + Name
          </button>
          <button
            onClick={() => handleAddPreset('position')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300 cursor-pointer"
          >
            + Rank
          </button>
          <button
            onClick={() => handleAddPreset('event')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
          >
            + Event
          </button>
          <button
            onClick={() => handleAddPreset('date')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
          >
            + Date
          </button>
          <button
            onClick={() => handleAddPreset('id')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 cursor-pointer"
          >
            + Cert ID
          </button>
        </div>
      </div>

      {/* Right side: Undo/Redo, Snap, Zoom */}
      <div className="flex items-center space-x-2">
        {/* Undo / Redo */}
        <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={redo}
            disabled={!canRedo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Snap to guides toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 gap-1 text-[11px] ${
            snapToGuides ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500'
          }`}
          onClick={() => setSnapToGuides(!snapToGuides)}
          title="Toggle alignment snapping"
        >
          <Magnet className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Snap</span>
        </Button>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-slate-950 px-1.5 py-0.5 rounded-lg border border-slate-800">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))}
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="w-12 text-center font-mono text-[11px] text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white ml-0.5"
            onClick={() => setZoom(1.0)}
            title="Reset Zoom to 100%"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
