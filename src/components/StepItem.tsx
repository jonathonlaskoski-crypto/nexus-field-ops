// Step Item Component

import React, { memo, useCallback } from 'react';
import { CheckCircle2, Camera } from 'lucide-react';
import { JobStep } from '../types';

interface StepItemProps {
  step: JobStep;
  index: number;
  onComplete: (stepId: string, mediaData?: string, notes?: string) => void;
}

export const StepItem = memo(function StepItem({ step, index, onComplete }: StepItemProps) {
  const handleComplete = useCallback(() => {
    onComplete(step.id);
  }, [step.id, onComplete]);

  return (
    <div
      className={`flex items-start gap-6 p-6 rounded-2xl border transition-all ${
        step.completed
          ? 'bg-zinc-900/20 border-emerald-500/20'
          : 'bg-[#0f0f14] border-zinc-800 shadow-xl'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${
          step.completed
            ? 'bg-emerald-500 text-black'
            : 'bg-zinc-800 text-zinc-400'
        }`}
      >
        {step.completed ? <CheckCircle2 size={16} /> : index + 1}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm font-bold mb-4 ${
            step.completed
              ? 'text-zinc-500 line-through'
              : 'text-zinc-200'
          }`}
        >
          {step.instruction}
        </p>
        {!step.completed && (
          <div className="flex gap-3">
            <button
              onClick={handleComplete}
              className="bg-amber-600 hover:bg-amber-500 text-black px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              Mark Complete
            </button>
            {step.mediaRequired && (
              <button className="flex items-center gap-2 px-4 py-2 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-[10px] font-black uppercase text-zinc-400 transition-all">
                <Camera size={14} /> Attach Proof
              </button>
            )}
          </div>
        )}
        {step.mediaCaptured && (
          <div className="mt-4 p-2 bg-zinc-900 rounded-lg border border-zinc-800 inline-block">
            <span className="text-[8px] font-black uppercase text-zinc-600">
              Attached Media // Verified
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
