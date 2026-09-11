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
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-[#f1f3f7]">
      {/* Breadcrumb matching console reference */}
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#6e7482]">
        <span>CES / PIPELINE / DATA INGESTION &amp; MAPPING</span>
        <span>STAGE 02 OF 04</span>
      </div>

      {/* Top Banner / Upload Zone */}
      {!spreadsheetFileName ? (
        <div className="rounded-xl border-2 border-dashed border-[#222631] bg-[#0c0d12]/80 p-8 sm:p-12 text-center hover:border-blue-500/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#12141a] text-blue-400 mb-4 border border-[#222631]">
            <FileSpreadsheet className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">Upload Recipient Dataset</h3>
          <p className="text-xs text-[#7d8594] mt-1 max-w-md mx-auto">
            Upload an Excel (.xlsx, .xls) or CSV file containing participant names, event titles, certificate IDs, and other details.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="default"
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 gap-2 font-mono text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
            >
              <UploadCloud className="h-4 w-4" />
              {isParsing ? 'Reading Spreadsheet...' : 'Choose Excel / CSV File'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-[#222631] bg-[#12141a] hover:bg-[#161922] text-[#d1d5db] font-mono text-xs"
              onClick={handleLoadSampleData}
              disabled={isParsing}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              Load Sample CES Data (6 Recipients)
            </Button>
          </div>
          {parseError && (
            <p className="text-xs text-[#f87171] mt-4 bg-[#240e13] border border-[#4d1f24] p-2 rounded max-w-md mx-auto font-mono">
              {parseError}
            </p>
          )}
        </div>
      ) : (
        /* Loaded File Summary Header */
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0c0d12] border border-[#1e222b]">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0d231a] text-[#34d399] border border-[#1a4030]">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-sm text-white">{spreadsheetFileName}</span>
                <Badge variant="success" className="text-[10px] font-mono">
                  {spreadsheetRows.length} ROWS LOADED
                </Badge>
              </div>
              <p className="text-xs text-[#7d8594] font-mono mt-0.5">
                {spreadsheetHeaders.length} columns detected: {spreadsheetHeaders.slice(0, 5).join(', ')}
                {spreadsheetHeaders.length > 5 ? '...' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-[#222631] bg-[#12141a] text-[#d1d5db] hover:bg-[#161922]"
              onClick={() => fileInputRef.current?.click()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Change File
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-[#f87171] hover:bg-[#240e13] hover:text-[#f87171]"
              onClick={clearSpreadsheetData}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-8 text-xs bg-blue-600 hover:bg-blue-500 gap-1.5 font-mono"
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
            <Card className="border-[#1e222b] bg-[#0f1116]">
              <CardHeader className="pb-3 border-b border-[#1e222b]">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-[#a1a7b5] flex items-center justify-between">
                  <span>FIELD EXTRACTION — PROPOSED FIELDS &amp; NORMALIZATION</span>
                  <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30 font-mono">
                    AUTO-MAPPED
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-[#7d8594]">
                  Specify which spreadsheet column fills each dynamic certificate text field.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {fields.map((field) => {
                  const currentMapped = columnMapping[field.fieldKey] || '';
                  const isMapped = Boolean(currentMapped);

                  return (
                    <div
                      key={field.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-[#1e222b] bg-[#12141a] gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-white">{field.label}</span>
                          {field.required && (
                            <Badge variant="destructive" className="text-[9px] py-0 px-1 font-mono">
                              REQUIRED
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-[#6e7482] mt-0.5">
                          key: <span className="text-[#fbbf24]">{field.fieldKey}</span> • fallback: &quot;{field.defaultValue}&quot;
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-60">
                        <select
                          value={currentMapped}
                          onChange={(e) => updateColumnMapping(field.fieldKey, e.target.value)}
                          className={`h-8 w-full rounded border text-xs px-2 bg-[#090a0d] text-[#f1f3f7] font-mono transition-colors focus:ring-0 ${
                            isMapped ? 'border-emerald-600/60 text-emerald-300' : 'border-[#222631] text-[#7d8594]'
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
            <Card className="border-[#1e222b] bg-[#0f1116]">
              <CardHeader className="pb-3 border-b border-[#1e222b] flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-mono uppercase tracking-wider text-[#a1a7b5]">SPREADSHEET DATA EVIDENCE</CardTitle>
                  <CardDescription className="text-xs text-[#7d8594]">
                    Showing page {previewPage + 1} of {totalPages || 1} ({spreadsheetRows.length} total rows)
                  </CardDescription>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center space-x-2 text-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 border-[#222631] bg-[#12141a] text-[#d1d5db] font-mono text-xs hover:bg-[#161922]"
                      onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
                      disabled={previewPage === 0}
                    >
                      Prev
                    </Button>
                    <span className="font-mono text-[#7d8594]">
                      {previewPage + 1}/{totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 border-[#222631] bg-[#12141a] text-[#d1d5db] font-mono text-xs hover:bg-[#161922]"
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
                    <tr className="border-b border-[#1e222b] bg-[#0c0d12] text-[#6e7482] font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-12 text-center">Row</th>
                      <th className="py-2.5 px-3 w-16 text-center">Include</th>
                      {spreadsheetHeaders.map((h) => (
                        <th key={h} className="py-2.5 px-3 font-semibold text-[#a1a7b5]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e222b]/60 font-mono">
                    {displayedRows.map((row, idx) => {
                      const actualRowIndex = previewPage * pageSize + idx;
                      const isExcluded = excludedRowIndices.includes(actualRowIndex);

                      return (
                        <tr
                          key={actualRowIndex}
                          className={`hover:bg-[#141720] transition-colors ${
                            isExcluded ? 'opacity-35 bg-[#090a0d]' : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-center text-[11px] text-[#6e7482]">
                            #{actualRowIndex + 1}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={!isExcluded}
                              onChange={() => toggleExcludeRow(actualRowIndex)}
                              className="rounded border-[#222631] bg-[#090a0d] text-blue-600 focus:ring-0 cursor-pointer"
                              title={isExcluded ? 'Include this row' : 'Exclude this row'}
                            />
                          </td>
                          {spreadsheetHeaders.map((header) => (
                            <td key={header} className="py-2 px-3 truncate max-w-[160px] text-[#d1d5db]">
                              {row[header] || <span className="text-[#6e7482] italic font-sans">empty</span>}
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
            <Card className="border-[#1e222b] bg-[#0f1116]">
              <CardHeader className="pb-3 border-b border-[#1e222b]">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-[#a1a7b5]">
                  VALIDATION DETAILS — TEST SCORECARD
                </CardTitle>
                <CardDescription className="text-xs text-[#7d8594]">
                  Automated verification before certificate generation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs pt-4">
                {/* Status Alert Banner */}
                {validationReport?.valid ? (
                  <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-[#091a14] border border-[#123829] text-[#34d399]">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#34d399]" />
                    <div>
                      <div className="font-semibold font-mono text-xs">DATASET READY</div>
                      <div className="text-[11px] text-[#34d399]/80 font-mono">
                        All {validationReport.validRowCount} active rows pass validation.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-[#240e13] border border-[#4d1f24] text-[#f87171]">
                    <XCircle className="h-5 w-5 shrink-0 text-[#f87171]" />
                    <div>
                      <div className="font-semibold font-mono text-xs">BLOCKED — VALIDATION FAILED</div>
                      <div className="text-[11px] text-[#f87171]/80 font-mono">
                        {validationReport?.errors.length} errors must be resolved or excluded.
                      </div>
                    </div>
                  </div>
                )}

                {/* Scorecard Key-Value List matching reference image */}
                <div className="space-y-2.5 pt-2 border-t border-[#1e222b] font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#7d8594]">Positive Match (Active rows):</span>
                    <span className="font-bold text-[#34d399]">
                      {validationReport?.validRowCount || 0} / {spreadsheetRows.length} passed
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7d8594]">Negative Test (Excluded rows):</span>
                    <span className="text-[#f1f3f7]">{excludedRowIndices.length} excluded</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7d8594]">Overall Pass Status:</span>
                    {validationReport?.valid ? (
                      <span className="font-bold text-[#34d399]">PASSED</span>
                    ) : (
                      <span className="font-bold text-[#fbbf24]">PARTIAL</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#7d8594]">Certificates to Generate:</span>
                    <span className="font-bold text-white">
                      {spreadsheetRows.length - excludedRowIndices.length}
                    </span>
                  </div>
                </div>

                {/* Detailed Errors / Warnings */}
                {validationReport?.errors && validationReport.errors.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-[#1e222b]">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#f87171]">Errors Detected:</div>
                    <div className="max-h-40 overflow-y-auto space-y-1 text-[11px] font-mono">
                      {validationReport.errors.slice(0, 5).map((err, i) => (
                        <div key={i} className="p-2 rounded bg-[#1a0c0f] text-[#fca5a5] border border-[#3d151c]">
                          Row #{err.row}: {err.message}
                        </div>
                      ))}
                      {validationReport.errors.length > 5 && (
                        <div className="text-[10px] text-[#6e7482] italic font-mono">
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
                    className="w-full bg-blue-600 hover:bg-blue-500 gap-2 font-mono text-xs text-white"
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
