import { create } from 'zustand';
import {
  CertificateField,
  BackgroundMeta,
  OutputSettings,
  SpreadsheetRow,
  ColumnMapping,
  ValidationReport,
  GenerationProgress,
  CustomFont,
  TestPreviewResult,
  CertificateTemplate,
} from './types';
import { DEFAULT_FIELDS, DEFAULT_OUTPUT_SETTINGS } from './constants';

interface HistorySnapshot {
  fields: CertificateField[];
  selectedFieldId: string | null;
}

interface AppState {
  // Template & Canvas State
  templateId: string | null;
  templateName: string;
  templateDescription: string;
  backgroundImage: string | null;
  backgroundMeta: BackgroundMeta | null;
  fields: CertificateField[];
  selectedFieldId: string | null;
  outputSettings: OutputSettings;

  // Viewport State
  zoom: number;
  snapToGuides: boolean;
  activeTab: 'editor' | 'data' | 'preview' | 'generate';

  // Spreadsheet Data State
  spreadsheetFileName: string | null;
  spreadsheetHeaders: string[];
  spreadsheetRows: SpreadsheetRow[];
  columnMapping: ColumnMapping;
  excludedRowIndices: number[];
  validationReport: ValidationReport | null;

  // Test Previews
  testPreviews: TestPreviewResult[];
  isGeneratingTestPreview: boolean;

  // Bulk Generation State
  generationProgress: GenerationProgress;
  isGenerating: boolean;

  // Custom Fonts
  customFonts: CustomFont[];

  // Undo / Redo
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Actions
  setTemplateId: (id: string | null) => void;
  setTemplateName: (name: string) => void;
  setTemplateDescription: (desc: string) => void;
  setBackground: (image: string, meta: BackgroundMeta) => void;
  clearBackground: () => void;
  
  // Field Actions with History
  setFields: (fields: CertificateField[]) => void;
  addField: (field?: Partial<CertificateField>) => void;
  updateField: (id: string, updates: Partial<CertificateField>) => void;
  deleteField: (id: string) => void;
  duplicateField: (id: string) => void;
  setSelectedFieldId: (id: string | null) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  toggleLockField: (id: string) => void;
  toggleVisibilityField: (id: string) => void;

  // Undo / Redo Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Output Settings
  setOutputSettings: (settings: Partial<OutputSettings>) => void;

  // Viewport Actions
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setSnapToGuides: (snap: boolean) => void;
  setActiveTab: (tab: 'editor' | 'data' | 'preview' | 'generate') => void;

  // Spreadsheet & Data Actions
  setSpreadsheetData: (fileName: string, headers: string[], rows: SpreadsheetRow[]) => void;
  clearSpreadsheetData: () => void;
  setColumnMapping: (mapping: ColumnMapping) => void;
  updateColumnMapping: (fieldKey: string, column: string) => void;
  toggleExcludeRow: (rowIndex: number) => void;
  setValidationReport: (report: ValidationReport | null) => void;

  // Test Preview Actions
  setTestPreviews: (previews: TestPreviewResult[]) => void;
  setIsGeneratingTestPreview: (val: boolean) => void;

  // Bulk Generation Actions
  setGenerationProgress: (progress: Partial<GenerationProgress>) => void;
  setIsGenerating: (generating: boolean) => void;
  resetGenerationProgress: () => void;

  // Font Actions
  setCustomFonts: (fonts: CustomFont[]) => void;
  addCustomFont: (font: CustomFont) => void;
  removeCustomFont: (fontId: string) => void;

  // Load Template
  loadTemplate: (template: CertificateTemplate) => void;
  resetToDefault: () => void;
}

const MAX_HISTORY = 30;

