'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { db } from '@/lib/db';
import { downloadTemplatePackage, importTemplatePackage } from '@/lib/template-packager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Award,
  Save,
  Share2,
  FolderOpen,
  Wifi,
  WifiOff,
  RotateCcw,
  Check,
  UploadCloud,
  FileDown,
} from 'lucide-react';
import { CertificateTemplate } from '@/lib/types';

export function AppHeader() {
  const {
    templateId,
    templateName,
    templateDescription,
    setTemplateId,
    setTemplateName,
    setTemplateDescription,
    backgroundImage,
    backgroundMeta,
    fields,
    outputSettings,
    customFonts,
    loadTemplate,
    resetToDefault,
  } = useAppStore();

  const [isOnline, setIsOnline] = useState(true);
  const [saveOpen, setSaveOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Monitor network status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleSaveTemplate = async () => {
    try {
      const id = templateId || `template-${Date.now()}`;
      const templateToSave: CertificateTemplate = {
        id,
        name: templateName || 'Untitled Certificate',
        description: templateDescription || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        backgroundImageDataUrl: backgroundImage || undefined,
        backgroundMeta: backgroundMeta || {
          width: 1920,
          height: 1080,
          format: 'png',
          name: 'background.png',
        },
        fields,
        outputSettings,
      };

      await db.templates.put(templateToSave);
      setTemplateId(id);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setSaveOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to save template:', err);
    }
  };

  const handleExportPackage = async () => {
    try {
      setIsExporting(true);
      const template: CertificateTemplate = {
        id: templateId || `template-${Date.now()}`,
        name: templateName || 'CES_Template',
        description: templateDescription || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        backgroundImageDataUrl: backgroundImage || undefined,
        backgroundMeta: backgroundMeta || {
          width: 1920,
          height: 1080,
          format: 'png',
          name: 'background.png',
        },
        fields,
        outputSettings,
      };
      await downloadTemplatePackage(template, customFonts);
    } catch (err) {
      console.error('Failed to export package:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportPackageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importTemplatePackage(file);
      loadTemplate(imported);
      alert(`Template "${imported.name}" imported successfully!`);
    } catch (err) {
      alert(`Failed to import template package: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <header className="border-b border-[#1e222b] bg-[#0c0d12] px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Club Logo */}
      <div className="flex items-center space-x-3">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#12141a] border border-[#222631] p-0.5 shadow-md shadow-black/60 group-hover:scale-105 transition-transform overflow-hidden">
            <img
              src="/ces-logo.svg"
              alt="Computer Engineers' Society Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#f1f3f7] group-hover:text-blue-400 transition-colors">
            Computer Engineers&apos; Society
          </span>
        </Link>

        {/* Separator */}
        <div className="h-6 w-px bg-[#1e222b] hidden sm:block" />

        {/* Template Name in place */}
        <div className="flex items-center space-x-2 max-w-[200px] sm:max-w-xs">
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="h-8 text-xs bg-[#12141a] border-[#1e222b] text-[#f1f3f7] font-medium"
            placeholder="Template name..."
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-2">
        {/* Offline Status Badge */}
        <div className="hidden lg:flex items-center">
          {isOnline ? (
            <Badge variant="success" className="text-[11px] flex items-center gap-1.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[11px] flex items-center gap-1.5 py-1">
              <WifiOff className="h-3 w-3" />
              Offline Ready
            </Badge>
          )}
        </div>

        {/* Import .ces-template input */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".ces-template,.zip"
            className="hidden"
            onChange={handleImportPackageFile}
          />
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 hidden md:flex" type="button" onClick={(e) => {
            // trigger file input click
            const input = (e.currentTarget.previousSibling as HTMLInputElement);
            input?.click();
          }}>
            <UploadCloud className="h-3.5 w-3.5" />
            Import Package
          </Button>
        </label>

        {/* Export .ces-template */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 hidden sm:flex"
          onClick={handleExportPackage}
          disabled={isExporting}
          title="Export as portable .ces-template file"
        >
          <Share2 className="h-3.5 w-3.5 text-blue-400" />
          Share (.ces-template)
        </Button>

        {/* Save Template Dialog */}
        <Button
          variant="default"
          size="sm"
          className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-500"
          onClick={() => setSaveOpen(true)}
        >
          <Save className="h-3.5 w-3.5" />
          Save
        </Button>

        {/* Templates library page link */}
        <Link href="/templates">
          <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
        </Link>
      </div>

      {/* Save Template Modal */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Certificate Template</DialogTitle>
            <DialogDescription>
              This template will be saved offline in your browser's local database so you can reuse it anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-[#f1f3f7]">Template Title</label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="mt-1"
                placeholder="e.g. CES Hackathon Excellence Award 2026"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#f1f3f7]">Description (Optional)</label>
              <Input
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                className="mt-1"
                placeholder="e.g. Used for Annual Technical Festival participants"
              />
            </div>
            <div className="p-3 bg-[#090a0d] rounded-lg border border-[#1e222b] text-xs text-[#7d8594] space-y-1">
              <div>• Configured dynamic fields: <strong className="text-[#f1f3f7]">{fields.length}</strong></div>
              <div>• Background resolution: <strong className="text-[#f1f3f7]">{backgroundMeta ? `${backgroundMeta.width}x${backgroundMeta.height}` : 'Default (1920x1080)'}</strong></div>
              <div>• Saved offline to IndexedDB (no cloud required)</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveTemplate}
              className="bg-blue-600 gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
