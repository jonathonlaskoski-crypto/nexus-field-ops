// Sidebar Navigation Component - NVIDIA Enhanced
// Added: PWA install button, haptic feedback, accessibility

import React from 'react';
import {
  X,
  HardHat,
  LayoutDashboard,
  CheckCircle2,
  Wifi,
  WifiOff,
  Download,
} from 'lucide-react';
import { Job, UserRole } from '../types';
import { usePWA } from '../hooks/usePWA';
import { HapticService } from '../services/haptic.service';
import { logEvent } from '../services/firebase.service';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  jobs: Job[];
  activeJobId: string | null;
  onJobSelect: (jobId: string) => void;
  isOnline: boolean;
}

export function Sidebar({
  isOpen,
  onClose,
  role,
  onRoleChange,
  jobs,
  activeJobId,
  onJobSelect,
  isOnline,
}: SidebarProps) {
  const { isInstallable, isInstalled, promptInstall } = usePWA();

  const handleJobSelect = (jobId: string) => {
    HapticService.impact();
    logEvent('job_select_sidebar', { job_id: jobId });
    onJobSelect(jobId);
    onRoleChange('tech');
    onClose();
  };

  const handleRoleChange = (newRole: UserRole) => {
    HapticService.impact();
    logEvent('role_change', { from: role, to: newRole });
    onRoleChange(newRole);
  };

  const handleInstallPWA = async () => {
    HapticService.heavyImpact();
    const installed = await promptInstall();
    logEvent('pwa_install_attempt', { success: installed });
    
    if (installed) {
      HapticService.notification('success');
    }
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 w-[300px] bg-[#0f0f14] border-r border-zinc-800 p-6 z-50 flex flex-col gap-6 transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-black font-black">
            N
          </div>
          <h1 className="font-black text-sm tracking-widest text-white uppercase">
            Nexus Ops
          </h1>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-zinc-600 hover:text-white transition-colors"
          aria-label="Close sidebar"
          style={{ minWidth: '40px', minHeight: '40px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* PWA Install Button */}
      {isInstallable && !isInstalled && (
        <button
          onClick={handleInstallPWA}
          className="w-full flex items-center gap-3 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all shadow-lg"
          aria-label="Install Nexus Ops as app"
          style={{ minHeight: '56px' }}
        >
          <Download size={18} aria-hidden="true" />
          <div className="flex-1 text-left">
            <div className="text-xs font-black uppercase tracking-widest">
              Install App
            </div>
            <div className="text-[9px] text-amber-500/70">Native experience</div>
          </div>
        </button>
      )}

      {/* Role Selector */}
      <div className="space-y-2 mt-4" role="group" aria-label="User role selector">
        <button
          onClick={() => handleRoleChange('tech')}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
            role === 'tech'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-lg'
              : 'border-transparent text-zinc-500 hover:bg-zinc-800'
          }`}
          aria-pressed={role === 'tech'}
          aria-label="Switch to field technician view"
          style={{ minHeight: '56px' }}
        >
          <HardHat size={18} aria-hidden="true" />
          <span className="text-xs font-black uppercase tracking-widest">
            Field Technician
          </span>
        </button>
        
        <button
          onClick={() => handleRoleChange('manager')}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
            role === 'manager'
              ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-lg'
              : 'border-transparent text-zinc-500 hover:bg-zinc-800'
          }`}
          aria-pressed={role === 'manager'}
          aria-label="Switch to manager hub view"
          style={{ minHeight: '56px' }}
        >
          <LayoutDashboard size={18} aria-hidden="true" />
          <span className="text-xs font-black uppercase tracking-widest">
            Manager Hub
          </span>
        </button>
      </div>

      {/* Job Queue */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-6">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">
            Current Queue
          </span>
          <span className="text-[10px] font-black text-amber-500" aria-live="polite">
            {jobs.filter((j) => j.status !== 'completed').length} Jobs
          </span>
        </div>
        
        <div className="space-y-3" role="list" aria-label="Job queue">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => handleJobSelect(job.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                activeJobId === job.id
                  ? 'bg-zinc-800 border-zinc-600 shadow-md'
                  : 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50'
              }`}
              aria-label={`Job ${job.id} for ${job.customer} at ${job.address}${job.status === 'completed' ? ', completed' : ''}`}
              aria-current={activeJobId === job.id}
              role="listitem"
              style={{ minHeight: '72px' }}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black text-amber-500">
                  {job.id}
                </span>
                {job.status === 'completed' && (
                  <CheckCircle2 size={12} className="text-emerald-500" aria-label="Completed" />
                )}
              </div>
              <div className="text-xs font-bold text-white truncate">
                {job.customer}
              </div>
              <div className="text-[9px] text-zinc-500 mt-1 truncate">
                {job.address}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Connection Status */}
      <div className="pt-4 border-t border-zinc-800">
        <div
          className={`p-4 rounded-xl border flex flex-col gap-2 ${
            isOnline
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-red-500/20 bg-red-500/5'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Uplink Status
            </span>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi size={14} className="text-emerald-500" aria-label="Online" />
              ) : (
                <WifiOff size={14} className="text-red-500" aria-label="Offline" />
              )}
              <div
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
                aria-hidden="true"
              />
            </div>
          </div>
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
            {isOnline ? 'Global Sync: Active' : 'Offline Mode: Enabled'}
          </p>
        </div>
      </div>
    </aside>
  );
}
