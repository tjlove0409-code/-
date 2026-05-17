import React, { useState } from 'react';
import { Palette, Sparkles, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PhotoUpload } from './components/PhotoUpload';
import { ResultView } from './components/ResultView';
import { PersonalColorResponse } from './types';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PersonalColorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze the photo. Please try again.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen selection:bg-brand-ink selection:text-white">
      {/* Navigation / Header */}
      <header className="fixed top-0 inset-x-0 h-24 px-10 flex items-center justify-between z-50 bg-brand-background border-b border-brand-ink/10">
        <div className="flex flex-col cursor-pointer" onClick={reset}>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Personal Image Analysis</span>
          <h1 className="text-2xl font-serif italic flex items-center gap-2">
            Color Consultant <Palette className="w-4 h-4 opacity-50" />
          </h1>
        </div>
        <div className="max-w-[400px] text-right hidden md:block">
          <p className="text-[9px] leading-relaxed opacity-50 uppercase tracking-wider italic">
            {result?.disclaimer || "Disclaimer: Photo analysis is a reference and may vary by lighting, makeup, and camera quality."}
          </p>
        </div>
      </header>

      {/* Hero / Content */}
      <main className="pt-32 pb-20 px-6 min-h-[calc(100vh-40px)]">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="upload-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto text-center space-y-16 py-12"
            >
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-ink/10 text-[10px] uppercase tracking-[0.2em] font-bold opacity-60"
                >
                  <Sparkles className="w-3 h-3" /> Aura Spectrum Report
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                  className="text-7xl md:text-9xl font-serif font-light tracking-tight leading-[0.85] py-4"
                >
                  Refined<br />
                  <span className="italic pl-12 md:pl-24">Precision.</span>
                </motion.h2>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
              >
                <PhotoUpload onFileSelect={handleAnalyze} isLoading={loading} />
              </motion.div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-[11px] uppercase tracking-widest font-bold"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="result-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto"
            >
              <button 
                onClick={reset}
                className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" /> New Session
              </button>
              <ResultView data={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Bar */}
      <footer className="fixed bottom-0 inset-x-0 h-10 bg-brand-ink text-brand-background flex items-center justify-between px-10 text-[9px] uppercase tracking-[0.3em] font-medium z-50">
        <span>{result ? `Confidence: ${result.confidence}%` : 'Ready for analysis'}</span>
        <span className="hidden sm:inline">Personal Color AI Studio © 2024</span>
        <span>{result ? `ID: ${result.tone_direction.toUpperCase()}-${result.season_type.substring(0,2)}` : 'Awaiting subject'}</span>
      </footer>
    </div>
  );
}
