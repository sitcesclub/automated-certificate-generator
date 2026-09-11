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
    <div className="flex h-full flex-col border-r border-[#1e222b] bg-[#0c0d12] text-xs text-[#a1a7b5]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e222b] p-3">
        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4 text-blue-400" />
          <span className="font-semibold text-[#f1f3f7]">Dynamic Fields</span>
          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 border-[#232732]">
            {fields.length}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-[11px] gap-1 border-[#262c38] text-blue-400 hover:bg-[#172554]/30"
          onClick={() => addField()}
        >
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>

      {/* Field Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sortedFields.length === 0 ? (
          <div className="p-4 text-center text-[#555c6b]">
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
                    ? 'border-blue-500/60 bg-[#172554]/30 text-white shadow-sm'
                    : 'border-[#1e222b] bg-[#12141a] hover:border-[#2d3342] hover:bg-[#161922] text-[#c9ced9]'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0 border border-[#262c38]"
                    style={{ backgroundColor: field.textColor }}
                    title={`Color: ${field.textColor}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="font-medium text-xs truncate text-[#f1f3f7]">{field.label}</span>
                      {field.required && (
                        <span className="text-[#f87171] text-[10px]" title="Required field">
                          *
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-[#7d8594] truncate">
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
                    className="p-1 rounded text-[#7d8594] hover:text-white hover:bg-[#161922]"
                    title={field.visible ? 'Hide' : 'Show'}
                  >
                    {field.visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-[#6e7482]" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLockField(field.id);
                    }}
                    className="p-1 rounded text-[#7d8594] hover:text-white hover:bg-[#161922]"
                    title={field.locked ? 'Unlock' : 'Lock'}
                  >
                    {field.locked ? (
                      <Lock className="h-3 w-3 text-amber-400" />
                    ) : (
                      <Unlock className="h-3 w-3 text-[#6e7482] hover:text-[#a1a7b5]" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateField(field.id);
                    }}
                    className="p-1 rounded text-[#7d8594] hover:text-white hover:bg-[#161922] hidden group-hover:block"
                    title="Duplicate"
                  >
                    <Copy className="h-3 w-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteField(field.id);
                    }}
                    className="p-1 rounded text-[#7d8594] hover:text-[#f87171] hover:bg-[#240e13] hidden group-hover:block"
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
        <div className="p-2 border-t border-[#1e222b] bg-[#0c0d12] flex items-center justify-between text-[11px] text-[#7d8594]">
          <span className="font-mono text-[10px] uppercase">Layer:</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => bringToFront(selectedFieldId)}
              className="px-2 py-1 rounded bg-[#13151c] hover:bg-[#1a1d26] border border-[#222631] hover:text-white flex items-center gap-1 cursor-pointer text-[#a1a7b5]"
              title="Bring selected to front"
            >
              <ChevronUp className="h-3 w-3" /> Front
            </button>
            <button
              onClick={() => sendToBack(selectedFieldId)}
              className="px-2 py-1 rounded bg-[#13151c] hover:bg-[#1a1d26] border border-[#222631] hover:text-white flex items-center gap-1 cursor-pointer text-[#a1a7b5]"
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
