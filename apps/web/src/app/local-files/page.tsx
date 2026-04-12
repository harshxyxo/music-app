'use client';

import { FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LocalFilesPage() {
  return (
    <div 
      className="h-full overflow-y-auto custom-scrollbar p-6 pb-24 flex flex-col items-center justify-center outline-none"
      tabIndex={0}
      onMouseEnter={(e) => e.currentTarget.focus()}
    >
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="w-20 h-20 rounded-full bg-black/[0.03] flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-[var(--text-primary)] mb-1">Local Files</h1>
        <p className="text-[var(--text-muted)] text-xs font-medium max-w-xs">
          This feature is coming soon. You&apos;ll be able to play audio files from your device directly in Groovra.
        </p>
      </motion.div>
    </div>
  );
}
