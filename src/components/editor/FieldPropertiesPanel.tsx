'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { FontPicker } from './FontPicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ArrowUpToLine,
  ArrowDownToLine,
  Eye,
  EyeOff,
  Type,
  Palette,
  Layers,
  Move,
  CheckSquare,
  WrapText,
} from 'lucide-react';
import { TextAlign, VerticalAlign, TextTransform } from '@/lib/types';

const COLOR_PRESETS = [
  '#1a365d', // Deep Navy
  '#0f172a', // Slate 900 / Near Black
  '#2563eb', // Royal Blue
  '#b45309', // Classic Amber / Gold
  '#d97706', // Gold Accent
  '#047857', // Emerald Green
  '#b91c1c', // Deep Crimson
  '#4a5568', // Slate Gray
  '#ffffff', // Pure White
];

export function FieldPropertiesPanel() {
  const {
    fields,
    selectedFieldId,
    updateField,
    deleteField,
    duplicateField,
    bringToFront,
    sendToBack,
    toggleLockField,
    toggleVisibilityField,
  } = useAppStore();

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  if (!selectedField) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-500">
        <Type className="h-10 w-10 text-slate-700 mb-2" />
        <p className="text-sm font-medium text-slate-400">No field selected</p>
        <p className="text-xs mt-1 text-slate-600 max-w-[200px]">
          Click on any text box on the canvas or select a field from the left panel to configure its typography and position.
        </p>
      </div>
    );
  }

  const handleUpdate = (updates: Parameters<typeof updateField>[1]) => {
    updateField(selectedField.id, updates);
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5 text-xs text-slate-200">
      {/* Field Identification Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Badge variant="default" className="text-[10px] bg-blue-600/30 text-blue-400">
            {selectedField.zIndex}
          </Badge>
          <span className="font-semibold text-sm text-white truncate max-w-[140px]">
            {selectedField.label}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={() => toggleLockField(selectedField.id)}
            title={selectedField.locked ? 'Unlock field' : 'Lock field'}
          >
            {selectedField.locked ? (
              <Lock className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={() => toggleVisibilityField(selectedField.id)}
            title={selectedField.visible ? 'Hide field' : 'Show field'}
          >
            {selectedField.visible ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-slate-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={() => duplicateField(selectedField.id)}
            title="Duplicate field (Ctrl+D)"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-400 hover:bg-red-950 hover:text-red-300"
            onClick={() => deleteField(selectedField.id)}
            title="Delete field"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Field Label and Column Key */}
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-slate-400">Field Label (Display Name)</Label>
          <Input
            value={selectedField.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            className="mt-1 h-8 text-xs bg-slate-900 border-slate-700"
            placeholder="e.g. Recipient Name"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-400">Spreadsheet Mapping Key</Label>
            <span className="text-[10px] text-slate-500 font-mono">column key</span>
          </div>
          <Input
            value={selectedField.fieldKey}
            onChange={(e) => handleUpdate({ fieldKey: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
            className="mt-1 h-8 text-xs font-mono bg-slate-900 border-slate-700 text-blue-300"
            placeholder="e.g. recipient_name"
          />
        </div>

        <div>
          <Label className="text-xs text-slate-400">Preview / Fallback Value</Label>
          <Input
            value={selectedField.defaultValue}
            onChange={(e) => handleUpdate({ defaultValue: e.target.value })}
            className="mt-1 h-8 text-xs bg-slate-900 border-slate-700"
            placeholder="Preview text..."
          />
        </div>
      </div>

      {/* Typography Section */}
      <div className="space-y-4 border-t border-slate-800 pt-4">
        <div className="font-semibold text-xs text-white flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-blue-400" />
          Typography
        </div>

        {/* Font Family */}
        <FontPicker
          value={selectedField.fontFamily}
          onChange={(fontFamily) => handleUpdate({ fontFamily })}
        />

        {/* Font Size */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <Label className="text-xs text-slate-400">Font Size (px)</Label>
            <span className="font-mono text-xs text-blue-400">{selectedField.fontSize}px</span>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              value={[selectedField.fontSize]}
              min={10}
              max={150}
              step={1}
              onValueChange={([val]) => handleUpdate({ fontSize: val })}
              className="flex-1"
            />
            <Input
              type="number"
              value={selectedField.fontSize}
              onChange={(e) => handleUpdate({ fontSize: Number(e.target.value) || 12 })}
              className="w-16 h-7 text-xs text-center bg-slate-900"
            />
          </div>
        </div>

        {/* Font Weight and Style */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-slate-400">Weight</Label>
            <select
              value={selectedField.fontWeight}
              onChange={(e) => handleUpdate({ fontWeight: Number(e.target.value) })}
              className="mt-1 h-8 w-full rounded border border-slate-700 bg-slate-900 px-2 text-xs text-slate-200"
            >
              <option value={300}>300 - Light</option>
              <option value={400}>400 - Normal</option>
              <option value={500}>500 - Medium</option>
              <option value={600}>600 - SemiBold</option>
              <option value={700}>700 - Bold</option>
              <option value={800}>800 - ExtraBold</option>
              <option value={900}>900 - Black</option>
            </select>
          </div>

          <div>
            <Label className="text-xs text-slate-400">Transform</Label>
            <select
              value={selectedField.textTransform}
              onChange={(e) => handleUpdate({ textTransform: e.target.value as TextTransform })}
              className="mt-1 h-8 w-full rounded border border-slate-700 bg-slate-900 px-2 text-xs text-slate-200"
            >
              <option value="none">Normal</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="lowercase">lowercase</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </div>
        </div>

        {/* Alignment & Style Buttons */}
        <div className="flex items-center justify-between bg-slate-950 p-1 rounded-lg border border-slate-800">
          {/* Horizontal align */}
          <div className="flex items-center space-x-0.5">
            {(['left', 'center', 'right'] as TextAlign[]).map((align) => (
              <Button
                key={align}
                variant="ghost"
                size="icon"
                className={`h-7 w-7 ${
                  selectedField.textAlign === align ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
                onClick={() => handleUpdate({ textAlign: align })}
                title={`Align ${align}`}
              >
                {align === 'left' && <AlignLeft className="h-3.5 w-3.5" />}
                {align === 'center' && <AlignCenter className="h-3.5 w-3.5" />}
                {align === 'right' && <AlignRight className="h-3.5 w-3.5" />}
              </Button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Vertical align */}
          <div className="flex items-center space-x-0.5">
            {(['top', 'middle', 'bottom'] as VerticalAlign[]).map((valign) => (
              <Button
                key={valign}
                variant="ghost"
                size="sm"
                className={`h-7 px-1.5 text-[10px] ${
                  selectedField.verticalAlign === valign ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
                onClick={() => handleUpdate({ verticalAlign: valign })}
                title={`Vertical align ${valign}`}
              >
                {valign.toUpperCase()}
              </Button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Italic & Underline */}
          <div className="flex items-center space-x-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${
                selectedField.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
              onClick={() =>
                handleUpdate({ fontStyle: selectedField.fontStyle === 'italic' ? 'normal' : 'italic' })
              }
              title="Italic"
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${
                selectedField.textDecoration === 'underline' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
              onClick={() =>
                handleUpdate({
                  textDecoration: selectedField.textDecoration === 'underline' ? 'none' : 'underline',
                })
              }
              title="Underline"
            >
              <Underline className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Text Color */}
        <div>
          <Label className="text-xs text-slate-400 mb-1.5 block">Text Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedField.textColor}
              onChange={(e) => handleUpdate({ textColor: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded border border-slate-700 bg-transparent p-0"
            />
            <Input
              value={selectedField.textColor}
              onChange={(e) => handleUpdate({ textColor: e.target.value })}
              className="h-8 flex-1 font-mono text-xs uppercase bg-slate-900 border-slate-700"
            />
          </div>
          {/* Quick Palette */}
          <div className="flex items-center gap-1.5 mt-2">
            {COLOR_PRESETS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => handleUpdate({ textColor: hex })}
                className="h-5 w-5 rounded-full border border-slate-700 transition-transform hover:scale-110 cursor-pointer"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>

        {/* Spacing & Line Height */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Letter Spacing</span>
              <span>{selectedField.letterSpacing}px</span>
            </div>
            <Slider
              value={[selectedField.letterSpacing]}
              min={-2}
              max={15}
              step={0.5}
              onValueChange={([val]) => handleUpdate({ letterSpacing: val })}
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Line Height</span>
              <span>{selectedField.lineHeight}x</span>
            </div>
            <Slider
              value={[selectedField.lineHeight]}
              min={0.8}
              max={2.5}
              step={0.1}
              onValueChange={([val]) => handleUpdate({ lineHeight: val })}
            />
          </div>
        </div>
      </div>

      {/* Multi-line and Overflow Behavior */}
      <div className="space-y-3 border-t border-slate-800 pt-4">
        <div className="font-semibold text-xs text-white flex items-center gap-1.5">
          <WrapText className="h-3.5 w-3.5 text-blue-400" />
          Text Wrapping & Overflow
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
          <div>
            <div className="font-medium text-xs text-slate-200">Multi-line Mode</div>
            <div className="text-[10px] text-slate-500">Allow long descriptions or statements to wrap</div>
          </div>
          <button
            type="button"
            onClick={() => handleUpdate({ multiLine: !selectedField.multiLine })}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
              selectedField.multiLine ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {selectedField.multiLine ? 'Enabled' : 'Single-line'}
          </button>
        </div>

        {selectedField.multiLine && (
          <div>
            <Label className="text-xs text-slate-400">Wrapping Strategy</Label>
            <select
              value={selectedField.wrapMode}
              onChange={(e) => handleUpdate({ wrapMode: e.target.value as any })}
              className="mt-1 h-8 w-full rounded border border-slate-700 bg-slate-900 px-2 text-xs text-slate-200"
            >
              <option value="word">Word Wrap (Standard)</option>
              <option value="char">Break Any Character</option>
              <option value="none">No Wrap</option>
            </select>
          </div>
        )}

        <div>
          <Label className="text-xs text-slate-400">Overflow Behavior</Label>
          <select
            value={selectedField.overflowBehavior}
            onChange={(e) => handleUpdate({ overflowBehavior: e.target.value as any })}
            className="mt-1 h-8 w-full rounded border border-slate-700 bg-slate-900 px-2 text-xs text-slate-200"
          >
            <option value="shrink">Auto-Shrink Font (Best for long names)</option>
            <option value="clip">Clip Text at Boundaries</option>
            <option value="visible">Allow Overflow Outside Box</option>
          </select>
        </div>
      </div>

      {/* Position & Size Precision */}
      <div className="space-y-3 border-t border-slate-800 pt-4">
        <div className="font-semibold text-xs text-white flex items-center gap-1.5">
          <Move className="h-3.5 w-3.5 text-blue-400" />
          Precise Position & Size (% of certificate)
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-slate-400">X Position (%)</Label>
            <Input
              type="number"
              step="0.5"
              value={Math.round(selectedField.x * 10) / 10}
              onChange={(e) => handleUpdate({ x: Number(e.target.value) || 0 })}
              className="mt-1 h-7 text-xs bg-slate-900"
            />
          </div>
          <div>
            <Label className="text-[10px] text-slate-400">Y Position (%)</Label>
            <Input
              type="number"
              step="0.5"
              value={Math.round(selectedField.y * 10) / 10}
              onChange={(e) => handleUpdate({ y: Number(e.target.value) || 0 })}
              className="mt-1 h-7 text-xs bg-slate-900"
            />
          </div>
          <div>
            <Label className="text-[10px] text-slate-400">Width (%)</Label>
            <Input
              type="number"
              step="0.5"
              value={Math.round(selectedField.width * 10) / 10}
              onChange={(e) => handleUpdate({ width: Number(e.target.value) || 10 })}
              className="mt-1 h-7 text-xs bg-slate-900"
            />
          </div>
          <div>
            <Label className="text-[10px] text-slate-400">Height (%)</Label>
            <Input
              type="number"
              step="0.5"
              value={Math.round(selectedField.height * 10) / 10}
              onChange={(e) => handleUpdate({ height: Number(e.target.value) || 5 })}
              className="mt-1 h-7 text-xs bg-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Layering & Options */}
      <div className="space-y-3 border-t border-slate-800 pt-4 pb-6">
        <div className="font-semibold text-xs text-white flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-blue-400" />
          Layering & Validation Rules
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs gap-1"
            onClick={() => bringToFront(selectedField.id)}
          >
            <ArrowUpToLine className="h-3.5 w-3.5" />
            Bring to Front
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs gap-1"
            onClick={() => sendToBack(selectedField.id)}
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            Send to Back
          </Button>
        </div>

        <label className="flex items-center space-x-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={selectedField.required}
            onChange={(e) => handleUpdate({ required: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
          />
          <span className="text-xs text-slate-300">Required field (cannot be empty in spreadsheet)</span>
        </label>
      </div>
    </div>
  );
}
