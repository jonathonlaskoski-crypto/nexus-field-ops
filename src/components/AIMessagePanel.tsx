// AI Message Panel Component

import React, { memo, useMemo } from 'react';
import { Brain, X } from 'lucide-react';
import { marked } from 'marked';
import { Message } from '../types';

interface AIMessagePanelProps {
  messages: Message[];
  onClose: () => void;
}

export const AIMessagePanel = memo(function AIMessagePanel({ messages, onClose }: AIMessagePanelProps) {
  // Memoize parsed messages to avoid re-parsing on every render
  const parsedMessages = useMemo(() => {
    return messages.map((m) => ({
      ...m,
      html: marked.parse(m.content) as string,
    }));
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-40">
      <div className="bg-[#121218] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-8">
        <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase">
            <Brain size={16} /> Nexus Intelligence Stream
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[300px] overflow-y-auto no-scrollbar prose prose-invert prose-sm">
          {parsedMessages.map((m, i) => (
            <div
              key={i}
              className="mb-4"
              dangerouslySetInnerHTML={{
                __html: m.html,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
