'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BackButton() {
  const router = useRouter();

  return (
    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.back()}
      className="p-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white backdrop-blur-xl transition-all shadow-xl flex items-center justify-center group"
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
    </motion.button>
  );
}
