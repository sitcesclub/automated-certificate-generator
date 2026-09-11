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
    <div className="min-h-screen bg-[#090a0d] text-[#f1f3f7] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-[#1e222b] pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-[#7d8594] hover:text-white hover:bg-[#161922]">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#6e7482]">CES / TEMPLATES REPOSITORY</div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <img src="/ces-logo.svg" alt="CES Logo" className="h-5 w-5 object-contain inline-block" />
                Certificate Templates Library
              </h1>
              <p className="text-xs text-[#7d8594] mt-0.5">
                Saved offline templates for Computer Engineers&apos; Society events.
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
              className="h-9 gap-1.5 text-xs font-mono border-[#222631] bg-[#12141a] text-[#d1d5db] hover:bg-[#161922]"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-4 w-4" />
              Import .ces-template
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold font-mono text-white"
              onClick={handleNewTemplate}
            >
              <Plus className="h-4 w-4" />
              Create New Template
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-[#6e7482] font-mono text-xs">
            Loading saved templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#222631] bg-[#0c0d12] p-12 text-center">
            <img src="/ces-logo.svg" alt="CES Logo" className="mx-auto h-16 w-16 object-contain opacity-30 mb-3" />
            <h3 className="text-sm font-semibold text-[#f1f3f7] font-mono">NO SAVED TEMPLATES YET</h3>
            <p className="text-xs text-[#7d8594] mt-1 max-w-sm mx-auto">
              Design a certificate template in the editor and click &quot;Save&quot;, or import an existing .ces-template package.
            </p>
            <div className="mt-4">
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 font-mono text-xs text-white"
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
                className="group border-[#1e222b] bg-[#0f1116] hover:border-blue-500/50 hover:bg-[#12141a] transition-all cursor-pointer overflow-hidden flex flex-col"
                onClick={() => handleSelectTemplate(template)}
              >
                {/* Thumbnail Preview */}
                <div className="relative aspect-video w-full bg-[#090a0d] overflow-hidden border-b border-[#1e222b]">
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
                    <Badge variant="secondary" className="text-[10px] font-mono bg-[#0c0d12]/90 border border-[#222631] text-[#d1d5db]">
                      {template.fields.length} Fields
                    </Badge>
                  </div>
                </div>

                <CardHeader className="p-4 pb-2 flex-1">
                  <CardTitle className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors font-mono">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-1 text-xs text-[#7d8594]">
                    {template.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-[#1e222b] mt-3 text-xs text-[#7d8594] font-mono">
                  <div className="flex items-center space-x-1 text-[11px]">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleExportTemplate(e, template)}
                      className="p-1.5 rounded hover:bg-[#161922] text-[#7d8594] hover:text-[#38bdf8]"
                      title="Export as .ces-template"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicateTemplate(e, template)}
                      className="p-1.5 rounded hover:bg-[#161922] text-[#7d8594] hover:text-white"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteTemplate(e, template.id, template.name)}
                      className="p-1.5 rounded hover:bg-[#240e13] text-[#7d8594] hover:text-[#f87171]"
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
