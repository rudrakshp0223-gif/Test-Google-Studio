/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  ChevronRight, 
  Search, 
  Settings, 
  Moon, 
  Sun,
  Terminal,
  Layers,
  Zap,
  MoreVertical
} from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useOptimizerStore } from './store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Sidebar = ({ isDark, toggleDark }: { isDark: boolean, toggleDark: () => void }) => {
  const { currentView, setView } = useOptimizerStore();
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 hover:w-64 transition-all duration-300 overflow-hidden border-r border-white/10 bg-surface z-50 group flex flex-col">
      <div className="flex items-center h-16 px-4 border-b border-white/10">
        <div className="min-w-[2rem] h-8 bg-primary rounded flex items-center justify-center text-surface font-bold">
          NY
        </div>
        <span className="ml-4 font-display font-bold text-content opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
          NYC OPTIMIZER
        </span>
      </div>
      <nav className="flex-1 py-4">
        {[
          { icon: Terminal, label: 'Dashboard', id: 'dashboard' },
          { icon: Layers, label: 'Matrix', id: 'matrix' },
          { icon: Zap, label: 'Fast Track', id: 'fasttrack' },
          { icon: Settings, label: 'Settings', id: 'settings' },
        ].map((item) => (
          <button 
            key={item.id} 
            onClick={() => setView(item.id as any)}
            className={cn(
              "w-full flex items-center px-4 py-3 transition-colors group/item",
              currentView === item.id ? "text-primary bg-white/5" : "text-content/60 hover:text-primary hover:bg-white/5"
            )}
          >
            <item.icon size={20} />
            <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={toggleDark}
          className="w-full flex items-center text-content/60 hover:text-primary transition-colors"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span className="ml-4 font-medium opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>
    </aside>
  );
};

const IdeaRoulette = () => {
  const { setManifest, startOptimization, isOptimizing } = useOptimizerStore();
  
  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setManifest(acceptedFiles[0]);
        startOptimization();
      }
    },
    accept: { 'application/json': ['.json'] },
    multiple: false,
    disabled: isOptimizing
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mt-20"
    >
      <div 
        {...getRootProps()} 
        className={cn(
          "group relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-16 transition-all cursor-pointer min-h-[400px] glass",
          isDragActive ? "border-primary bg-primary/5" : "border-content/10 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <div className="mb-6 inline-flex p-4 rounded-2xl bg-primary/10 text-primary">
            <Upload size={40} />
          </div>
          <h3 className="text-3xl font-display font-bold mb-4">Idea Roulette</h3>
          <p className="text-content/60 text-lg max-w-md mx-auto">
            {isDragActive 
              ? "Drop the manifest to begin..." 
              : "Drag & drop your test manifest (.json) here, or click to browse. Don't keep me waitin'."}
          </p>
        </div>
        {isOptimizing && (
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold text-primary">Schleppin' your files... hold your horses.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const OverlapMatrix = ({ results }: { results: any[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedCell, setSelectedCell] = useState<any>(null);

  const rowVirtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
      <div className="lg:col-span-2 flex flex-col glass rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-display font-bold">Redundancy Matrix</h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {results.length} NODES
            </span>
          </div>
        </div>
        
        <div ref={parentRef} className="flex-1 overflow-auto p-4 custom-scrollbar">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = results[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  onClick={() => setSelectedCell(item)}
                  className={cn(
                    "absolute top-0 left-0 w-full p-4 mb-2 rounded-xl flex items-center justify-between cursor-pointer transition-all",
                    selectedCell?.nodeId === item.nodeId ? "bg-primary text-surface" : "hover:bg-white/5 bg-white/2"
                  )}
                  style={{
                    height: `${virtualRow.size - 8}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                      selectedCell?.nodeId === item.nodeId ? "bg-surface/20" : "bg-primary/10 text-primary"
                    )}>
                      {virtualRow.index + 1}
                    </div>
                    <div>
                      <div className="font-bold truncate max-w-[200px]">{item.nodeName}</div>
                      <div className={cn(
                        "text-xs",
                        selectedCell?.nodeId === item.nodeId ? "text-surface/60" : "text-content/40"
                      )}>
                        ID: {item.nodeId}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-lg font-bold">{(item.similarityScore * 100).toFixed(0)}%</div>
                      <div className={cn(
                        "text-[10px] uppercase font-bold tracking-wider",
                        selectedCell?.nodeId === item.nodeId ? "text-surface/60" : "text-content/40"
                      )}>Overlap</div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-bold uppercase",
                      item.recommendation.includes('Prune') ? "bg-danger text-white" : "bg-primary/20 text-primary"
                    )}>
                      {item.recommendation.split('/')[0]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-8 flex flex-col">
        <AnimatePresence mode="wait">
          {selectedCell ? (
            <motion.div 
              key={selectedCell.nodeId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-2xl font-display font-bold">Details</h3>
                <button onClick={() => setSelectedCell(null)} className="text-content/40 hover:text-content">
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                <div>
                  <label className="text-[10px] uppercase font-bold text-content/40 mb-1 block">Test Name</label>
                  <div className="text-xl font-bold">{selectedCell.nodeName}</div>
                </div>

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="text-[10px] uppercase font-bold text-primary mb-2">Similarity Score</div>
                  <div className="text-4xl font-display font-extrabold text-primary">
                    {(selectedCell.similarityScore * 100).toFixed(1)}%
                  </div>
                  <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${selectedCell.similarityScore * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-content/40 mb-2 block">Recommendation</label>
                  <div className={cn(
                    "p-4 rounded-xl font-bold border",
                    selectedCell.recommendation.includes('Prune') 
                      ? "bg-danger/10 border-danger/20 text-danger" 
                      : "bg-primary/10 border-primary/20 text-primary"
                  )}>
                    {selectedCell.recommendation}
                  </div>
                </div>

                {selectedCell.manualReviewRequired && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex gap-3">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-sm font-medium">Yo, you left a spot blank. I ain't a mind reader. This needs manual review.</p>
                  </div>
                )}
              </div>

              <button className="w-full py-4 bg-primary text-surface font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-8">
                Yeah, Yeah, Do It
              </button>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-content/20 mb-4">
                <Search size={32} />
              </div>
              <h4 className="font-bold text-content/40">Select a node to get the scoop.</h4>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FasttrackView = () => {
  const { results } = useOptimizerStore();
  
  if (!results) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-content/40">
      <Zap size={48} className="mb-4 opacity-20" />
      <p className="font-bold">Nothin' to fast track yet. Upload a manifest first.</p>
    </div>
  );

  const highConfidence = results.filter(r => r.confidenceScore > 0.9 && r.recommendation === 'Prune');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="p-8 rounded-3xl bg-primary/10 border border-primary/20">
        <h3 className="text-2xl font-bold mb-2">Fast Track Optimization</h3>
        <p className="text-content/60 mb-6">We found {highConfidence.length} redundancies we're 90%+ sure about. No review needed.</p>
        <button className="px-8 py-4 rounded-2xl bg-primary text-surface font-bold hover:scale-105 transition-transform">
          Yeah, Yeah, Prune 'Em All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highConfidence.map(item => (
          <div key={item.nodeId} className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold">{item.nodeName}</h4>
              <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded">{(item.confidenceScore * 100).toFixed(0)}% Sure</span>
            </div>
            <p className="text-sm text-content/40">Redundant with {item.closestMatchId}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const SettingsView = () => {
  const { settings, updateSettings, history } = useOptimizerStore();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-12">
      <section>
        <h3 className="text-2xl font-bold mb-6">Optimizer Settings</h3>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between">
              <label className="font-bold">Similarity Threshold</label>
              <span className="font-mono text-primary">{Math.round(settings.similarityThreshold * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="0.99" 
              step="0.01"
              value={settings.similarityThreshold}
              onChange={(e) => updateSettings({ similarityThreshold: parseFloat(e.target.value) })}
              className="w-full accent-primary"
            />
            <p className="text-sm text-content/40">Higher means we only flag stuff that's practically identical.</p>
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <h4 className="font-bold">Auto-Prune</h4>
              <p className="text-sm text-content/40">Automatically delete high-confidence redundancies.</p>
            </div>
            <button 
              onClick={() => updateSettings({ autoPrune: !settings.autoPrune })}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                settings.autoPrune ? "bg-primary" : "bg-white/20"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                settings.autoPrune ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-bold mb-6">Recent Schlepps</h3>
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-content/40 italic">No history yet. Get to work.</p>
          ) : (
            history.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="font-bold">{item.fileName}</p>
                  <p className="text-xs text-content/40">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-primary">-{item.savings}%</p>
                  <p className="text-[10px] uppercase tracking-widest text-content/40">Savings</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const { results, isOptimizing, error, reset, manifest, currentView, setView } = useOptimizerStore();

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    if (results && !isOptimizing) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [results, isOptimizing]);

  const renderContent = () => {
    if (currentView === 'settings') return <SettingsView />;
    if (currentView === 'fasttrack') return <FasttrackView />;
    
    if (!results) return <IdeaRoulette />;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <OverlapMatrix results={results} />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-surface text-content selection:bg-primary selection:text-surface transition-colors duration-300">
      <Sidebar isDark={isDark} toggleDark={() => setIsDark(!isDark)} />
      
      <main className="pl-16 min-h-screen">
        <div className="max-w-7xl mx-auto p-8 lg:p-12">
          <header className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-5xl font-display font-extrabold tracking-tighter mb-2">
                {currentView.toUpperCase()}
              </h1>
              <p className="text-content/60 font-medium">
                {manifest ? `Analyzing ${manifest.name}` : "Stop wasting time. Optimize your test suite."}
              </p>
            </div>
            {results && (
              <button 
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-content/60 hover:text-content transition-all font-bold"
              >
                <Trash2 size={18} />
                Forget It
              </button>
            )}
          </header>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-danger/10 border border-danger/20 text-danger mb-8 flex items-center gap-4"
              >
                <AlertCircle size={24} />
                <p className="font-bold">{error}</p>
              </motion.div>
            )}

            {renderContent()}
          </AnimatePresence>
        </div>
      </main>

      {/* Toast-like notification for success */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 right-8 p-4 rounded-2xl bg-primary text-surface shadow-2xl flex items-center gap-3 z-[100]"
          >
            <CheckCircle2 size={24} />
            <span className="font-bold">Boom. Saved you 20% on CI costs. You’re welcome.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
