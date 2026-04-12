'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore, Track } from '../store/usePlayerStore';
import { searchTracks, shuffle } from '../services/saavn';
import { Play, Search, Bell, Settings, Shuffle, Plus, Heart, User, Users } from 'lucide-react';
import TrackContextMenu from '../components/TrackContextMenu';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ProfileModal from '../components/ProfileModal';
import NotificationsModal from '../components/NotificationsModal';
import SettingsModal from '../components/SettingsModal';
import JamModal from '../components/JamModal';
import { useToast } from '../components/Toast';

interface Section { title: string; query: string; tracks: Track[]; }

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function Home() {
  const { play, setQueue, recentPlayed, playCounts, listeningHistory, addToQueue } = usePlayerStore();
  const { showToast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userPhoto, setUserPhoto] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [jamOpen, setJamOpen] = useState(false);

  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    setMounted(true);
    const unsub = onAuthStateChanged(auth, u => setUserPhoto(u?.photoURL || ''));
    return () => unsub();
  }, []);

  useEffect(() => {
    async function load() {
      // Helper: get top artist and genre
      const topArtist = listeningHistory.length > 0
        ? Object.entries(listeningHistory.reduce((acc, curr) => {
            acc[curr.artist] = (acc[curr.artist] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)).sort(([, a], [, b]) => b - a)[0][0]
        : null;

      const getGenre = (t: Track) => {
        const combined = `${t.title} ${t.artist}`.toLowerCase();
        if (combined.includes('hindi') || combined.includes('arijit')) return 'Hindi';
        if (combined.includes('lofi') || combined.includes('chill')) return 'Chill';
        return 'Pop';
      };

      const topGenre = listeningHistory.length > 0
        ? Object.entries(listeningHistory.reduce((acc, curr) => {
            const g = getGenre(curr as any);
            acc[g] = (acc[g] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)).sort(([, a], [, b]) => b - a)[0][0]
        : null;

      const SECTION_CONFIG = [
        { title: 'Your Daily Mix 1', query: topArtist || 'Top Pop 2024' },
        { title: 'Release Radar', query: topGenre || 'Latest Hindi Hits' },
        { title: 'Trending Now', query: 'Global Viral 50' },
        { title: 'Top Tracks Hindi', query: 'Arijit Singh Best of' },
        { title: 'Discover Weekly', query: 'Lofi Chill Aesthetic' },
        { title: 'On Repeat', query: 'The Weeknd Radio' },
        { title: 'Workout Jams', query: 'Gym Motivation Music' },
        { title: 'Chill Vibes', query: 'Relaxing Instrumental' },
        { title: 'Party Starters', query: 'Dance Party Hits' },
        { title: 'Focus Music', query: 'Concentration Study' }
      ];

      try {
        const results = await Promise.all(SECTION_CONFIG.map(config => searchTracks(config.query)));
        setSections(SECTION_CONFIG.map((config, i) => {
          const rawTracks = results[i];
          // Sort tracks so top artist/genre matches are at the TOP
          const sortedTracks = [...rawTracks].sort((a, b) => {
            const aMatch = (a.artist === topArtist || getGenre(a) === topGenre) ? -1 : 1;
            const bMatch = (b.artist === topArtist || getGenre(b) === topGenre) ? -1 : 1;
            return aMatch - bMatch;
          });
          return {
            ...config,
            tracks: sortedTracks.slice(0, 15)
          };
        }));
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    }
    load();
  }, [listeningHistory]);

  const allTracks = sections.flatMap(s => s.tracks);
  const heroTrack = sections[0]?.tracks[0];
  const artists = Array.from(new Map(allTracks.map(t => [t.artist, t])).values()).slice(0, 10);

  if (!mounted || isLoading) {
    return (
      <div className="p-6 space-y-5 bg-[var(--bg-main)] min-h-full">
        <div className="flex justify-between items-center"><div className="w-24 h-6 bg-white/5 animate-pulse rounded-lg" /><div className="w-10 h-10 bg-white/5 animate-pulse rounded-full" /></div>
        <div className="w-full aspect-[3/1] bg-white/5 animate-pulse rounded-[2.5rem]" />
        <div className="flex gap-4">{[...Array(6)].map((_, i) => <div key={i} className="w-16 h-16 rounded-full bg-white/5 animate-pulse" />)}</div>
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl w-full" />)}
      </div>
    );
  }

  return (
    <div 
      className="h-full overflow-y-auto custom-scrollbar bg-[var(--bg-main)] outline-none"
    >
      {/* Top Header & Filter Bar */}
      <div className="sticky top-0 z-40 bg-[var(--bg-main)]/60 backdrop-blur-2xl px-6 py-4 flex flex-col gap-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white tracking-tighter">Browse</h1>
            <div className="w-1.5 h-1.5 rounded-full bg-[#ba9eff] animate-pulse glow-sm" />
          </div>
          <div className="flex items-center gap-3">
             <Link href="/search" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"><Search className="w-4 h-4 text-white/60" /></Link>
             <button onClick={() => setNotifOpen(true)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all relative">
                <Bell className="w-4 h-4 text-white/60" />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ba9eff] border-2 border-[#1A1A1A] glow-sm" />
             </button>
             <button onClick={() => setSettingsOpen(true)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                <Settings className="w-4 h-4 text-white/60 group-hover:text-white" />
             </button>
             <button onClick={() => setJamOpen(true)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                <Users className="w-4 h-4 text-white/60 group-hover:text-[#ba9eff]" />
             </button>
             <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/5 p-0.5 hover:border-[#ba9eff]/50 transition-all flex-shrink-0">
               {userPhoto ? <img src={userPhoto} className="w-full h-full object-cover rounded-full" alt="" /> : <div className="w-full h-full bg-gradient-to-br from-[#ba9eff] to-[#7e57c2] flex items-center justify-center rounded-full"><User className="w-4 h-4 text-white" /></div>}
             </Link>
          </div>
        </div>

      </div>

      <div className="p-6 space-y-10 pb-32 max-w-[1200px] mx-auto">
        {heroTrack && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="relative w-full aspect-[3/1] rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/10 shadow-2xl"
            onClick={() => { setQueue(sections[0].tracks); play(heroTrack); }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#ba9eff]/40 via-black to-black z-10" />
            <img src={heroTrack.coverImage?.replace('150x150', '800x800') || heroTrack.coverImage} className="absolute right-0 top-0 bottom-0 w-[50%] h-full object-cover opacity-60 z-0 select-none pointer-events-none group-hover:scale-110 transition-transform duration-1000" alt="" />

            <div className="absolute inset-0 z-20 p-10 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ba9eff] glow-sm">Editor's Choice</span>
                <div className="h-px w-12 bg-[#ba9eff]/30" />
              </div>

              <div className="max-w-[50%]">
                <h2 className="text-5xl font-black text-white tracking-tighter leading-none mb-3 group-hover:tracking-tight transition-all duration-500">{heroTrack.title}</h2>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">{heroTrack.artist}</div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3 h-3 text-[#ba9eff] fill-[#ba9eff]" />
                    <span className="text-[9px] font-bold text-white/50 tracking-widest uppercase">
                      {playCounts?.[heroTrack.id] || 0} Personal Plays
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); play(heroTrack); }}
                  className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl"
                >
                  Listen Now
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); addToQueue(heroTrack); showToast(`Added ${heroTrack.title} to queue`, 'success'); }}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all backdrop-blur-md"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Categories Grid (Daily Mix, etc.) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sections.slice(0, 6).map((section, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              onClick={() => { setQueue(section.tracks); play(section.tracks[0]); }}
              className="group relative h-20 bg-white/5 hover:bg-white/10 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all cursor-pointer overflow-hidden flex items-center pr-4"
            >
              <div className="w-20 h-20 bg-[var(--bg-container)] flex-shrink-0 relative">
                {section.tracks && section.tracks[0] ? (
                  <>
                    <img src={section.tracks[0].coverImage?.replace('150x150', '500x500') || section.tracks[0].coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-5 h-5 text-white fill-white" /></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-white/5 animate-pulse" />
                )}
              </div>
              <div className="flex-1 px-4 min-w-0">
                <h3 className="text-xs font-black text-white uppercase tracking-wider truncate mb-0.5">{section.title}</h3>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest truncate">{section.tracks.length} Songs • Curated</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Stars (Artists) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-white tracking-tighter uppercase">Global Soundscape</h2>
            <Link href="/artists" className="text-[9px] font-black text-[#ba9eff] uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="flex items-center gap-8 overflow-x-auto hide-scroll pb-2">
            {artists.map((track, i) => (
              <Link key={i} href={`/artist/${encodeURIComponent(track.artist)}`} className="flex flex-col items-center gap-3 group flex-shrink-0 text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-[#ba9eff]/50 transition-all duration-500 relative">
                  <img src={track.coverImage?.replace('150x150', '500x500') || track.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 select-none grayscale-[40%] group-hover:grayscale-0" alt="" />
                  <div className="absolute inset-0 ring-4 ring-inset ring-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="font-black text-[10px] text-white/40 group-hover:text-white uppercase tracking-widest w-24 truncate transition-colors">{track.artist}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Section List: Detailed Premium Rows */}
        {sections.slice(1).map((section, sIdx) => (
          <section key={sIdx}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white tracking-tighter uppercase">{section.title}</h2>
              <button onClick={() => { setQueue(section.tracks); play(section.tracks[0]); }} className="text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-white flex items-center gap-1.5"><Shuffle className="w-3 h-3" /> Shuffle</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {section.tracks.slice(0, 5).map((track, i) => (
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
          </section>
        ))}
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <JamModal open={jamOpen} onClose={() => setJamOpen(false)} />
      <NotificationsModal open={notifOpen} onClose={() => setNotifOpen(false)} />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
