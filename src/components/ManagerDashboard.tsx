// Manager Dashboard Component

import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Job } from '../types';

interface ManagerDashboardProps {
  jobs: Job[];
  failCount: number;
}

export function ManagerDashboard({ jobs, failCount }: ManagerDashboardProps) {
  const stats = [
    {
      label: 'Active Sites',
      val: jobs.filter((j) => j.status === 'active').length + 1,
    },
    {
      label: 'Pending Dispatch',
      val: jobs.filter((j) => j.status === 'pending').length,
    },
    {
      label: 'Verified Reports',
      val: jobs.filter((j) => j.status === 'completed').length,
    },
    { label: 'Safety Alerts', val: failCount },
  ];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Manager Insights Card */}
      <div className="col-span-full bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl mb-4">
        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard className="text-blue-400" size={24} />
          <h2 className="text-lg font-black text-white uppercase tracking-widest">
            Fleet Intelligence
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-zinc-950 p-6 rounded-xl border border-zinc-800"
            >
              <div className="text-[10px] font-black text-zinc-600 uppercase mb-1">
                {stat.label}
              </div>
              <div className="text-2xl font-black text-white">{stat.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Job Cards */}
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-[#0f0f14] border border-zinc-800 p-6 rounded-2xl flex flex-col hover:border-blue-500/30 transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-black text-zinc-500 uppercase">
              {job.id}
            </span>
            <span
              className={`text-[9px] font-black uppercase ${
                job.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {job.status}
            </span>
          </div>
          <h4 className="text-sm font-black text-white uppercase mb-1">
            {job.customer}
          </h4>
          <p className="text-xs text-zinc-500 truncate mb-6">{job.address}</p>
          <div className="mt-auto space-y-2">
            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{
                  width: `${
                    (job.steps.filter((s) => s.completed).length /
                      job.steps.length) *
                    100
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-600">
              <span>Progress</span>
              <span>
                {Math.round(
                  (job.steps.filter((s) => s.completed).length /
                    job.steps.length) *
                    100
                )}
                %
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
