'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { CertificateField } from '@/lib/types';
import { applyTextTransform } from '@/lib/canvas-renderer';

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export function EditorCanvas() {
  const {
    backgroundImage,
    backgroundMeta,
    fields,
    selectedFieldId,
    setSelectedFieldId,
    updateField,
    deleteField,
    duplicateField,
    undo,
    redo,
    zoom,
    snapToGuides,
  } = useAppStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasBoardRef = useRef<HTMLDivElement>(null);

  // Interaction State
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialFieldState, setInitialFieldState] = useState<CertificateField | null>(null);
  const [activeSnapGuideX, setActiveSnapGuideX] = useState<number | null>(null);
  const [activeSnapGuideY, setActiveSnapGuideY] = useState<number | null>(null);

  const targetWidth = backgroundMeta?.width || 1920;
  const targetHeight = backgroundMeta?.height || 1080;
  const aspectRatio = targetWidth / targetHeight;

  // Selected Field
  const selectedField = fields.find((f) => f.id === selectedFieldId);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      if (selectedFieldId && selectedField && !selectedField.locked) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
          e.preventDefault();
          duplicateField(selectedFieldId);
          return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          deleteField(selectedFieldId);
          return;
        }

        const delta = e.shiftKey ? 2.0 : 0.5;
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          updateField(selectedFieldId, { x: Math.max(0, selectedField.x - delta) });
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          updateField(selectedFieldId, { x: Math.min(100 - selectedField.width, selectedField.x + delta) });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          updateField(selectedFieldId, { y: Math.max(0, selectedField.y - delta) });
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          updateField(selectedFieldId, { y: Math.min(100 - selectedField.height, selectedField.y + delta) });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFieldId, selectedField, deleteField, duplicateField, updateField, undo, redo]);

  // Pointer Down to start Dragging a Field
  const handleFieldPointerDown = (e: React.PointerEvent, field: CertificateField) => {
    if (field.locked) {
      setSelectedFieldId(field.id);
      return;
    }
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    setSelectedFieldId(field.id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialFieldState({ ...field });
  };

  // Pointer Down on Resize Handle
  const handleResizePointerDown = (e: React.PointerEvent, handle: ResizeHandle) => {
    if (!selectedField || selectedField.locked) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    setIsResizing(true);
    setActiveHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialFieldState({ ...selectedField });
  };

  // Pointer Move (Drag or Resize)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canvasBoardRef.current || !dragStart || !initialFieldState) return;

    const boardRect = canvasBoardRef.current.getBoundingClientRect();
    const deltaXPx = e.clientX - dragStart.x;
    const deltaYPx = e.clientY - dragStart.y;

    // Convert pixel deltas to percentage
    const deltaX = (deltaXPx / boardRect.width) * 100;
    const deltaY = (deltaYPx / boardRect.height) * 100;

    if (isDragging) {
      let newX = initialFieldState.x + deltaX;
      let newY = initialFieldState.y + deltaY;

      // Bound within canvas (0 - 100)
      newX = Math.max(0, Math.min(100 - initialFieldState.width, newX));
      newY = Math.max(0, Math.min(100 - initialFieldState.height, newY));

      // Snap-to-center guide checks
      if (snapToGuides) {
        const centerX = newX + initialFieldState.width / 2;
        if (Math.abs(centerX - 50) < 1.5) {
          newX = 50 - initialFieldState.width / 2;
          setActiveSnapGuideX(50);
        } else {
          setActiveSnapGuideX(null);
        }

        const centerY = newY + initialFieldState.height / 2;
        if (Math.abs(centerY - 50) < 1.5) {
          newY = 50 - initialFieldState.height / 2;
          setActiveSnapGuideY(50);
        } else {
          setActiveSnapGuideY(null);
        }
      }

      updateField(initialFieldState.id, { x: newX, y: newY });
    } else if (isResizing && activeHandle) {
      let { x, y, width, height } = initialFieldState;

      if (activeHandle.includes('e')) {
        width = Math.max(5, initialFieldState.width + deltaX);
      }
      if (activeHandle.includes('w')) {
        const potentialWidth = initialFieldState.width - deltaX;
        if (potentialWidth >= 5) {
          width = potentialWidth;
          x = initialFieldState.x + deltaX;
        }
      }
      if (activeHandle.includes('s')) {
        height = Math.max(2, initialFieldState.height + deltaY);
      }
      if (activeHandle.includes('n')) {
        const potentialHeight = initialFieldState.height - deltaY;
        if (potentialHeight >= 2) {
          height = potentialHeight;
          y = initialFieldState.y + deltaY;
        }
      }

      updateField(initialFieldState.id, { x, y, width, height });
    }
  };

  // Pointer Up (End Drag/Resize)
  const handlePointerUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setActiveHandle(null);
    setDragStart(null);
    setInitialFieldState(null);
    setActiveSnapGuideX(null);
    setActiveSnapGuideY(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-auto bg-[#090a0d] canvas-checkerboard p-4 sm:p-8 flex items-center justify-center select-none"
      onClick={() => setSelectedFieldId(null)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Certificate Board with native aspect ratio */}
      <div
        ref={canvasBoardRef}
        className="relative bg-white shadow-2xl transition-transform duration-75 origin-center overflow-hidden"
        style={{
          width: `min(90vw, ${1000 * zoom}px)`,
          aspectRatio: `${aspectRatio}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Certificate Background Image or Fallback */}
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt="Certificate Background"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <img
            src="/samples/ces_default_certificate.png"
            alt="Default Certificate Template"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        )}

        {/* Snap-to-center Guide Lines */}
        {activeSnapGuideX !== null && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-40 border-l border-dashed border-red-500"
            style={{ left: `${activeSnapGuideX}%` }}
          />
        )}
        {activeSnapGuideY !== null && (
          <div
            className="pointer-events-none absolute left-0 right-0 z-40 border-t border-dashed border-red-500"
            style={{ top: `${activeSnapGuideY}%` }}
          />
        )}

        {/* Dynamic Fields Overlays */}
        {fields.map((field) => {
          if (!field.visible) return null;
          const isSelected = field.id === selectedFieldId;
          const displayText = applyTextTransform(field.defaultValue || field.label, field.textTransform);

          // Scaled font size relative to board width for exact WYSIWYG
          const boardW = canvasBoardRef.current?.clientWidth || 1000;
          const fontScaleRatio = boardW / targetWidth;
          const previewFontSize = Math.max(8, field.fontSize * fontScaleRatio);

          return (
            <div
              key={field.id}
              onPointerDown={(e) => handleFieldPointerDown(e, field)}
              className={`absolute flex cursor-move select-none transition-shadow ${
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-0 z-30'
                  : 'hover:ring-1 hover:ring-blue-400/60 z-20'
              } ${field.locked ? 'cursor-default' : ''}`}
              style={{
                left: `${field.x}%`,
                top: `${field.y}%`,
                width: `${field.width}%`,
                height: `${field.height}%`,
                zIndex: field.zIndex,
              }}
            >
              {/* Field Label Header Tag when selected */}
              {isSelected && (
                <div className="absolute -top-5 left-0 flex items-center space-x-1 bg-blue-600 px-1.5 py-0.5 rounded-t text-[10px] font-semibold text-white pointer-events-none z-40 shadow">
                  <span>{field.label}</span>
                  {field.locked && <span>🔒</span>}
                </div>
              )}

              {/* Text Render Container */}
              <div
                className="h-full w-full flex overflow-hidden"
                style={{
                  alignItems:
                    field.verticalAlign === 'top'
                      ? 'flex-start'
                      : field.verticalAlign === 'bottom'
                      ? 'flex-end'
                      : 'center',
                  justifyContent:
                    field.textAlign === 'left'
                      ? 'flex-start'
                      : field.textAlign === 'right'
                      ? 'flex-end'
                      : 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: `"${field.fontFamily}", system-ui, sans-serif`,
                    fontSize: `${previewFontSize}px`,
                    fontWeight: field.fontWeight,
                    fontStyle: field.fontStyle,
                    color: field.textColor,
                    textAlign: field.textAlign,
                    letterSpacing: `${field.letterSpacing * fontScaleRatio}px`,
                    lineHeight: field.lineHeight,
                    textDecoration: field.textDecoration,
                    whiteSpace: field.multiLine ? 'normal' : 'nowrap',
                    wordBreak: field.wrapMode === 'char' ? 'break-all' : 'normal',
                    width: '100%',
                  }}
                >
                  {displayText}
                </div>
              </div>

              {/* 8-Point Resize Handles when selected and not locked */}
              {isSelected && !field.locked && (
                <>
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'nw')}
                    className="absolute -top-1.5 -left-1.5 h-3 w-3 bg-white border-2 border-blue-600 rounded-sm cursor-nwse-resize z-40"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'n')}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 bg-white border-2 border-blue-600 rounded-sm cursor-ns-resize z-40"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
                    className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-white border-2 border-blue-600 rounded-sm cursor-nesw-resize z-40"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'e')}
                    className="absolute top-1/2 -translate-y-1/2 -right-1.5 h-3 w-3 bg-white border-2 border-blue-600 rounded-sm cursor-ew-resize z-40"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'se')}
                    className="absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-white border-2 border-blue-600 rounded-sm cursor-nwse-resize z-40"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 's')}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 bg-white border-2 border-blue-600 rounded-sm cursor-ns-resize z-40"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
                    className="absolute -bottom-1.5 -left-1.5 h-3 w-3 bg-white border-2 border-blue-600 rounded-sm cursor-nesw-resize z-40"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'w')}
                    className="absolute top-1/2 -translate-y-1/2 -left-1.5 h-3 w-3 bg-white border-2 border-blue-600 rounded-sm cursor-ew-resize z-40"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
