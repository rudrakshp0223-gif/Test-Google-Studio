import { create } from 'zustand';

interface MatrixRow {
  nodeId: string;
  nodeName: string;
  similarityScore: number;
  recommendation: string;
  confidenceScore: number;
  manualReviewRequired: boolean;
  closestMatchId: string | null;
}

export type ViewType = 'dashboard' | 'matrix' | 'fasttrack' | 'settings';

interface Settings {
  similarityThreshold: number;
  autoPrune: boolean;
}

interface OptimizerState {
  manifest: File | null;
  isOptimizing: boolean;
  results: MatrixRow[] | null;
  error: string | null;
  currentView: ViewType;
  settings: Settings;
  history: { date: string, fileName: string, savings: number }[];
  setManifest: (file: File | null) => void;
  startOptimization: () => Promise<void>;
  reset: () => void;
  setView: (view: ViewType) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useOptimizerStore = create<OptimizerState>((set, get) => ({
  manifest: null,
  isOptimizing: false,
  results: null,
  error: null,
  currentView: 'dashboard',
  settings: {
    similarityThreshold: 0.8,
    autoPrune: false,
  },
  history: [],
  setManifest: (file) => set({ manifest: file, error: null }),
  setView: (view) => set({ currentView: view }),
  updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
  startOptimization: async () => {
    const { manifest } = get();
    if (!manifest) return;

    set({ isOptimizing: true, error: null });

    try {
      const text = await manifest.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("What is this? I can’t read this garbage. Give me a JSON or keep walkin’.");
      }

      const response = await fetch('/api/process-manifest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manifest: Array.isArray(data) ? data : [data] }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        const newHistory = {
          date: new Date().toLocaleString(),
          fileName: manifest.name,
          savings: Math.floor(Math.random() * 15) + 10 // Mock savings
        };
        set((state) => ({ 
          results: result.matrixRows, 
          isOptimizing: false,
          currentView: 'matrix',
          history: [newHistory, ...state.history].slice(0, 10)
        }));
      } else {
        throw new Error(result.message || "Something went south.");
      }
    } catch (err: any) {
      set({ error: err.message, isOptimizing: false });
    }
  },
  reset: () => set({ manifest: null, results: null, error: null, isOptimizing: false, currentView: 'dashboard' }),
}));
