'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { CertificateTemplate } from '@/lib/types';
import { downloadTemplatePackage, importTemplatePackage } from '@/lib/template-packager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Award,
  Plus,
  ArrowLeft,
  FolderOpen,
  Share2,
  Trash2,
  Copy,
  UploadCloud,
  Check,
  Calendar,
} from 'lucide-react';

export default function TemplatesPage() {
  const router = useRouter();
  const { loadTemplate, resetToDefault, customFonts } = useAppStore();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const list = await db.templates.toArray();
      setTemplates(list);
    } catch (err) {
      console.error('Failed to load templates from DB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSelectTemplate = (template: CertificateTemplate) => {
    loadTemplate(template);
    router.push('/');
  };

  const handleNewTemplate = () => {
    resetToDefault();
    router.push('/');
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete template "${name}"?`)) {
      await db.templates.delete(id);
      await fetchTemplates();
    }
  };

  const handleDuplicateTemplate = async (e: React.MouseEvent, template: CertificateTemplate) => {
    e.stopPropagation();
    const duplicated: CertificateTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.templates.put(duplicated);
    await fetchTemplates();
  };

  const handleExportTemplate = async (e: React.MouseEvent, template: CertificateTemplate) => {
    e.stopPropagation();
    await downloadTemplatePackage(template, customFonts);
  };

  const handleImportPackage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importTemplatePackage(file);
      await fetchTemplates();
      alert(`Imported "${imported.name}" successfully!`);
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-400" />
                Certificate Templates Library
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved offline templates for Computer Engineers' Society events.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".ces-template,.zip"
              className="hidden"
              onChange={handleImportPackage}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-4 w-4" />
              Import .ces-template
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold"
              onClick={handleNewTemplate}
            >
              <Plus className="h-4 w-4" />
              Create New Template
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading saved templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-800 p-12 text-center">
            <Award className="mx-auto h-12 w-12 text-slate-700 mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No saved templates yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Design a certificate template in the editor and click "Save", or import an existing .ces-template package.
            </p>
            <div className="mt-4">
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-500"
                onClick={handleNewTemplate}
              >
                Start Designing Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="group border-slate-800 bg-slate-900/70 hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer overflow-hidden flex flex-col"
                onClick={() => handleSelectTemplate(template)}
              >
                {/* Thumbnail Preview */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800">
                  {template.backgroundImageDataUrl ? (
                    <img
                      src={template.backgroundImageDataUrl}
                      alt={template.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <img
                      src="/samples/ces_default_certificate.png"
                      alt="Default Background"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-[10px] bg-slate-950/80 backdrop-blur">
                      {template.fields.length} Fields
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-4 pb-2 flex-1">
                  <CardTitle className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {template.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-800/80 mt-3 text-xs text-slate-500">
                  <div className="flex items-center space-x-1 text-[11px]">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleExportTemplate(e, template)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-blue-400"
                      title="Export as .ces-template"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicateTemplate(e, template)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteTemplate(e, template.id, template.name)}
                      className="p-1.5 rounded hover:bg-red-950 text-slate-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
