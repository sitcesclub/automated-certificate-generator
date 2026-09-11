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
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e222b] bg-[#0c0d12] px-4 py-2 text-xs">
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
          className="h-8 gap-1.5 border-[#282e3b] text-[#93c5fd] hover:bg-[#172554]/30 hover:border-blue-500/40"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Upload Background</span>
        </Button>

        {backgroundMeta ? (
          <div className="flex items-center space-x-1.5 text-[11px] text-[#7d8594] bg-[#12141a] px-2 py-1 rounded border border-[#1e222b]">
            <span className="truncate max-w-[110px]">{backgroundMeta.name}</span>
            <Badge variant="secondary" className="text-[9px] py-0 px-1 border-[#262c37]">
              {backgroundMeta.width}×{backgroundMeta.height}
            </Badge>
            <button
              onClick={clearBackground}
              className="text-[#646b7a] hover:text-red-400 ml-1 cursor-pointer"
              title="Remove background"
            >
              ×
            </button>
          </div>
        ) : (
          <Badge variant="secondary" className="text-[10px] text-[#7d8594] hidden sm:inline-flex border-[#222631]">
            Default (1920×1080)
          </Badge>
        )}

        <div className="h-4 w-px bg-[#1e222b] hidden sm:block" />

        {/* Add custom field */}
        <Button
          variant="default"
          size="sm"
          className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-500 shadow-sm"
          onClick={() => addField()}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Text Field</span>
        </Button>

        {/* Quick Presets Dropdown */}
        <div className="hidden lg:flex items-center space-x-1 pl-1">
          <span className="text-[10px] text-[#636a7a] font-medium mr-1 uppercase tracking-wider font-mono">Presets:</span>
          <button
            onClick={() => handleAddPreset('name')}
            className="px-2 py-1 rounded bg-[#13151c] hover:bg-[#1c1f2a] border border-[#222631] text-[10px] text-[#a1a7b5] cursor-pointer"
          >
            + Name
          </button>
          <button
            onClick={() => handleAddPreset('position')}
            className="px-2 py-1 rounded bg-[#13151c] hover:bg-[#1c1f2a] border border-[#222631] text-[10px] text-amber-300 cursor-pointer"
          >
            + Rank
          </button>
          <button
            onClick={() => handleAddPreset('event')}
            className="px-2 py-1 rounded bg-[#13151c] hover:bg-[#1c1f2a] border border-[#222631] text-[10px] text-[#a1a7b5] cursor-pointer"
          >
            + Event
          </button>
          <button
            onClick={() => handleAddPreset('date')}
            className="px-2 py-1 rounded bg-[#13151c] hover:bg-[#1c1f2a] border border-[#222631] text-[10px] text-[#a1a7b5] cursor-pointer"
          >
            + Date
          </button>
          <button
            onClick={() => handleAddPreset('id')}
            className="px-2 py-1 rounded bg-[#13151c] hover:bg-[#1c1f2a] border border-[#222631] text-[10px] text-[#a1a7b5] cursor-pointer"
          >
            + Cert ID
          </button>
        </div>
      </div>

      {/* Right side: Undo/Redo, Snap, Zoom */}
      <div className="flex items-center space-x-2">
        {/* Undo / Redo */}
        <div className="flex items-center space-x-1 bg-[#12141a] p-0.5 rounded-lg border border-[#1e222b]">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8e95a5] hover:text-white"
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8e95a5] hover:text-white"
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
          className={`h-8 gap-1 text-[11px] border ${
            snapToGuides ? 'bg-[#172554]/40 text-[#60a5fa] border-[#2563eb]/40' : 'text-[#646b7a] border-transparent'
          }`}
          onClick={() => setSnapToGuides(!snapToGuides)}
          title="Toggle alignment snapping"
        >
          <Magnet className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Snap</span>
        </Button>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-[#12141a] px-1.5 py-0.5 rounded-lg border border-[#1e222b]">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8e95a5] hover:text-white"
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))}
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="w-12 text-center font-mono text-[11px] text-[#e2e5eb]">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8e95a5] hover:text-white"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8e95a5] hover:text-white ml-0.5"
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
