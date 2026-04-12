'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Music, User, LogOut, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { auth, signOut } from '../lib/firebase';
import { onAuthStateChanged, User as FBUser } from 'firebase/auth';
import Link from 'next/link';

export default function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { volume, setVolume, likedSongs, recentPlayed, customPlaylists } = usePlayerStore();
  const [quality, setQuality] = useState<'auto' | 'high' | 'low'>('high');
  const [user, setUser] = useState<FBUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-start justify-end p-4 pt-14" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="w-72 bg-white rounded-2xl p-5 shadow-xl border border-black/5"
            onClick={e => e.stopPropagation()}
          >
            {/* Account */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-black/5">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-black/5 flex-shrink-0">
                {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[var(--text-primary)] truncate">{user?.displayName || 'Guest'}</p>
                <p className="text-[9px] font-bold text-[var(--accent-green)] uppercase tracking-widest">Premium</p>
              </div>
            </div>

            {/* Quick Stats */}
            {mounted && (
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {[
                  { label: 'Liked', value: likedSongs.length },
                  { label: 'Played', value: recentPlayed.length },
                  { label: 'Lists', value: customPlaylists.length },
                ].map((s, i) => (
                  <div key={i} className="text-center p-2 bg-black/[0.02] rounded-xl">
                    <p className="text-base font-black text-[var(--text-primary)]">{s.value}</p>
                    <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Audio Quality */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-1.5 text-[var(--text-muted)]"><Music className="w-3 h-3" /><span className="text-[9px] font-bold uppercase tracking-widest">Quality</span></div>
              <div className="flex gap-1">
                {(['auto', 'high', 'low'] as const).map(q => (
                  <button key={q} onClick={() => setQuality(q)} className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-bold transition-all ${quality === q ? 'bg-[var(--accent-green)] text-white' : 'bg-black/[0.03] text-[var(--text-muted)] hover:bg-black/[0.06]'}`}>
                    {q === 'auto' ? 'Auto' : q === 'high' ? '320kbps' : '128kbps'}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-1.5 text-[var(--text-muted)]"><Volume2 className="w-3 h-3" /><span className="text-[9px] font-bold uppercase tracking-widest">Volume · {Math.round(volume * 100)}%</span></div>
              <div className="relative h-1.5 bg-black/[0.06] rounded-full">
                <div className="absolute left-0 h-1.5 bg-[var(--accent-green)] rounded-full" style={{ width: `${volume * 100}%` }} />
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>

            {/* Links */}
            <div className="space-y-0.5 mb-3 pt-2 border-t border-black/5">
              <Link href="/recap" onClick={onClose} className="flex items-center justify-between p-2 rounded-xl hover:bg-black/[0.03] transition-colors text-sm font-semibold text-[var(--text-secondary)]">
                <span>🎵 Your Recap</span><ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
              </Link>
            </div>

            {user && (
              <button onClick={() => { signOut(auth); onClose(); }} className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold transition-all">
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
