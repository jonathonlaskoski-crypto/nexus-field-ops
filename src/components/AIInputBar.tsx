// AI Input Bar Component

import React, { useState, FormEvent } from 'react';
import { Send, Terminal, AlertCircle } from 'lucide-react';
import { UserCheck } from 'lucide-react';

interface AIInputBarProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  isOnline: boolean;
  failCount: number;
  onResetFailCount: () => void;
  role: string;
}

export function AIInputBar({
  onSubmit,
  isLoading,
  isOnline,
  failCount,
  onResetFailCount,
  role,
}: AIInputBarProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && isOnline && failCount < 3) {
      onSubmit(input);
      setInput('');
    }
  };

  const isDisabled = !input.trim() || isLoading || !isOnline || failCount >= 3;

  return (
    <div className="p-6 lg:p-12 lg:pt-4 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto group">
        <div
          className={`relative bg-zinc-900/80 border rounded-2xl flex items-center p-2 focus-within:border-amber-500/50 transition-all shadow-2xl backdrop-blur-xl ${
            !isOnline ? 'border-red-900/30' : 'border-zinc-800'
          }`}
        >
          <div className={`pl-4 ${isOnline ? 'text-zinc-700' : 'text-red-900'}`}>
            {failCount >= 3 ? (
              <AlertCircle className="text-red-500" size={20} />
            ) : (
              <Terminal size={20} />
            )}
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              failCount >= 3
                ? 'SYSTEM FAULT: MULTIPLE FAILURES. RECORDING VOICEMAIL...'
                : 'Request technical assistance, schematics, or site info...'
            }
            disabled={isDisabled}
            className="flex-1 bg-transparent px-5 py-5 outline-none text-zinc-200 text-sm font-sans placeholder-zinc-800 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isDisabled}
            className="bg-amber-600 hover:bg-amber-500 text-black px-10 py-5 rounded-xl flex items-center gap-3 transition-all disabled:opacity-20 disabled:grayscale font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95"
          >
            {isLoading ? 'Processing' : 'Analyze'} <Send size={18} />
          </button>
        </div>
        {failCount >= 3 && (
          <div className="mt-4 p-4 bg-red-950/20 border border-red-900/50 rounded-xl flex items-center justify-between">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={14} /> AI Diagnostic Ceiling Reached. Manual Memo
              Required.
            </span>
            <button
              onClick={onResetFailCount}
              className="text-[9px] font-black text-white bg-red-600 px-3 py-1 rounded uppercase hover:bg-red-500 transition-colors"
            >
              Record & Dispatch Hub
            </button>
          </div>
        )}
        <div className="flex justify-between items-center mt-5 px-1">
          <p className="text-[8px] font-black text-zinc-800 tracking-[0.6em] uppercase flex items-center gap-2">
            <UserCheck size={10} /> {role.toUpperCase()}_IDENTITY_VERIFIED
          </p>
          <p className="text-[8px] font-black text-zinc-800 tracking-[0.2em] uppercase">
            E2E Field Encryption // V1.4_TAC
          </p>
        </div>
      </form>
    </div>
  );
}
