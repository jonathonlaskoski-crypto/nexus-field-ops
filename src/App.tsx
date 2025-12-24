// Main App Component - Refactored

import React, { useState } from 'react';
import { Menu, Cpu } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { TechView } from './components/TechView';
import { ManagerDashboard } from './components/ManagerDashboard';
import { AIMessagePanel } from './components/AIMessagePanel';
import { AIInputBar } from './components/AIInputBar';
import { EmptyState } from './components/EmptyState';
import { useJobs } from './hooks/useJobs';
import { useAI } from './hooks/useAI';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { storage } from './utils/storage';
import { UserRole } from './types';

function App() {
  const [role, setRole] = useState<UserRole>(() => storage.getRole());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    jobs,
    activeJob,
    activeJobId,
    setActiveJobId,
    completeStep,
    completeJob,
  } = useJobs();

  const {
    messages,
    isLoading,
    failCount,
    executeTask,
    clearMessages,
    resetFailCount,
  } = useAI();

  const isOnline = useOnlineStatus();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    storage.saveRole(newRole);
  };

  const handleNavigate = () => {
    if (activeJob) {
      executeTask(
        `Find the best route to ${activeJob.address} starting from my current location.`,
        'map'
      );
    }
  };

  const handleFinalizeReport = async () => {
    if (!activeJob) return;

    const allStepsDone = activeJob.steps.every((s) => s.completed);
    if (!allStepsDone) {
      alert('All safety and technical steps must be completed before report finalization.');
      return;
    }

    const reportPrompt = `Verify the completion of Job ${activeJob.id}. 
    Customer: ${activeJob.customer}. 
    Steps Summary: ${activeJob.steps.map((s) => s.instruction + ' (VERIFIED)').join(', ')}. 
    Generate a professional field service report.`;

    await executeTask(reportPrompt, 'report');
    completeJob(activeJob.id);
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-full bg-[#0a0a0f] text-zinc-300 font-mono overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          role={role}
          onRoleChange={handleRoleChange}
          jobs={jobs}
          activeJobId={activeJobId}
          onJobSelect={setActiveJobId}
          isOnline={isOnline}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative bg-[#07070a] selection:bg-amber-500/30">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-[#0f0f14]/80 backdrop-blur-md z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Menu size={20} />
              </button>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">
                  Session Context
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-tighter">
                  {role === 'tech'
                    ? activeJob
                      ? `Task: ${activeJob.id}`
                      : 'Idle // Waiting for Dispatch'
                    : 'Oversight Hub'}
                </span>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed">
            {role === 'tech' && activeJob ? (
              <TechView
                job={activeJob}
                onStepComplete={completeStep}
                onFinalizeReport={handleFinalizeReport}
                onNavigate={handleNavigate}
              />
            ) : role === 'manager' ? (
              <ManagerDashboard jobs={jobs} failCount={failCount} />
            ) : (
              <EmptyState
                icon={Cpu}
                title="System Standby"
                description="Select an active job from the dispatch menu to begin"
              />
            )}
          </div>

          {/* AI Messages Overlay */}
          <AIMessagePanel messages={messages} onClose={clearMessages} />

          {/* Input Bar */}
          <AIInputBar
            onSubmit={(input) => executeTask(input, 'diagnostic')}
            isLoading={isLoading}
            isOnline={isOnline}
            failCount={failCount}
            onResetFailCount={resetFailCount}
            role={role}
          />
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
