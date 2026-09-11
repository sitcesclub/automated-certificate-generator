'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { renderCertificate, exportCanvasToBlob } from '@/lib/canvas-renderer';
import { generateCertificateFileName } from '@/lib/filename-generator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Eye,
  Download,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { SpreadsheetRow } from '@/lib/types';

export function TestPreviewView() {
  const {
    fields,
    backgroundImage,
    backgroundMeta,
    spreadsheetRows,
    columnMapping,
    excludedRowIndices,
    outputSettings,
    setActiveTab,
  } = useAppStore();

  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const urlRef = useRef<string | null>(null);

  // Memoize available valid rows
  const validRows = React.useMemo(() => {
    return spreadsheetRows.filter((_, idx) => !excludedRowIndices.includes(idx));
  }, [spreadsheetRows, excludedRowIndices]);

  // Guard activePreviewIndex
  useEffect(() => {
    if (validRows.length > 0 && activePreviewIndex >= validRows.length) {
      setActivePreviewIndex(0);
    }
  }, [validRows.length, activePreviewIndex]);

  // Selected row data
  const activeRowData = validRows[activePreviewIndex];

  // If no rows imported yet, use a mock sample row from default field values
  const sampleRow: SpreadsheetRow = React.useMemo(() => {
    if (activeRowData) {
      const mapped: SpreadsheetRow = { ...activeRowData };
      for (const [key, col] of Object.entries(columnMapping)) {
        if (col && activeRowData[col] !== undefined) {
          mapped[key] = activeRowData[col];
        }
      }
      return mapped;
    }

    // Default sample row
    const mock: SpreadsheetRow = {};
    fields.forEach((f) => {
      mock[f.fieldKey] = f.defaultValue || f.label;
    });
    return mock;
  }, [activeRowData, columnMapping, fields]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  // Render certificate preview with cancellation guard
  useEffect(() => {
    let isCancelled = false;
    setIsRendering(true);

    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;

    const targetWidth = backgroundMeta?.width || 1920;
    const targetHeight = backgroundMeta?.height || 1080;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const finishRender = (imageElement: HTMLImageElement | null) => {
      if (isCancelled) return;

      renderCertificate({
        canvas,
        backgroundImage: imageElement,
        backgroundMeta,
        fields,
        dataRow: sampleRow,
        scale: 1.0,
        showFieldOutlines: false,
      });

      canvas.toBlob(
        (blob) => {
          if (isCancelled) return;
          if (blob) {
            if (urlRef.current) {
              URL.revokeObjectURL(urlRef.current);
            }
            const newUrl = URL.createObjectURL(blob);
            urlRef.current = newUrl;
            setRenderedImageUrl(newUrl);
          }
          setIsRendering(false);
        },
        outputSettings.format === 'jpeg' ? 'image/jpeg' : 'image/png',
        outputSettings.quality
      );
    };

    img.onload = () => finishRender(img);
    img.onerror = () => finishRender(null);
    img.src = backgroundImage || '/samples/ces_default_certificate.png';

    return () => {
      isCancelled = true;
    };
  }, [
    sampleRow,
    fields,
    outputSettings.format,
    outputSettings.quality,
    backgroundImage,
    backgroundMeta,
  ]);

  // Download single test certificate
  const handleDownloadSingle = async () => {
    if (!canvasRef.current) return;
    const blob = await exportCanvasToBlob(canvasRef.current, outputSettings.format, outputSettings.quality);
    const filename = generateCertificateFileName(
      outputSettings.filenamePattern,
      sampleRow,
      activePreviewIndex,
      outputSettings.format
    );
    saveAs(blob, filename);
  };

  const recipientName =
    sampleRow['recipient_name'] ||
    sampleRow['name'] ||
    sampleRow['Name'] ||
    'Sample Recipient';

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-[#f1f3f7]">
      {/* Breadcrumb matching console reference */}
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#6e7482]">
        <span>CES / PIPELINE / TEST PREVIEW &amp; WYSIWYG VALIDATION</span>
        <span>STAGE 03 OF 04</span>
      </div>

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0c0d12] border border-[#1e222b]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-sm text-white">TEST CERTIFICATE PREVIEW</span>
            <Badge variant="outline" className="text-blue-400 border-blue-500/30 font-mono text-[10px]">
              HIGH-FIDELITY RENDER
            </Badge>
          </div>
          <p className="text-xs text-[#7d8594] mt-1">
            Review exactly how the generated certificates will look with actual data values before starting bulk generation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-[#222631] bg-[#12141a] text-[#d1d5db] hover:bg-[#161922] font-mono"
            onClick={() => setActiveTab('editor')}
          >
            <Sliders className="h-3.5 w-3.5" />
            Tweak Design
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-blue-600/40 text-blue-400 hover:bg-blue-600/10 font-mono"
            onClick={handleDownloadSingle}
            disabled={isRendering || !renderedImageUrl}
          >
            <Download className="h-3.5 w-3.5" />
            Download Sample ({outputSettings.format.toUpperCase()})
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8 text-xs bg-blue-600 hover:bg-blue-500 gap-1.5 font-mono text-white"
            onClick={() => setActiveTab('generate')}
          >
            <span>Bulk Generation</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Certificate Render Viewer */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-[#1e222b] bg-[#0f1116] overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#1e222b] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-[#a1a7b5] flex items-center space-x-2">
                  <span>CERTIFICATE PREVIEW:</span>
                  <span className="text-[#38bdf8]">{recipientName}</span>
                </CardTitle>
                <CardDescription className="text-xs text-[#7d8594] font-mono">
                  Rendered at full resolution ({backgroundMeta?.width || 1920}×{backgroundMeta?.height || 1080}px)
                </CardDescription>
              </div>

              {/* Row navigation */}
              {validRows.length > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 border-[#222631] bg-[#12141a] text-[#d1d5db] hover:bg-[#161922]"
                    onClick={() => setActivePreviewIndex((i) => Math.max(0, i - 1))}
                    disabled={activePreviewIndex === 0}
                    title="Previous Recipient"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-mono text-[#a1a7b5]">
                    {activePreviewIndex + 1} / {validRows.length}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 border-[#222631] bg-[#12141a] text-[#d1d5db] hover:bg-[#161922]"
                    onClick={() => setActivePreviewIndex((i) => Math.min(validRows.length - 1, i + 1))}
                    disabled={activePreviewIndex >= validRows.length - 1}
                    title="Next Recipient"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-4 sm:p-6 bg-[#090a0d] flex items-center justify-center min-h-[420px] canvas-checkerboard">
              {isRendering ? (
                <div className="flex flex-col items-center space-y-2 text-[#7d8594]">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="text-xs font-mono">Rendering certificate with custom fonts...</span>
                </div>
              ) : renderedImageUrl ? (
                <div className="relative max-w-full rounded-lg shadow-2xl overflow-hidden border border-[#1e222b]">
                  <img
                    src={renderedImageUrl}
                    alt="Certificate Test Preview"
                    className="max-h-[560px] w-auto object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-xs text-[#7d8594] font-mono">Preparing preview...</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Info: Substituted Field Values */}
        <div className="space-y-4">
          <Card className="border-[#1e222b] bg-[#0f1116]">
            <CardHeader className="pb-3 border-b border-[#1e222b]">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-[#a1a7b5]">VALUES SUBSTITUTED</CardTitle>
              <CardDescription className="text-xs text-[#7d8594] font-mono">
                Live mapping for recipient #{activePreviewIndex + 1}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs pt-4">
              {fields.map((field) => {
                const mappedCol = columnMapping[field.fieldKey];
                const value = sampleRow[field.fieldKey] || sampleRow[field.label] || field.defaultValue;

                return (
                  <div
                    key={field.id}
                    className="p-2.5 rounded bg-[#12141a] border border-[#1e222b] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[#7d8594] text-[11px]">
                      <span className="font-semibold text-white">{field.label}</span>
                      <span className="font-mono text-[10px] text-blue-400">
                        {mappedCol ? `col: ${mappedCol}` : 'fallback'}
                      </span>
                    </div>
                    <div className="font-medium font-mono text-[#f1f3f7] truncate" title={String(value)}>
                      {String(value) || <span className="text-[#6e7482] italic font-sans">none</span>}
                    </div>
                    <div className="text-[10px] text-[#6e7482] font-mono">
                      Font: {field.fontFamily}, {field.fontSize}px, {field.textAlign}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
