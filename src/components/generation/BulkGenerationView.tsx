'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { generateCertificatesBatch, downloadCertificatesZip } from '@/lib/zip-builder';
import { MAX_SAFE_BATCH_SIZE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Download,
  AlertTriangle,
  Play,
  XCircle,
  CheckCircle2,
  FileArchive,
  RefreshCw,
  Sparkles,
  Settings,
} from 'lucide-react';

export function BulkGenerationView() {
  const {
    fields,
    backgroundImage,
    backgroundMeta,
    spreadsheetRows,
    columnMapping,
    excludedRowIndices,
    outputSettings,
    setOutputSettings,
    generationProgress,
    setGenerationProgress,
    isGenerating,
    setIsGenerating,
    resetGenerationProgress,
    setActiveTab,
  } = useAppStore();

  const [generatedZipBlob, setGeneratedZipBlob] = useState<Blob | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Active valid rows
  const activeRows = spreadsheetRows.filter((_, idx) => !excludedRowIndices.includes(idx));
  const totalCount = activeRows.length;
  const isOverSafeBatchSize = totalCount > MAX_SAFE_BATCH_SIZE;

  const handleStartGeneration = async () => {
    if (totalCount === 0) {
      alert('No rows available to generate. Please import a spreadsheet first.');
      return;
    }

    setIsGenerating(true);
    setGeneratedZipBlob(null);
    isCancelledRef.current = false;

    // Load background image element
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';

    await new Promise<void>((resolve) => {
      bgImg.onload = () => resolve();
      bgImg.onerror = () => resolve();
      bgImg.src = backgroundImage || '/samples/ces_default_certificate.png';
    });

    try {
      const zipBlob = await generateCertificatesBatch({
        fields,
        backgroundMeta,
        backgroundImageElement: bgImg,
        rows: activeRows,
        columnMapping,
        outputSettings,
        onProgress: (progress) => {
          setGenerationProgress(progress);
        },
        isCancelledRef,
      });

      if (zipBlob) {
        setGeneratedZipBlob(zipBlob);
      }
    } catch (err) {
      console.error('Generation failed:', err);
      setGenerationProgress({
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown generation error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelGeneration = () => {
    isCancelledRef.current = true;
    setIsGenerating(false);
  };

  const handleDownloadZip = () => {
    if (!generatedZipBlob) return;
    downloadCertificatesZip(generatedZipBlob, outputSettings.zipFilename);
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <FileArchive className="h-5 w-5 text-blue-400" />
            Bulk Certificate Generation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Produce customized high-resolution certificates for all {totalCount} recipients in parallel client-side.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setActiveTab('data')}
            disabled={isGenerating}
          >
            Review Data ({totalCount} rows)
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setActiveTab('preview')}
            disabled={isGenerating}
          >
            Test Preview
          </Button>
        </div>
      </div>

      {/* Warning if Batch Size > 5,000 */}
      {isOverSafeBatchSize && (
        <div className="flex items-start space-x-3 p-4 rounded-xl bg-amber-950/40 border border-amber-700/50 text-amber-200 text-xs">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-300">Large Dataset Notice ({totalCount} certificates)</div>
            <p className="mt-0.5 text-amber-300/80 leading-relaxed">
              You are generating more than {MAX_SAFE_BATCH_SIZE} certificates. While our batching architecture manages memory carefully, generation may take several minutes depending on your device's hardware. Please keep this browser tab open during generation.
            </p>
          </div>
        </div>
      )}

      {/* Output Settings Configuration */}
      <Card className="border-slate-800 bg-slate-900/90">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4 text-blue-400" />
            Output & Export Settings
          </CardTitle>
          <CardDescription>
            Configure image format, naming convention, and archive name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Format Selection */}
            <div>
              <Label className="text-xs text-slate-300 mb-1.5 block">Image Format</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setOutputSettings({ format: 'png' })}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                    outputSettings.format === 'png'
                      ? 'border-blue-500 bg-blue-600/20 text-white'
                      : 'border-slate-700 bg-slate-950 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-xs">PNG (Lossless)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Highest visual fidelity</div>
                </button>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setOutputSettings({ format: 'jpeg' })}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                    outputSettings.format === 'jpeg'
                      ? 'border-blue-500 bg-blue-600/20 text-white'
                      : 'border-slate-700 bg-slate-950 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-xs">JPEG (Compressed)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Smaller ZIP size</div>
                </button>
              </div>
            </div>

            {/* JPEG Quality Slider if JPEG */}
            {outputSettings.format === 'jpeg' && (
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                  <span>JPEG Quality</span>
                  <span className="font-mono text-blue-400">{Math.round(outputSettings.quality * 100)}%</span>
                </div>
                <Slider
                  value={[outputSettings.quality]}
                  min={0.5}
                  max={1.0}
                  step={0.05}
                  disabled={isGenerating}
                  onValueChange={([val]) => setOutputSettings({ quality: val })}
                  className="mt-3"
                />
              </div>
            )}

            {/* Filename Pattern */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs text-slate-300">Filename Pattern</Label>
                <span className="text-[10px] text-slate-500 font-mono">
                  Supported placeholders: {'{recipient_name}'}, {'{certificate_id}'}, {'{index}'}
                </span>
              </div>
              <Input
                value={outputSettings.filenamePattern}
                onChange={(e) => setOutputSettings({ filenamePattern: e.target.value })}
                disabled={isGenerating}
                className="h-8 text-xs font-mono bg-slate-950 border-slate-700"
                placeholder="Certificate_{recipient_name}_{certificate_id}"
              />
            </div>

            {/* ZIP Filename */}
            <div className="sm:col-span-2">
              <Label className="text-xs text-slate-300 mb-1 block">ZIP Archive Filename</Label>
              <Input
                value={outputSettings.zipFilename}
                onChange={(e) => setOutputSettings({ zipFilename: e.target.value })}
                disabled={isGenerating}
                className="h-8 text-xs bg-slate-950 border-slate-700"
                placeholder="CES_Certificates"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Control & Progress */}
      <Card className="border-slate-800 bg-slate-900/90">
        <CardContent className="p-6 space-y-5">
          {/* Progress Bar & Status */}
          {isGenerating || generationProgress.status !== 'idle' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">
                  {generationProgress.currentName || 'Generating certificates...'}
                </span>
                <span className="font-mono font-bold text-blue-400">
                  {generationProgress.current} / {generationProgress.total} ({generationProgress.percentage}%)
                </span>
              </div>

              <Progress value={generationProgress.percentage} className="h-3" />

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Status: {generationProgress.status.toUpperCase()}</span>
                {isGenerating && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={handleCancelGeneration}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel Generation
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <div className="font-semibold text-sm text-white">Ready for Generation</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {totalCount} recipients will be rendered into {outputSettings.format.toUpperCase()} files.
                </div>
              </div>
              <Button
                variant="default"
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 font-semibold px-6 gap-2 w-full sm:w-auto"
                onClick={handleStartGeneration}
                disabled={totalCount === 0}
              >
                <Play className="h-4 w-4 fill-white" />
                Start Generation
              </Button>
            </div>
          )}

          {/* Download Button on completion */}
          {generatedZipBlob && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-blue-950/60 to-emerald-950/60 border border-emerald-500/40 space-y-3 animate-in fade-in-50">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-bold text-sm">All Certificates Generated Successfully!</span>
              </div>
              <p className="text-xs text-slate-300">
                Your ZIP archive is compiled and ready. Size: ~{Math.round((generatedZipBlob.size / (1024 * 1024)) * 10) / 10} MB.
              </p>
              <Button
                variant="default"
                size="lg"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 font-bold gap-2 text-white shadow-lg shadow-emerald-950"
                onClick={handleDownloadZip}
              >
                <Download className="h-4 w-4" />
                Download {outputSettings.zipFilename}.zip
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
