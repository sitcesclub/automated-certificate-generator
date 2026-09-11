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
    <div className="flex items-center justify-between border-b border-[#1e222b] bg-[#0c0d12] px-4 py-2">
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
                <div className="h-0.5 w-3 sm:w-6 bg-[#1e222b] hidden sm:block" />
              )}
              <button
                onClick={() => setActiveTab(step.id)}
                className={cn(
                  'flex items-center space-x-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer',
                  isActive
                    ? 'bg-[#14161e] text-[#f1f3f7] border border-[#2d3342] shadow-sm'
                    : 'text-[#7d8594] hover:bg-[#12141a] hover:text-[#d1d5db]'
                )}
              >
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded text-[10px]',
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : isCompleted
                      ? 'bg-[#1a1d26] text-[#9ca3af]'
                      : 'bg-[#14161e] text-[#525866]'
                  )}
                >
                  <Icon className="h-3 w-3" />
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-semibold leading-none">{step.label}</div>
                  <div className="text-[10px] text-[#636b7b] leading-tight mt-0.5">
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
