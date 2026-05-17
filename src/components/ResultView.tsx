import React from 'react';
import { motion } from 'motion/react';
import { Palette, CheckCircle2, AlertCircle, Info, Scissors, Shirt, Sparkles } from 'lucide-react';
import { PersonalColorResponse } from '../types';

interface ResultViewProps {
  data: PersonalColorResponse;
}

export const ResultView: React.FC<ResultViewProps> = ({ data }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col md:flex-row min-h-[600px] border border-brand-ink/10 bg-brand-background shadow-2xl rounded-sm overflow-hidden"
    >
      {/* Left Column: Image & Feature Analysis */}
      <section className="w-full md:w-[320px] border-b md:border-b-0 md:border-r border-brand-ink/10 p-8 md:p-10 flex flex-col">
        <div className="w-full aspect-[4/5] bg-brand-card border border-brand-ink/5 relative mb-8 flex items-center justify-center rounded-sm overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1A1A1A 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
          <div className="text-center z-10 p-4">
            <div className="w-20 h-20 rounded-full border border-brand-ink/20 mx-auto mb-4 flex items-center justify-center italic text-xs opacity-40">Analyzed</div>
            <span className="text-[10px] uppercase tracking-widest font-bold">Ref: {data.tone_direction.toUpperCase()}</span>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-ink pb-1 mb-4 flex justify-between items-center">
              Skin Analysis <Palette className="w-3 h-3 opacity-30" />
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-brand-ink/5 pb-1">
                <span className="opacity-50 text-[11px] uppercase">Tone</span>
                <span className="font-medium">{data.analysis.skin_tone}</span>
              </div>
              <div className="flex justify-between border-b border-brand-ink/5 pb-1">
                <span className="opacity-50 text-[11px] uppercase">Brightness</span>
                <span className="font-medium">{data.analysis.brightness}</span>
              </div>
              <div className="flex justify-between border-b border-brand-ink/5 pb-1">
                <span className="opacity-50 text-[11px] uppercase">Saturation</span>
                <span className="font-medium">{data.analysis.saturation}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-widest font-bold border-b border-brand-ink pb-1 mb-3">Overall Impression</h3>
            <div className="text-sm italic text-brand-ink/80 leading-relaxed md:pr-4">
              <p>"{data.analysis.overall_impression}"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Results & Recommendations */}
      <section className="flex-1 p-8 md:p-10 flex flex-col space-y-10">
        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline gap-4 mb-1">
            <span className="text-4xl md:text-6xl font-serif font-light tracking-tight">{data.sub_type || data.season_type}</span>
            <span className="text-lg md:text-xl font-serif italic opacity-40">{data.tone_direction} tone</span>
          </div>
          <p className="text-lg opacity-80 max-w-xl font-serif">{data.summary}</p>
        </div>

        {/* Color Palettes */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 flex-1">
          {/* Best Palette */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-600 mr-2"></span>Best Palette
            </h4>
            <div className="grid grid-cols-4 gap-4">
              {data.recommended_colors.map((color, idx) => (
                <div key={idx} className="group flex flex-col items-center">
                  <div 
                    className="w-full aspect-square rounded-full mb-2 shadow-sm border border-brand-ink/5 transition-transform hover:scale-110" 
                    style={{ backgroundColor: color.hex }} 
                  />
                  <div className="text-[9px] text-center opacity-60 uppercase tracking-tighter truncate w-full">{color.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Worst Palette */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-red-600 mr-2"></span>Colors to Avoid
            </h4>
            <div className="flex gap-2 flex-wrap mb-4">
              {data.avoid_colors.map((color, idx) => (
                <div 
                  key={idx} 
                  className="w-8 h-8 rounded-sm shadow-sm border border-brand-ink/5" 
                  style={{ backgroundColor: color.hex }} 
                  title={color.name}
                />
              ))}
            </div>
            <p className="text-[10px] leading-relaxed opacity-60 italic max-w-xs">
              {data.avoid_colors[0]?.reason || "Avoid overly vibrant or contrasting tones that may overpower your natural clarity."}
            </p>
          </div>
        </div>

        {/* Styling Tips Summary Bar */}
        <div className="mt-auto border-t border-brand-ink pt-8 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-8">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-tighter opacity-40 block mb-2">Makeup</span>
            <p className="text-[11px] font-medium leading-relaxed">
              {data.makeup_recommendations.lip[0]}, {data.makeup_recommendations.eyeshadow[0]}
            </p>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold tracking-tighter opacity-40 block mb-2">Hair</span>
            <p className="text-[11px] font-medium leading-relaxed">
              {data.hair_recommendations.join(', ')}
            </p>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold tracking-tighter opacity-40 block mb-2">Fashion</span>
            <p className="text-[11px] font-medium leading-relaxed">
              {data.fashion_recommendations.join(', ')}
            </p>
          </div>
          <div className="hidden xl:flex items-center justify-end">
            <div className="w-14 h-14 rounded-full border border-brand-ink flex items-center justify-center text-[10px] font-serif italic text-center px-2 leading-tight">
              Aura {data.confidence}%
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
