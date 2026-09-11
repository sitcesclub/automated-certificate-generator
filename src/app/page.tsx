'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { initCustomFontsFromDb } from '@/lib/font-manager';
import { AppHeader } from '@/components/layout/AppHeader';
import { WorkflowStepper } from '@/components/layout/WorkflowStepper';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { FieldList } from '@/components/editor/FieldList';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { FieldPropertiesPanel } from '@/components/editor/FieldPropertiesPanel';
import { DataImportView } from '@/components/data/DataImportView';
import { TestPreviewView } from '@/components/generation/TestPreviewView';
import { BulkGenerationView } from '@/components/generation/BulkGenerationView';

export default function MainPage() {
  const { activeTab, setCustomFonts } = useAppStore();
  const [mounted, setMounted] = useState(false);

  // Initialize custom fonts and service worker
  useEffect(() => {
    setMounted(true);
    initCustomFontsFromDb().then((fonts) => {
      setCustomFonts(fonts);
    });
  }, [setCustomFonts]);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-xs font-medium">Loading CES CertGen...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950">
      {/* Top Application Header */}
      <AppHeader />

      {/* 4-Step Pipeline Workflow Stepper */}
      <WorkflowStepper />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'editor' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel: Field Layers List (resizable / fixed 280px) */}
            <aside className="w-64 sm:w-72 shrink-0 h-full border-r border-slate-800 hidden md:block">
              <FieldList />
            </aside>

            {/* Center Canvas Viewport */}
            <section className="flex-1 flex flex-col h-full overflow-hidden">
              <EditorToolbar />
              <EditorCanvas />
            </section>

            {/* Right Panel: Selected Field Properties (320px) */}
            <aside className="w-80 shrink-0 h-full border-l border-slate-800 bg-slate-950/80 hidden lg:block">
              <FieldPropertiesPanel />
            </aside>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="flex-1 overflow-auto">
            <DataImportView />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="flex-1 overflow-auto">
            <TestPreviewView />
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="flex-1 overflow-auto">
            <BulkGenerationView />
          </div>
        )}
      </main>
    </div>
  );
}
