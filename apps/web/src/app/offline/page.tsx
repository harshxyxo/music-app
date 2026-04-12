'use client';

import { usePlayerStore } from '../../store/usePlayerStore';
import { Play, Heart, Clock, MoreHorizontal, Shuffle, Download, UserPlus, Pause, Trash2, ArrowLeft } from 'lucide-react';
import ContextMenu from '../../components/ContextMenu';
import BackButton from '../../components/BackButton';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function OfflinePage() {
  const { 
    offlineTracks, play, pause, isPlaying, currentTrack, likedSongs, 
    toggleLike, setQueue, removeFromOffline, playCounts 
  } = usePlayerStore();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isCurrentPlaylistPlaying = offlineTracks.some(t => t.id === currentTrack?.id) && isPlaying;

  return (
    <div className="min-h-full pb-32 bg-[#0f1218]">
      {/* Header Banner */}
      <div className="relative h-[300px] flex items-end px-8 pb-6 transition-all group overflow-hidden">
        <div className="absolute inset-0 bg-[#0f1218]" />
        <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 20% 40%, #53ddfc, transparent 50%), radial-gradient(circle at 80% 20%, #ba9eff, transparent 50%)`, filter: 'blur(100px)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1218] via-transparent to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-8 left-8 z-20">
          <BackButton />
        </div>
        
        <div className="relative z-10 flex items-end gap-10 w-full max-w-7xl mx-auto">
          <div className="w-56 h-56 shadow-2xl flex-shrink-0 transition-transform hover:scale-[1.02] duration-500 rounded-[2rem] overflow-hidden border-4 border-white/5 bg-white/5 flex items-center justify-center">
            {offlineTracks.length > 0 ? (
              <img src={offlineTracks[0].coverImage} className="w-full h-full object-cover" alt="" />
            ) : (
              <Download className="w-20 h-20 text-white/10" />
            )}
          </div>
          
          <div className="flex flex-col gap-4 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#53ddfc] bg-[#53ddfc]/10 px-3 py-1 rounded-full border border-[#53ddfc]/20">Local Storage</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter text-white mb-1">Offline Backup</h1>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{offlineTracks.length} tracks saved for offline listening</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-6">
        {/* Controls Bar */}
        <div className="flex items-center gap-10 mb-12">
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (isCurrentPlaylistPlaying) pause();
              else if (offlineTracks.length) { setQueue(offlineTracks); play(offlineTracks[0]); }
            }}
            className="px-10 py-5 bg-[#53ddfc] hover:bg-[#53ddfc]/90 rounded-full flex items-center justify-center gap-3 shadow-2xl shadow-[#53ddfc]/20 transition-all group"
          >
            {isCurrentPlaylistPlaying ? (
              <>
                <div className="flex gap-1"><div className="w-1 h-4 bg-[#0f1218] rounded-full" /><div className="w-1 h-4 bg-[#0f1218] rounded-full" /></div>
                <span className="text-xs font-black text-[#0f1218] uppercase tracking-[0.2em]">Pause All</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 text-[#0f1218] fill-[#0f1218]" />
                <span className="text-xs font-black text-[#0f1218] uppercase tracking-[0.2em]">Play All</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Tracks Table */}
        {offlineTracks.length > 0 ? (
          <div className="text-left w-full border-separate border-spacing-y-0">
            <div className="flex items-center px-6 py-4 border-b border-white/5 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              <span className="w-16">#</span>
              <span className="flex-1">Track details</span>
              <span className="w-20 flex justify-end">Actions</span>
            </div>

            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-1 mt-4">
              {offlineTracks.map((track, i) => {
                const isActive = currentTrack?.id === track.id;
                const isLiked = likedSongs.some(t => t.id === track.id);
                
                return (
                  <motion.div 
                    key={track.id} 
                    variants={fadeUp} 
                    onClick={() => { setQueue(offlineTracks); play(track); }}
                    className={`flex items-center px-6 py-4 rounded-[2rem] group hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5 ${isActive ? 'bg-[#53ddfc]/5 border-[#53ddfc]/10' : ''}`}
                  >
                    <div className="w-16 flex items-center">
                      <span className={`text-xs font-black transition-colors ${isActive ? 'text-[#53ddfc]' : 'text-white/20'} group-hover:hidden w-6 text-center`}>{i + 1}</span>
                      <Play className={`w-4 h-4 ${isActive ? 'text-[#53ddfc]' : 'text-white'} fill-current hidden group-hover:block mx-auto`} />
                    </div>

                    <div className="flex-1 flex items-center gap-6 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xl shrink-0">
                        <img src={(track.coverImage || '').replace('150x150', '500x500')} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="truncate">
                        <p className={`text-sm font-black truncate mb-1 transition-colors ${isActive ? 'text-[#53ddfc]' : 'text-white'}`}>{track.title}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{track.artist}</p>
                          {playCounts?.[track.id] > 0 && (
                            <>
                              <span className="text-[10px] text-white/10">•</span>
                              <span className="text-[10px] font-black text-[#53ddfc] uppercase tracking-widest">{playCounts[track.id]} Plays</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-20 flex items-center justify-end gap-6">
                      <button 
                        onClick={e => { e.stopPropagation(); toggleLike(track); }} 
                        className={`transition-all opacity-0 group-hover:opacity-100 ${isLiked ? 'opacity-100' : ''}`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'text-[#ba9eff] fill-[#ba9eff]' : 'text-white/20 hover:text-white'}`} />
                      </button>
                      <button 
                        onClick={e => { e.stopPropagation(); removeFromOffline(track.id); }}
                        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ContextMenu context="TRACK" data={track} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 space-y-6 opacity-20">
            <Download className="w-24 h-24" />
            <div className="text-center">
              <h3 className="text-xl font-black uppercase tracking-widest mb-2">Backup is empty</h3>
              <p className="text-xs font-bold uppercase tracking-widest">Download tracks to save them here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
