// Job Card Component

import React, { memo } from 'react';
import { Construction, MapPin } from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
}

export const JobCard = memo(function JobCard({ job }: JobCardProps) {
  return (
    <div className="bg-[#0f0f14]/80 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Construction size={120} />
      </div>
      <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">
        {job.customer}
      </h2>
      <p className="text-zinc-500 text-xs mb-6 max-w-lg leading-relaxed">
        {job.description}
      </p>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400">
          <MapPin size={12} className="text-amber-500" />
          {job.address}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase">
          Priority: {job.priority || 'Medium'}
        </div>
      </div>
    </div>
  );
});
