'use client';

import { motion } from 'framer-motion';
import { BarChart3, Clock, Music, Headphones, TrendingUp, Heart, Disc3 } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const GENRE_DATA = [
  { name: 'Pop', value: 35, color: '#FF3366' },
  { name: 'Bollywood', value: 28, color: '#FF8C42' },
  { name: 'Lo-Fi', value: 18, color: '#53ddfc' },
  { name: 'Rock', value: 12, color: '#ba9eff' },
  { name: 'Other', value: 7, color: '#38ef7d' },
];
const MONTHLY = [22, 35, 18, 42, 31, 27, 38, 44, 25, 33, 41, 36];

export default function RecapPage() {
  const { recentPlayed, likedSongs, customPlaylists } = usePlayerStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const topArtists = mounted ? Array.from(new Map(recentPlayed.map(t => [t.artist, t])).values()).slice(0, 5) : [];
  const totalHours = MONTHLY.reduce((s, h) => s + h, 0);
  const maxHours = Math.max(...MONTHLY);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8">
      <div className="max-w-[1000px] mx-auto space-y-8 pb-8">
        
        {/* Header */}
        <div className="text-center py-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--accent-green)]">🎵 Your Year in Music</span>
            <h1 className="text-4xl font-black tracking-tight mt-2 mb-1 text-[var(--text-primary)]">2026 Recap</h1>
            <p className="text-[var(--text-muted)] text-sm font-medium">Your listening journey this year</p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Clock, label: 'Hours Listened', value: `${totalHours}`, color: 'var(--accent-green)' },
            { icon: Music, label: 'Tracks Played', value: mounted ? recentPlayed.length.toString() : '0', color: '#FF3366' },
            { icon: Heart, label: 'Songs Liked', value: mounted ? likedSongs.length.toString() : '0', color: 'var(--accent-warm)' },
            { icon: Disc3, label: 'Playlists', value: mounted ? customPlaylists.length.toString() : '0', color: '#ba9eff' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-2xl p-5 bg-black/[0.03] border border-black/5">
              <s.icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
              <p className="text-2xl font-black text-[var(--text-primary)]">{s.value}</p>
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Genres */}
          <div className="rounded-2xl p-6 bg-black/[0.03] border border-black/5">
            <h2 className="text-sm font-bold mb-5 flex items-center gap-2 text-[var(--text-primary)]"><BarChart3 className="w-4 h-4 text-[var(--accent-green)]" /> Most Played Genres</h2>
            <div className="space-y-3.5">
              {GENRE_DATA.map((g, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                  <div className="flex items-center justify-between mb-1"><span className="text-[12px] font-bold text-[var(--text-secondary)]">{g.name}</span><span className="text-[10px] font-bold text-[var(--text-muted)]">{g.value}%</span></div>
                  <div className="w-full h-2 bg-black/[0.04] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${g.value}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} className="h-full rounded-full" style={{ backgroundColor: g.color }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Monthly Activity */}
          <div className="rounded-2xl p-6 bg-black/[0.03] border border-black/5">
            <h2 className="text-sm font-bold mb-5 flex items-center gap-2 text-[var(--text-primary)]"><Clock className="w-4 h-4" style={{ color: '#ba9eff' }} /> Monthly Activity</h2>
            <div className="flex items-end justify-between gap-1.5 h-40">
              {MONTHLY.map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(h / maxHours) * 100}%` }} transition={{ duration: 0.7, delay: 0.2 + i * 0.05 }} className="w-full rounded-lg bg-gradient-to-t from-[var(--accent-green)] to-[var(--accent-gold)] min-h-[4px] relative group cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold text-[var(--text-primary)] bg-black/[0.04] px-1.5 py-0.5 rounded">{h}h</div>
                  </motion.div>
                  <span className="text-[7px] font-bold text-[var(--text-muted)]">{months[i].slice(0, 1)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-[11px] text-[var(--text-muted)] border-t border-black/5 pt-3">Total: ~{totalHours} hours this year</div>
          </div>
        </div>

        {/* Top Artists */}
        {topArtists.length > 0 && (
          <div className="rounded-2xl p-6 bg-black/[0.03] border border-black/5">
            <h2 className="text-sm font-bold mb-5 flex items-center gap-2 text-[var(--text-primary)]"><Headphones className="w-4 h-4 text-[var(--accent-warm)]" /> Your Top Artists</h2>
            <div className="space-y-2">
              {topArtists.map((t, i) => (
                <Link key={i} href={`/artist/${encodeURIComponent(t.artist)}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-black/[0.03] transition-all group">
                  <span className="w-5 text-center text-xs font-black text-[var(--text-muted)]">{i + 1}</span>
                  <img src={t.coverImage} className="w-10 h-10 rounded-full object-cover border border-black/5" alt="" />
                  <div>
                    <p className="font-bold text-[12px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{t.artist}</p>
                    <p className="text-[9px] text-[var(--text-muted)]">Artist</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
