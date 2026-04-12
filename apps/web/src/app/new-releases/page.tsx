'use client';

import { useEffect, useState } from 'react';
import { searchTracks } from '../../services/saavn';
import { usePlayerStore, Track } from '../../store/usePlayerStore';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function NewReleasesPage() {
  const { play, setQueue } = usePlayerStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [hindi, english, punjabi] = await Promise.all([
          searchTracks('new songs latest releases'),
          searchTracks('new english songs'),
          searchTracks('new punjabi songs'),
        ]);
        // Merge and deduplicate
        const all = [...hindi, ...english, ...punjabi];
        const unique = Array.from(new Map(all.map(t => [t.id, t])).values());
        setTracks(unique.slice(0, 40));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-40 skeleton rounded" />
        <div className="flex gap-3 flex-wrap">{[...Array(10)].map((_, i) => <div key={i} className="w-[130px] h-[130px] skeleton rounded-2xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 pb-24">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] mb-0.5">New Releases</h1>
        <p className="text-[var(--text-muted)] text-xs font-medium">Latest songs in Hindi, English & Punjabi</p>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="flex gap-3 flex-wrap">
        {tracks.map(track => (
          <motion.div key={track.id} variants={fadeUp} onClick={() => { setQueue(tracks); play(track); }} className="flex-shrink-0 w-[130px] cursor-pointer group">
            <div className="w-[130px] h-[130px] rounded-2xl overflow-hidden mb-1.5 border border-black/[0.04] group-hover:shadow-md transition-all relative">
              <img src={track.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-7 h-7 text-white fill-white drop-shadow" /></div>
            </div>
            <p className="font-semibold text-[10px] text-[var(--text-primary)] truncate">{track.title}</p>
            <Link href={`/artist/${encodeURIComponent(track.artist)}`} onClick={e => e.stopPropagation()} className="text-[9px] text-[var(--text-muted)] truncate hover:text-[var(--accent-green)] transition-colors block">{track.artist}</Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
