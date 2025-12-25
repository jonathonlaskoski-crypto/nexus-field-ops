// Job Card Component - NVIDIA Enhanced
// Added: Haptic feedback, Firebase analytics, touch targets, accessibility

import React, { memo, useCallback } from 'react';
import { Construction, MapPin } from 'lucide-react';
import { Job } from '../types';
import { HapticService } from '../services/haptic.service';
import { logEvent } from '../services/firebase.service';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

export const JobCard = memo(function JobCard({ job, onClick }: JobCardProps) {
  const handleClick = useCallback(() => {
    // Haptic feedback on tap
    HapticService.impact();
    
    // Track analytics
    logEvent('job_card_click', {
      job_id: job.id || 'unknown',
      customer: job.customer,
      priority: job.priority || 'Medium'
    });
    
    // Call parent handler
    onClick?.();
  }, [job, onClick]);

  return (
    <div 
      className="bg-[#0f0f14]/80 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md relative overflow-hidden cursor-pointer transition-all hover:border-amber-500/50 active:scale-[0.98]"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Job for ${job.customer}, ${job.description}`}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      style={{ minHeight: '120px' }} // Touch target friendly
    >
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
        <div 
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400"
          style={{ minHeight: '32px' }} // Touch friendly
        >
          <MapPin size={12} className="text-amber-500" aria-hidden="true" />
          <span aria-label={`Location: ${job.address}`}>{job.address}</span>
        </div>
        
        <div 
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase"
          style={{ minHeight: '32px' }}
        >
          Priority: <span className={
            job.priority === 'High' ? 'text-red-500' :
            job.priority === 'Low' ? 'text-green-500' :
            'text-yellow-500'
          }>{job.priority || 'Medium'}</span>
        </div>
      </div>
    </div>
  );
});
