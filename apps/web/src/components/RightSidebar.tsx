'use client';

import { usePlayerStore, Track } from '../store/usePlayerStore';
import { Play, Music } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { shuffle } from '../services/saavn';
import { useToast } from './Toast';
import AudioVisualizer from './AudioVisualizer';
import Link from 'next/link';

export default function RightSidebar() {
  const { currentTrack, isPlaying, queue, play, toggleFollow, followedArtists, toggleRightSidebar } = usePlayerStore();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [artistInfo, setArtistInfo] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentTrack?.artistId) {
      fetch(`/api/yt/artist?id=${currentTrack.artistId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setArtistInfo(data);
        })
        .catch(err => console.error('Artist fetch error:', err));
    } else {
      setArtistInfo(null);
    }
  }, [currentTrack?.artistId]);

  const upNext = useMemo(() => mounted ? queue.filter(t => t.id !== currentTrack?.id).slice(0, 5) : [], [mounted, queue, currentTrack]);
  const related = useMemo(() => mounted ? shuffle([...queue]).slice(0, 6) : [], [mounted, queue]);

  if (!mounted) return <aside className="w-[320px] flex-shrink-0 bg-black/40 border-l border-white/5" />;

  return (
    <aside 
      className="w-[320px] flex-shrink-0 bg-black/60 backdrop-blur-[60px] flex flex-col h-full overflow-hidden relative outline-none"
      tabIndex={0}
      onMouseEnter={(e) => e.currentTarget.focus()}
    >
      {/* Dynamic Background Glow based on track */}
      <div className="absolute top-0 right-0 w-full h-[60%] bg-gradient-to-b from-[#ba9eff]/10 to-transparent pointer-events-none opacity-40 blur-3xl" />

      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-6 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-white/40">Now Playing</h3>
          {isPlaying && (
            <div className="flex gap-[3px] items-end h-3">
              {[0, 0.15, 0.3].map(delay => (
                <motion.div key={delay} animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay }} className="w-[3px] bg-[#ba9eff] rounded-full glow-sm" />
              ))}
            </div>
          )}
        </div>

        {/* Current Track Info */}
        {currentTrack && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
             <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
                <img src={currentTrack.coverImage?.replace('150x150', '500x500') || currentTrack.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             <div>
               <h2 className="text-xl font-black text-white tracking-tighter leading-tight truncate">{currentTrack.title}</h2>
               <p className="text-sm font-bold text-[#ba9eff] uppercase tracking-widest truncate">{currentTrack.artist}</p>
             </div>
           </motion.div>
        )}

        {/* About the Artist - Premium Refinement */}
        {currentTrack && (
          <section className="relative rounded-[2.5rem] overflow-hidden border border-white/10 group bg-white/5 backdrop-blur-md">
            <div className="h-32 relative overflow-hidden">
              <img src={artistInfo?.image || currentTrack.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/40 to-transparent" />
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-xl px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white border border-white/10">Verified Artist</div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shadow-xl flex-shrink-0">
                  <img src={artistInfo?.image || currentTrack.coverImage} className="w-full h-full aspect-square object-cover" alt="" />
                </div>
                <div className="min-w-0">
                  <p className="font-black text-white uppercase tracking-wider text-xs truncate">{currentTrack.artist}</p>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{artistInfo ? 'Dynamic Monthly Listeners' : '46.5M Monthly Listeners'}</p>
                </div>
              </div>

              <p className="text-[10px] text-white/50 leading-relaxed line-clamp-3 font-medium">
                {artistInfo?.description || `${currentTrack.artist} is pushing the boundaries of the genre, blending cinematic melodies with modern rhythms.`}
              </p>

              <button 
                onClick={() => {
                  toggleFollow({ name: currentTrack.artist, image: artistInfo?.image || currentTrack.coverImage });
                  const isNowFollowing = !followedArtists.some(a => a.name === currentTrack.artist);
                  showToast(isNowFollowing ? `Following ${currentTrack.artist}` : `Unfollowed ${currentTrack.artist}`, 'success');
                }}
                className="w-full py-2.5 bg-white text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
              >
                {followedArtists.some(a => a.name === currentTrack.artist) ? 'Following' : 'Follow Artist'}
              </button>
            </div>
          </section>
        )}

        {/* Next in Queue */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Next in Queue</h3>
            <button onClick={() => toggleRightSidebar()} className="text-[9px] font-black text-[#ba9eff] uppercase tracking-widest hover:underline">Open Queue</button>
          </div>
          <div className="space-y-3">
            {upNext.length > 0 ? (
              upNext.map((track, i) => (
                <motion.div 
                  key={track.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => play(track)} 
                  className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl flex items-center gap-3 cursor-pointer group transition-all border border-white/5 hover:border-white/10"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 relative shadow-lg">
                    <img src={track.coverImage} className="w-full h-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    <div className="absolute inset-0 bg-black/40 items-center justify-center flex opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-4 h-4 text-white fill-white" /></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white truncate group-hover:text-[#ba9eff] transition-colors">{track.title}</p>
                    <p className="text-[8px] font-bold text-white/30 truncate uppercase tracking-widest">{track.artist}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center bg-white/2 rounded-[2rem] border border-white/5 border-dashed">
                <Music className="w-5 h-5 text-white/10 mx-auto mb-2" />
                <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">Your queue is empty</p>
              </div>
            )}
          </div>
        </section>

        {/* Related Music */}
        <section className="pb-10">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-5">Related Music</h3>
          <div className="flex gap-4 overflow-x-auto hide-scroll px-1">
             {related.map((t: Track, i: number) => (
               <div key={i} onClick={() => play(t)} className="flex-shrink-0 w-20 group cursor-pointer">
                 <div className="aspect-square rounded-2xl overflow-hidden border border-white/5 group-hover:border-[#ba9eff]/50 transition-all relative mb-2 shadow-lg">
                   <img src={t.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Play className="w-4 h-4 text-white fill-white" /></div>
                 </div>
                 <p className="text-[8px] font-black text-white truncate uppercase tracking-widest">{t.title}</p>
               </div>
             ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
