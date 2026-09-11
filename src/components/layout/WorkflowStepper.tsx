'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileSpreadsheet, Eye, Download, Palette } from 'lucide-react';

interface Step {
  id: 'editor' | 'data' | 'preview' | 'generate';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const STEPS: Step[] = [
  {
    id: 'editor',
    label: '1. Design & Fields',
    icon: Palette,
    description: 'Background & typography',
  },
  {
    id: 'data',
    label: '2. Import & Map',
    icon: FileSpreadsheet,
    description: 'Excel / CSV columns',
  },
  {
    id: 'preview',
    label: '3. Test Preview',
    icon: Eye,
    description: 'Verify 1-3 samples',
  },
  {
    id: 'generate',
    label: '4. Bulk Generate',
    icon: Download,
    description: 'ZIP export',
  },
];

export function WorkflowStepper() {
  const { activeTab, setActiveTab, spreadsheetRows } = useAppStore();

  return (
    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2 backdrop-blur">
      <div className="flex items-center space-x-1 sm:space-x-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeTab === step.id;
          const isCompleted =
            (step.id === 'editor') ||
            (step.id === 'data' && spreadsheetRows.length > 0) ||
            (step.id === 'preview' && spreadsheetRows.length > 0);

          return (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <div className="h-0.5 w-3 sm:w-6 bg-slate-800 hidden sm:block" />
              )}
              <button
                onClick={() => setActiveTab(step.id)}
                className={cn(
                  'flex items-center space-x-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer',
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                )}
              >
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
                    isActive
                      ? 'bg-blue-600 text-white font-bold'
                      : isCompleted
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-800 text-slate-500'
                  )}
                >
                  <Icon className="h-3 w-3" />
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-semibold leading-none">{step.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {step.description}
                  </div>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
