// Tech View Component - Job execution interface

import React from 'react';
import { Navigation } from 'lucide-react';
import { Job } from '../types';
import { JobCard } from './JobCard';
import { StepItem } from './StepItem';

interface TechViewProps {
  job: Job;
  onStepComplete: (stepId: string, mediaData?: string, notes?: string) => void;
  onFinalizeReport: () => void;
  onNavigate: () => void;
}

export function TechView({
  job,
  onStepComplete,
  onFinalizeReport,
  onNavigate,
}: TechViewProps) {
  const allStepsComplete = job.steps.every((s) => s.completed);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Job Card */}
      <JobCard job={job} />

      {/* Step Engine */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
            Operational Walkthrough
          </h3>
          <button
            onClick={onNavigate}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black uppercase rounded-lg border border-zinc-700 transition-all text-amber-500"
          >
            <Navigation size={14} /> Navigate Site
          </button>
        </div>
        {job.steps.map((step, idx) => (
          <StepItem
            key={step.id}
            step={step}
            index={idx}
            onComplete={onStepComplete}
          />
        ))}
      </div>

      {/* Completion Logic */}
      <div className="pt-10 flex flex-col items-center">
        {allStepsComplete ? (
          <button
            onClick={onFinalizeReport}
            className="w-full max-w-md bg-emerald-600 hover:bg-emerald-500 text-black py-6 rounded-2xl font-black text-xs tracking-[0.2em] shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95 transition-all"
          >
            GENERATE FINAL FIELD REPORT
          </button>
        ) : (
          <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl w-full">
            <p className="text-[10px] font-black uppercase text-zinc-700 tracking-widest">
              Walkthrough In Progress // {job.steps.filter((s) => s.completed).length}{' '}
              of {job.steps.length} Steps Logged
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
