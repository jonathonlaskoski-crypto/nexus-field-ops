// Empty State Component

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 opacity-40">
      <Icon size={48} className="mb-4 text-zinc-800" />
      <h2 className="text-lg font-black uppercase tracking-[0.5em] text-zinc-700 mb-2">
        {title}
      </h2>
      {description && (
        <p className="text-xs uppercase tracking-widest text-zinc-800 mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-6 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
