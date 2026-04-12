'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore, Track } from '../../store/usePlayerStore';
import { searchTracks, shuffle } from '../../services/saavn';
import { Play, Disc3, Shuffle, Search, Bell, Settings, User } from 'lucide-react';
import BackButton from '../../components/BackButton';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AlbumSection { title: string; query: string; tracks: Track[]; }

export default function AlbumsPage() {
  const { play, setQueue } = usePlayerStore();
  const [sections, setSections] = useState<AlbumSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPhoto, setUserPhoto] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUserPhoto(u?.photoURL || ''));
    return () => unsub();
  }, []);

  useEffect(() => {
    async function load() {
      const ALBUM_CONFIG = [
        { title: 'New Releases', query: 'Latest Bollywood Albums 2024' },
        { title: 'Classic Hits', query: '90s Evergreen Hindi Albums' },
        { title: 'Global Pop', query: 'Top Billboard Albums' },
        { title: 'Punjabi Vibes', query: 'Latest Punjabi Hits Album' },
        { title: 'Romantic Melodies', query: 'Arijit Singh Romantic Hits' },
        { title: 'Party Albums', query: 'Bollywood Dance Mix' }
      ];

      try {
        const results = await Promise.all(ALBUM_CONFIG.map(config => searchTracks(config.query)));
        setSections(ALBUM_CONFIG.map((config, i) => ({
          ...config,
          tracks: shuffle(results[i]).slice(0, 10)
        })));
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-5 bg-[#0f1218] min-h-full">
        <div className="flex justify-between items-center"><div className="w-24 h-6 bg-white/5 animate-pulse rounded-lg" /><div className="w-10 h-10 bg-white/5 animate-pulse rounded-full" /></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => <div key={i} className="aspect-square bg-white/5 animate-pulse rounded-[2rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full overflow-y-auto custom-scrollbar bg-[#0f1218] outline-none"
      tabIndex={0}
      onMouseEnter={(e) => e.currentTarget.focus()}
    >
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-[#0f1218]/60 backdrop-blur-2xl px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <BackButton />
          <div className="flex items-center gap-2">
            <Disc3 className="w-6 h-6 text-[#ba9eff]" />
            <h1 className="text-xl font-black text-white tracking-tighter uppercase">Albums</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/search" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"><Search className="w-4 h-4 text-white/60" /></Link>
           <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
              <Settings className="w-4 h-4 text-white/60" />
           </button>
           <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/5 p-0.5 hover:border-[#ba9eff]/50 transition-all flex-shrink-0">
             {userPhoto ? <img src={userPhoto} className="w-full h-full object-cover rounded-full" alt="" /> : <div className="w-full h-full bg-gradient-to-br from-[#ba9eff] to-[#7e57c2] flex items-center justify-center rounded-full"><User className="w-4 h-4 text-white" /></div>}
           </Link>
        </div>
      </div>

      <div className="p-6 space-y-12 pb-32 max-w-[1200px] mx-auto">
        {sections.map((section, sIdx) => (
          <motion.section key={sIdx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white tracking-tighter uppercase">{section.title}</h2>
              <button onClick={() => { setQueue(section.tracks); play(section.tracks[0]); }} className="text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-white flex items-center gap-1.5"><Shuffle className="w-3 h-3" /> Play All</button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {section.tracks.map((track, i) => (
                <motion.div key={track.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  onClick={() => { setQueue(section.tracks); play(track); }}
                  className="flex flex-col gap-3 group cursor-pointer"
                >
                  <div className="aspect-square rounded-[2rem] overflow-hidden border border-white/5 group-hover:border-[#ba9eff]/30 transition-all relative shadow-lg">
                    <img src={track.coverImage?.replace('150x150', '500x500') || track.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform"><Play className="w-5 h-5 text-black fill-black ml-1" /></div>
                    </div>
                  </div>
                  <div className="px-1">
                    <p className="font-black text-[11px] text-white truncate mb-0.5 group-hover:text-[#ba9eff] transition-colors">{track.title}</p>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest truncate">{track.artist}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
