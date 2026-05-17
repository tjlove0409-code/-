import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PhotoUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onFileSelect, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div 
        className={`relative group cursor-pointer transition-all duration-500
          ${dragActive ? 'scale-[1.01] border-brand-ink/40 bg-brand-card' : 'border-brand-ink/10 bg-white/30'}
          aspect-[4/5] max-w-sm mx-auto rounded-sm border shadow-sm overflow-hidden flex flex-col items-center justify-center p-8`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleChange}
          disabled={isLoading}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full"
            >
              <img src={preview} alt="Profile" className="w-full h-full object-cover grayscale-[0.2]" />
              <div className="absolute inset-0 bg-brand-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <p className="text-white text-[10px] uppercase tracking-[0.2em] font-bold">Replace Subject Image</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 z-10"
            >
              <div className="w-20 h-20 rounded-full border border-brand-ink/10 flex items-center justify-center mx-auto transition-colors group-hover:border-brand-ink/40">
                <Camera className="w-6 h-6 weight-light opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif italic text-brand-ink/80">Upload Portrait</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Drag or Click to Start</p>
              </div>
              <div className="pt-8 flex flex-col items-center gap-1 opacity-20">
                <div className="w-12 h-px bg-brand-ink" />
                <span className="text-[8px] uppercase tracking-widest font-bold">Session Intake</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="absolute inset-0 bg-brand-background/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <Loader2 className="w-8 h-8 animate-spin mb-6 text-brand-ink/40" />
            <div className="text-center animate-pulse">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold block mb-1">Scanning Neural Patterns</span>
              <p className="font-serif italic text-sm opacity-60">Wait for final diagnostic...</p>
            </div>
          </div>
        )}
      </div>

      {preview && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={() => inputRef.current?.click()}
            className="px-8 py-3 text-[10px] font-bold tracking-[0.2em] uppercase border border-brand-ink/20 rounded-full hover:bg-brand-ink hover:text-brand-background transition-all"
          >
            Switch Subject
          </button>
        </motion.div>
      )}
    </div>
  );
};
