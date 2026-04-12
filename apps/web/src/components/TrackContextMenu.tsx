'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Heart, ListPlus, Download, Share2, FolderPlus, Zap, Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Track, usePlayerStore } from '../store/usePlayerStore';
import { useToast } from './Toast';


export default function TrackContextMenu({ track }: { track: Track }) {
  const [open, setOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const { 
    toggleLike, likedSongs, queue, setQueue, customPlaylists, 
    addToPlaylist, addToOffline, setSleepTimer 
  } = usePlayerStore();
  const { showToast } = useToast();
  
  const isLiked = likedSongs.some(t => t.id === track.id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) { setOpen(false); setShowPlaylists(false); }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!queue.some(t => t.id === track.id)) {
      setQueue([...queue, track]);
      showToast(`"${track.title}" added to queue`, 'success');
    } else { showToast('Already in queue', 'info'); }
    setOpen(false);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(track);
    showToast(isLiked ? 'Removed from Liked Songs' : `"${track.title}" liked ❤️`, 'success');
    setOpen(false);
  };

  const handleAddToPlaylist = (e: React.MouseEvent, playlistId: string, playlistName: string) => {
    e.stopPropagation();
    addToPlaylist(playlistId, track);
    showToast(`Added to "${playlistName}"`, 'success');
    setOpen(false); setShowPlaylists(false);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToOffline(track);
    showToast(`"${track.title}" added to offline backup`, 'success');
    setOpen(false);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${track.title} by ${track.artist} — Listen on Groovra 🎶`).then(() => showToast('Link copied to clipboard!', 'success')).catch(() => showToast('Could not copy', 'error'));
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); setShowPlaylists(false); }} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-white/50 hover:text-white">
        <MoreHorizontal className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ duration: 0.15 }} className="absolute right-0 top-11 w-56 bg-[#182138]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden z-[200]">
            <div className="flex flex-col p-1.5 gap-0.5 text-sm font-bold">
              <button onClick={handleLike} className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-colors text-white/90">
                <span className={isLiked ? 'text-neon-pink' : ''}>{isLiked ? 'Unlike' : 'Like'}</span>
                <Heart className={`w-4 h-4 ${isLiked ? 'text-neon-pink fill-neon-pink' : 'text-white/40'}`} />
              </button>
              <button onClick={handleQueue} className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-colors text-white/90">
                <span>Add to Queue</span><ListPlus className="w-4 h-4 text-white/40" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowPlaylists(!showPlaylists); }} className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-colors text-white/90">
                <span>Add to Playlist</span><FolderPlus className="w-4 h-4 text-white/40" />
              </button>

              <AnimatePresence>
                {showPlaylists && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5 mt-1 pt-1">
                    {customPlaylists.length === 0 ? (
                      <p className="text-white/30 text-xs text-center py-3">No playlists yet</p>
                    ) : customPlaylists.map(p => (
                      <button key={p.id} onClick={(e) => handleAddToPlaylist(e, p.id, p.name)} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors truncate">
                        {p.name} ({p.tracks.length})
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="h-px w-full bg-white/10 my-0.5" />
              <button onClick={handleDownload} className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-colors text-white/90">
                <span>Download</span><Download className="w-4 h-4 text-white/40" />
              </button>
              <button onClick={handleShare} className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-colors text-white/90">
                <span>Share</span><Share2 className="w-4 h-4 text-white/40" />
              </button>
              <div className="h-px w-full bg-white/10 my-0.5" />
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setSleepTimer(30);
                  showToast('Sleep Timer: 30 minutes set', 'success');
                  setOpen(false);
                }} 
                className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-colors text-white/90 group"
              >
                <div className="flex items-center gap-2">
                  <span>Sleep Timer (30m)</span>
                </div>
                <Clock className="w-4 h-4 text-white/40" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
