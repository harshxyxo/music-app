'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GlobalHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full px-8 py-6 flex items-center justify-between bg-black/10 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white/40 hover:text-white transition-all shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          onClick={() => router.forward()}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white/40 hover:text-white transition-all shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="flex-1 max-w-xl mx-8 relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff] transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search for tracks, artists..."
          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-[#ba9eff]/30 transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Profile/Upgrade placeholder if needed */}
      </div>
    </header>
  );
}
