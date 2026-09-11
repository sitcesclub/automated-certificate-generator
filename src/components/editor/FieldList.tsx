'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Type,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
} from 'lucide-react';

export function FieldList() {
  const {
    fields,
    selectedFieldId,
    setSelectedFieldId,
    addField,
    deleteField,
    duplicateField,
    toggleLockField,
    toggleVisibilityField,
    bringToFront,
    sendToBack,
  } = useAppStore();

  // Sorted by zIndex descending (top layer first)
  const sortedFields = [...fields].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex h-full flex-col border-r border-slate-800 bg-slate-950/60 text-xs text-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 p-3">
        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4 text-blue-400" />
          <span className="font-semibold text-slate-100">Dynamic Fields</span>
          <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
            {fields.length}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[11px] gap-1 border-blue-600/30 text-blue-400 hover:bg-blue-600/10"
          onClick={() => addField()}
        >
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>

      {/* Field Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sortedFields.length === 0 ? (
          <div className="p-4 text-center text-slate-500">
            No fields yet. Click "Add" above to create a text field.
          </div>
        ) : (
          sortedFields.map((field) => {
            const isSelected = field.id === selectedFieldId;

            return (
              <div
                key={field.id}
                onClick={() => setSelectedFieldId(field.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500/60 bg-blue-600/15 text-white shadow-sm'
                    : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0 border border-slate-600"
                    style={{ backgroundColor: field.textColor }}
                    title={`Color: ${field.textColor}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="font-medium text-xs truncate">{field.label}</span>
                      {field.required && (
                        <span className="text-red-400 text-[10px]" title="Required field">
                          *
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {field.fieldKey} • {field.fontFamily}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibilityField(field.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title={field.visible ? 'Hide' : 'Show'}
                  >
                    {field.visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-slate-600" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLockField(field.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title={field.locked ? 'Unlock' : 'Lock'}
                  >
                    {field.locked ? (
                      <Lock className="h-3 w-3 text-amber-400" />
                    ) : (
                      <Unlock className="h-3 w-3 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateField(field.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white hidden group-hover:block"
                    title="Duplicate"
                  >
                    <Copy className="h-3 w-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteField(field.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-red-400 hidden group-hover:block"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Layer order helpers */}
      {selectedFieldId && (
        <div className="p-2 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400">
          <span>Layer order:</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => bringToFront(selectedFieldId)}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 hover:text-white flex items-center gap-1 cursor-pointer"
              title="Bring selected to front"
            >
              <ChevronUp className="h-3 w-3" /> Front
            </button>
            <button
              onClick={() => sendToBack(selectedFieldId)}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 hover:text-white flex items-center gap-1 cursor-pointer"
              title="Send selected to back"
            >
              <ChevronDown className="h-3 w-3" /> Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
