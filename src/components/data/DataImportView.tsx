'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { parseSpreadsheetFile } from '@/lib/spreadsheet-parser';
import { validateSpreadsheetData } from '@/lib/data-validator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  FileText,
  Trash2,
  RefreshCw,
} from 'lucide-react';

export function DataImportView() {
  const {
    fields,
    spreadsheetFileName,
    spreadsheetHeaders,
    spreadsheetRows,
    columnMapping,
    excludedRowIndices,
    validationReport,
    setSpreadsheetData,
    clearSpreadsheetData,
    updateColumnMapping,
    toggleExcludeRow,
    setValidationReport,
    setActiveTab,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState(0);
  const pageSize = 8;

  // Run validation whenever mapping, rows, or exclusions change
  useEffect(() => {
    if (spreadsheetRows.length > 0) {
      const report = validateSpreadsheetData(fields, spreadsheetRows, columnMapping, excludedRowIndices);
      setValidationReport(report);
    }
  }, [fields, spreadsheetRows, columnMapping, excludedRowIndices, setValidationReport]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsParsing(true);
      setParseError(null);
      const parsed = await parseSpreadsheetFile(file);
      setSpreadsheetData(parsed.fileName, parsed.headers, parsed.rows);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsParsing(false);
      e.target.value = '';
    }
  };

  const handleLoadSampleData = async () => {
    try {
      setIsParsing(true);
      setParseError(null);
      const response = await fetch('/samples/ces_sample_recipients.csv');
      const blob = await response.blob();
      const sampleFile = new File([blob], 'ces_sample_recipients.csv', { type: 'text/csv' });
      const parsed = await parseSpreadsheetFile(sampleFile);
      setSpreadsheetData(parsed.fileName, parsed.headers, parsed.rows);
    } catch (err) {
      setParseError('Failed to load sample data.');
    } finally {
      setIsParsing(false);
    }
  };

  const totalPages = Math.ceil(spreadsheetRows.length / pageSize);
  const displayedRows = spreadsheetRows.slice(previewPage * pageSize, (previewPage + 1) * pageSize);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-200">
      {/* Top Banner / Upload Zone */}
      {!spreadsheetFileName ? (
        <div className="rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/40 p-8 sm:p-12 text-center hover:border-blue-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 mb-4 border border-blue-500/20">
            <FileSpreadsheet className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">Upload Recipient Dataset</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Upload an Excel (.xlsx, .xls) or CSV file containing participant names, event titles, certificate IDs, and other details.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="default"
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
            >
              <UploadCloud className="h-4 w-4" />
              {isParsing ? 'Reading Spreadsheet...' : 'Choose Excel / CSV File'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-slate-700 hover:bg-slate-800 text-slate-300"
              onClick={handleLoadSampleData}
              disabled={isParsing}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              Load Sample CES Data (6 Recipients)
            </Button>
          </div>
          {parseError && (
            <p className="text-xs text-red-400 mt-4 bg-red-950/40 border border-red-800/40 p-2 rounded max-w-md mx-auto">
              {parseError}
            </p>
          )}
        </div>
      ) : (
        /* Loaded File Summary Header */
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white">{spreadsheetFileName}</span>
                <Badge variant="success" className="text-[10px]">
                  {spreadsheetRows.length} Rows Loaded
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {spreadsheetHeaders.length} Columns detected: {spreadsheetHeaders.slice(0, 5).join(', ')}
                {spreadsheetHeaders.length > 5 ? '...' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Change File
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-red-400 hover:bg-red-950"
              onClick={clearSpreadsheetData}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-8 text-xs bg-blue-600 gap-1.5"
              onClick={() => setActiveTab('preview')}
            >
              <span>Test Preview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Column Mapping Section */}
      {spreadsheetRows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column to Field Mapping Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-slate-800 bg-slate-900/90">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Field Mapping (Template Field ⟷ Spreadsheet Column)</span>
                  <Badge variant="outline" className="text-[10px] text-blue-400">
                    Auto-Mapped
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Specify which spreadsheet column fills each dynamic certificate text field.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {fields.map((field) => {
                  const currentMapped = columnMapping[field.fieldKey] || '';
                  const isMapped = Boolean(currentMapped);

                  return (
                    <div
                      key={field.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/60 gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-white">{field.label}</span>
                          {field.required && (
                            <Badge variant="destructive" className="text-[9px] py-0 px-1">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          Key: {field.fieldKey} • Fallback: "{field.defaultValue}"
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-60">
                        <select
                          value={currentMapped}
                          onChange={(e) => updateColumnMapping(field.fieldKey, e.target.value)}
                          className={`h-8 w-full rounded border text-xs px-2 bg-slate-900 text-slate-100 transition-colors ${
                            isMapped ? 'border-emerald-600/60 text-emerald-300' : 'border-slate-700 text-slate-400'
                          }`}
                        >
                          <option value="">-- Select Column --</option>
                          {spreadsheetHeaders.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                        {isMapped && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Paginated Data Preview Table */}
            <Card className="border-slate-800 bg-slate-900/90">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Spreadsheet Data Preview</CardTitle>
                  <CardDescription>
                    Showing page {previewPage + 1} of {totalPages || 1} ({spreadsheetRows.length} total rows)
                  </CardDescription>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center space-x-2 text-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
                      disabled={previewPage === 0}
                    >
                      Prev
                    </Button>
                    <span className="font-mono text-slate-400">
                      {previewPage + 1}/{totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setPreviewPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={previewPage >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y border-slate-800 bg-slate-950/80 text-slate-400">
                      <th className="py-2.5 px-3 w-12 text-center">Row</th>
                      <th className="py-2.5 px-3 w-16 text-center">Include</th>
                      {spreadsheetHeaders.map((h) => (
                        <th key={h} className="py-2.5 px-3 font-semibold text-slate-300">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {displayedRows.map((row, idx) => {
                      const actualRowIndex = previewPage * pageSize + idx;
                      const isExcluded = excludedRowIndices.includes(actualRowIndex);

                      return (
                        <tr
                          key={actualRowIndex}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isExcluded ? 'opacity-40 bg-slate-950' : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-500">
                            #{actualRowIndex + 1}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={!isExcluded}
                              onChange={() => toggleExcludeRow(actualRowIndex)}
                              className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                              title={isExcluded ? 'Include this row' : 'Exclude this row'}
                            />
                          </td>
                          {spreadsheetHeaders.map((header) => (
                            <td key={header} className="py-2 px-3 truncate max-w-[160px] text-slate-200">
                              {row[header] || <span className="text-slate-600 italic">empty</span>}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Validation & Health Summary Sidebar */}
          <div className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/90">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Dataset Health & Validation</CardTitle>
                <CardDescription>Automated verification before certificate generation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {/* Status Indicator */}
                {validationReport?.valid ? (
                  <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    <div>
                      <div className="font-semibold">Dataset Ready</div>
                      <div className="text-[11px] text-emerald-400/80">
                        All {validationReport.validRowCount} active rows pass validation.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300">
                    <XCircle className="h-5 w-5 shrink-0 text-red-400" />
                    <div>
                      <div className="font-semibold">Validation Errors Found</div>
                      <div className="text-[11px] text-red-400/80">
                        {validationReport?.errors.length} errors must be resolved or excluded.
                      </div>
                    </div>
                  </div>
                )}

                {/* Counts */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Rows:</span>
                    <span className="font-semibold text-white">{spreadsheetRows.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Excluded Rows:</span>
                    <span className="font-semibold text-amber-400">{excludedRowIndices.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certificates to Generate:</span>
                    <span className="font-semibold text-emerald-400">
                      {spreadsheetRows.length - excludedRowIndices.length}
                    </span>
                  </div>
                </div>

                {/* Detailed Errors / Warnings */}
                {validationReport?.errors && validationReport.errors.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-semibold text-red-400">Errors:</div>
                    <div className="max-h-40 overflow-y-auto space-y-1 text-[11px]">
                      {validationReport.errors.slice(0, 5).map((err, i) => (
                        <div key={i} className="p-1.5 rounded bg-red-950/30 text-red-300 border border-red-900/40">
                          Row {err.row}: {err.message}
                        </div>
                      ))}
                      {validationReport.errors.length > 5 && (
                        <div className="text-[10px] text-slate-500 italic">
                          + {validationReport.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action button to proceed */}
                <div className="pt-3">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-500 gap-2"
                    onClick={() => setActiveTab('preview')}
                  >
                    <span>Proceed to Test Preview</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
