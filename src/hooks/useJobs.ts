// Custom hook for job management

import { useState, useEffect, useCallback } from 'react';
import { Job, JobStep } from '../types';
import { storage } from '../utils/storage';

const DEFAULT_JOBS: Job[] = [
  {
    id: 'JOB-901',
    customer: 'Central Grid Hub',
    address: '400 Industrial Way, Austin TX',
    description: 'B1-Phase Capacitor Replacement & Thermal Scan',
    status: 'pending',
    priority: 'high',
    createdAt: Date.now(),
    steps: [
      {
        id: '1',
        instruction: 'Perform Lock-out/Tag-out (LOTO) on Main Panel B1.',
        completed: false,
        mediaRequired: true,
      },
      {
        id: '2',
        instruction: 'Verify zero voltage using fluke meter.',
        completed: false,
        mediaRequired: true,
      },
      {
        id: '3',
        instruction: 'Replace faulty capacitor units with PN-772.',
        completed: false,
        mediaRequired: true,
      },
    ],
  },
];

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = storage.getJobs();
    return saved.length > 0 ? saved : DEFAULT_JOBS;
  });

  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Persist to storage whenever jobs change
  useEffect(() => {
    storage.saveJobs(jobs);
  }, [jobs]);

  const activeJob = jobs.find((j) => j.id === activeJobId) || null;

  const updateJob = useCallback((jobId: string, updates: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, ...updates } : job))
    );
  }, []);

  const completeStep = useCallback(
    (jobId: string, stepId: string, mediaData?: string, notes?: string) => {
      setJobs((prev) =>
        prev.map((job) => {
          if (job.id === jobId) {
            return {
              ...job,
              steps: job.steps.map((step) =>
                step.id === stepId
                  ? {
                      ...step,
                      completed: true,
                      mediaCaptured: mediaData,
                      notes,
                    }
                  : step
              ),
            };
          }
          return job;
        })
      );
    },
    []
  );

  const completeJob = useCallback((jobId: string, aiSummary?: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: 'completed' as const,
              completedAt: Date.now(),
              aiSummary,
            }
          : job
      )
    );
  }, []);

  const addJob = useCallback((job: Job) => {
    setJobs((prev) => [...prev, job]);
  }, []);

  const deleteJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
  }, []);

  const getJobStats = useCallback(() => {
    return {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === 'pending').length,
      active: jobs.filter((j) => j.status === 'active').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
    };
  }, [jobs]);

  return {
    jobs,
    activeJob,
    activeJobId,
    setActiveJobId,
    updateJob,
    completeStep,
    completeJob,
    addJob,
    deleteJob,
    getJobStats,
  };
}