export const useAppStore = create<AppState>((set, get) => ({
  templateId: null,
  templateName: 'Untitled Certificate Template',
  templateDescription: 'Computer Engineers\' Society Event Certificate',
  backgroundImage: null,
  backgroundMeta: null,
  fields: DEFAULT_FIELDS,
  selectedFieldId: 'field-name',
  outputSettings: DEFAULT_OUTPUT_SETTINGS,

  zoom: 1.0,
  snapToGuides: true,
  activeTab: 'editor',

  spreadsheetFileName: null,
  spreadsheetHeaders: [],
  spreadsheetRows: [],
  columnMapping: {
    recipient_name: '',
    event_name: '',
    date: '',
    certificate_id: '',
  },
  excludedRowIndices: [],
  validationReport: null,

  testPreviews: [],
  isGeneratingTestPreview: false,

  generationProgress: {
    status: 'idle',
    total: 0,
    current: 0,
    percentage: 0,
  },
  isGenerating: false,

  customFonts: [],
  past: [],
  future: [],

  setTemplateId: (id) => set({ templateId: id }),
  setTemplateName: (name) => set({ templateName: name }),
  setTemplateDescription: (desc) => set({ templateDescription: desc }),

  setBackground: (image, meta) => set({ backgroundImage: image, backgroundMeta: meta }),
  clearBackground: () => set({ backgroundImage: null, backgroundMeta: null }),

  setFields: (newFields) => {
    const { fields, selectedFieldId, past } = get();
    const newPast = [...past, { fields, selectedFieldId }].slice(-MAX_HISTORY);
    set({ fields: newFields, past: newPast, future: [] });
  },

  addField: (partial) => {
    const { fields, selectedFieldId, past } = get();
    const newPast = [...past, { fields, selectedFieldId }].slice(-MAX_HISTORY);
    const newId = `field-${Date.now()}`;
    const maxZ = fields.reduce((max, f) => Math.max(max, f.zIndex), 0);

    const newField: CertificateField = {
      id: newId,
      label: partial?.label || `Field ${fields.length + 1}`,
      fieldKey: partial?.fieldKey || `field_${fields.length + 1}`,
      defaultValue: partial?.defaultValue || 'Sample Text',
      x: partial?.x ?? 30,
      y: partial?.y ?? 50,
      width: partial?.width ?? 40,
      height: partial?.height ?? 8,
      fontFamily: partial?.fontFamily || 'Montserrat',
      fontSize: partial?.fontSize || 28,
      fontWeight: partial?.fontWeight || 600,
      fontStyle: partial?.fontStyle || 'normal',
      textColor: partial?.textColor || '#1a202c',
      textAlign: partial?.textAlign || 'center',
      verticalAlign: partial?.verticalAlign || 'middle',
      letterSpacing: partial?.letterSpacing || 0,
      lineHeight: partial?.lineHeight || 1.2,
      textTransform: partial?.textTransform || 'none',
      textDecoration: partial?.textDecoration || 'none',
      multiLine: partial?.multiLine ?? false,
      wrapMode: partial?.wrapMode || 'word',
      overflowBehavior: partial?.overflowBehavior || 'shrink',
      zIndex: maxZ + 1,
      locked: false,
      visible: true,
      required: false,
    };

    set({
      fields: [...fields, newField],
      selectedFieldId: newId,
      past: newPast,
      future: [],
    });
  },

  updateField: (id, updates) => {
    const { fields, selectedFieldId, past } = get();
    const newPast = [...past, { fields, selectedFieldId }].slice(-MAX_HISTORY);
    const updated = fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
    set({ fields: updated, past: newPast, future: [] });
  },

  deleteField: (id) => {
    const { fields, selectedFieldId, past } = get();
    const newPast = [...past, { fields, selectedFieldId }].slice(-MAX_HISTORY);
    const remaining = fields.filter((f) => f.id !== id);
    set({
      fields: remaining,
      selectedFieldId: selectedFieldId === id ? (remaining[0]?.id ?? null) : selectedFieldId,
      past: newPast,
      future: [],
    });
  },

  duplicateField: (id) => {
    const { fields, selectedFieldId, past } = get();
    const target = fields.find((f) => f.id === id);
    if (!target) return;

    const newPast = [...past, { fields, selectedFieldId }].slice(-MAX_HISTORY);
    const newId = `field-${Date.now()}`;
    const maxZ = fields.reduce((max, f) => Math.max(max, f.zIndex), 0);

    const duplicated: CertificateField = {
      ...target,
      id: newId,
      label: `${target.label} (Copy)`,
      fieldKey: `${target.fieldKey}_copy`,
      x: Math.min(target.x + 3, 90),
      y: Math.min(target.y + 3, 90),
      zIndex: maxZ + 1,
    };

    set({
      fields: [...fields, duplicated],
      selectedFieldId: newId,
      past: newPast,
      future: [],
    });
  },

  setSelectedFieldId: (id) => set({ selectedFieldId: id }),

  bringToFront: (id) => {
    const { fields } = get();
    const maxZ = fields.reduce((max, f) => Math.max(max, f.zIndex), 0);
    const updated = fields.map((f) => (f.id === id ? { ...f, zIndex: maxZ + 1 } : f));
    set({ fields: updated });
  },

  sendToBack: (id) => {
    const { fields } = get();
    const minZ = fields.reduce((min, f) => Math.min(min, f.zIndex), 0);
    const updated = fields.map((f) => (f.id === id ? { ...f, zIndex: Math.max(0, minZ - 1) } : f));
    set({ fields: updated });
  },

  toggleLockField: (id) => {
    const { fields } = get();
    const updated = fields.map((f) => (f.id === id ? { ...f, locked: !f.locked } : f));
    set({ fields: updated });
  },

  toggleVisibilityField: (id) => {
    const { fields } = get();
    const updated = fields.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f));
    set({ fields: updated });
  },

  undo: () => {
    const { past, future, fields, selectedFieldId } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const newFuture = [{ fields, selectedFieldId }, ...future].slice(0, MAX_HISTORY);

    set({
      fields: previous.fields,
      selectedFieldId: previous.selectedFieldId,
      past: newPast,
      future: newFuture,
    });
  },

  redo: () => {
    const { past, future, fields, selectedFieldId } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, { fields, selectedFieldId }].slice(-MAX_HISTORY);

    set({
      fields: next.fields,
      selectedFieldId: next.selectedFieldId,
      past: newPast,
      future: newFuture,
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  setOutputSettings: (settings) => {
    set((state) => ({ outputSettings: { ...state.outputSettings, ...settings } }));
  },

  setZoom: (zoom) => {
    set((state) => ({
      zoom: typeof zoom === 'function' ? zoom(state.zoom) : Math.min(Math.max(zoom, 0.25), 3.0),
    }));
  },

  setSnapToGuides: (snap) => set({ snapToGuides: snap }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  setSpreadsheetData: (fileName, headers, rows) => {
    // Attempt auto-mapping
    const { fields } = get();
    const mapping: ColumnMapping = {};

    fields.forEach((field) => {
      // Find matching header: exact key, exact label, or contains
      const matched = headers.find(
        (h) =>
          h.toLowerCase().trim() === field.fieldKey.toLowerCase().trim() ||
          h.toLowerCase().trim() === field.label.toLowerCase().trim() ||
          h.toLowerCase().includes(field.label.toLowerCase()) ||
          field.label.toLowerCase().includes(h.toLowerCase())
      );
      mapping[field.fieldKey] = matched || '';
    });

    set({
      spreadsheetFileName: fileName,
      spreadsheetHeaders: headers,
      spreadsheetRows: rows,
      columnMapping: mapping,
      excludedRowIndices: [],
      validationReport: null,
      testPreviews: [],
    });
  },

  clearSpreadsheetData: () => {
    set({
      spreadsheetFileName: null,
      spreadsheetHeaders: [],
      spreadsheetRows: [],
      columnMapping: {},
      excludedRowIndices: [],
      validationReport: null,
      testPreviews: [],
    });
  },

  setColumnMapping: (mapping) => set({ columnMapping: mapping }),

  updateColumnMapping: (fieldKey, column) => {
    set((state) => ({
      columnMapping: { ...state.columnMapping, [fieldKey]: column },
    }));
  },

  toggleExcludeRow: (rowIndex) => {
    set((state) => {
      const exists = state.excludedRowIndices.includes(rowIndex);
      return {
        excludedRowIndices: exists
          ? state.excludedRowIndices.filter((i) => i !== rowIndex)
          : [...state.excludedRowIndices, rowIndex],
      };
    });
  },

  setValidationReport: (report) => set({ validationReport: report }),

  setTestPreviews: (previews) => set({ testPreviews: previews }),
  setIsGeneratingTestPreview: (val) => set({ isGeneratingTestPreview: val }),

  setGenerationProgress: (progress) => {
    set((state) => ({
      generationProgress: { ...state.generationProgress, ...progress },
    }));
  },

  setIsGenerating: (generating) => set({ isGenerating: generating }),

  resetGenerationProgress: () => {
    set({
      generationProgress: {
        status: 'idle',
        total: 0,
        current: 0,
        percentage: 0,
      },
      isGenerating: false,
    });
  },

  setCustomFonts: (fonts) => set({ customFonts: fonts }),

  addCustomFont: (font) => {
    set((state) => ({
      customFonts: [...state.customFonts.filter((f) => f.name !== font.name), font],
    }));
  },

  removeCustomFont: (fontId) => {
    set((state) => ({
      customFonts: state.customFonts.filter((f) => f.id !== fontId),
    }));
  },

  loadTemplate: (template) => {
    set({
      templateId: template.id,
      templateName: template.name,
      templateDescription: template.description || '',
      backgroundImage: template.backgroundImageDataUrl || null,
      backgroundMeta: template.backgroundMeta || null,
      fields: template.fields || DEFAULT_FIELDS,
      outputSettings: template.outputSettings || DEFAULT_OUTPUT_SETTINGS,
      selectedFieldId: template.fields[0]?.id || null,
      past: [],
      future: [],
    });
  },

  resetToDefault: () => {
    set({
      templateId: null,
      templateName: 'Untitled Certificate Template',
      templateDescription: 'Computer Engineers\' Society Event Certificate',
      backgroundImage: null,
      backgroundMeta: null,
      fields: DEFAULT_FIELDS,
      selectedFieldId: 'field-name',
      outputSettings: DEFAULT_OUTPUT_SETTINGS,
      past: [],
      future: [],
      spreadsheetFileName: null,
      spreadsheetHeaders: [],
      spreadsheetRows: [],
      columnMapping: {},
      validationReport: null,
      testPreviews: [],
    });
  },
}));
