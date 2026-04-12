'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useState, useEffect } from 'react';

export default function NotificationsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { recentPlayed } = usePlayerStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const notifications = [
    { icon: '🔥', title: 'New Releases Available', desc: 'Check out what\'s trending this week', time: '2m ago' },
    { icon: '🎵', title: 'Weekly Mix Updated', desc: 'Your personalized playlist is ready', time: '1h ago' },
    { icon: '❤️', title: 'Artist Update', desc: 'Arijit Singh released a new album', time: '3h ago' },
    { icon: '📊', title: 'Your Recap is Ready', desc: 'See your 2024 listening summary', time: '1d ago' },
    ...(mounted && recentPlayed.length > 0 ? [{ icon: '🎧', title: `You played "${recentPlayed[0]?.title}"`, desc: `by ${recentPlayed[0]?.artist}`, time: 'Just now' }] : []),
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-start justify-end p-4 pt-14" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="w-80 bg-[#1a1a1c] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-white">Activity</h3>
                <div className="w-1.5 h-1.5 rounded-full bg-[#ba9eff] animate-pulse" />
              </div>
              <button onClick={onClose} className="p-2 text-white/30 hover:text-white rounded-full hover:bg-white/10 transition-all"><X className="w-4 h-4" /></button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto no-scrollbar pb-4">
              {notifications.map((n, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex gap-4 p-5 hover:bg-white/[0.03] transition-colors cursor-pointer border-b border-white/5 last:border-0 group">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-lg border border-white/5 group-hover:scale-110 transition-transform">{n.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[10px] text-white uppercase tracking-wider mb-1 group-hover:text-[#ba9eff] transition-colors">{n.title}</p>
                    <p className="text-[10px] text-white/40 font-bold leading-relaxed">{n.desc}</p>
                    <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mt-2">{n.time}</p>
                  </div>
                </motion.div>
              ))}
              
              {notifications.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">No new activity</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
