import React from 'react';
import { RotateCw } from 'lucide-react';

export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 animate-fadeIn">
      {/* Top subtle progress line */}
      <div className="fixed top-16 left-0 w-full h-0.5 bg-orange-100 dark:bg-stone-800 overflow-hidden z-50">
        <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 animate-[loadingBar_1.2s_ease-in-out_infinite]" />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-100/80 dark:bg-orange-950/50 flex items-center justify-center text-orange-500 shadow-sm">
          <RotateCw className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 tracking-wide uppercase">
          Memuat halaman...
        </p>
      </div>
    </div>
  );
}
