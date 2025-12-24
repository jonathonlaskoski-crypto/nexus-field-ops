// Loading Spinner Component

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

export function LoadingSpinner({ message = 'Loading...', size = 24 }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <Loader2 className="animate-spin text-amber-500" size={size} />
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
        {message}
      </p>
    </div>
  );
}
