'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal, Heart, ListPlus, Trash2, Pencil, Shield, ShieldOff, Plus, ListMusic, Play, Share2 
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Track, usePlayerStore, Playlist } from '../store/usePlayerStore';
import { useToast } from './Toast';
import AddSongsModal from './AddSongsModal';

type MenuContext = 'USER_PLAYLIST' | 'GENERAL_PLAYLIST' | 'TRACK';

interface ContextMenuProps {
  context: MenuContext;
  data: any; // Track or Playlist
  trigger?: React.ReactNode;
  playlistId?: string;
}

export default function ContextMenu({ context, data, trigger, playlistId }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { 
    toggleLike, likedSongs, queue, setQueue, customPlaylists, 
    addToPlaylist, deletePlaylist, togglePlaylistPrivacy,
    removeFromPlaylist, isPlaying, pause, playNext, play
  } = usePlayerStore();
  const { showToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowPlaylists(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 240;
      let left = rect.right - menuWidth;
      if (left < 20) left = 20; // Prevent off-screen left
      
      setCoords({ 
        top: rect.bottom + window.scrollY, 
        left: left + window.scrollX
      });
    }
    setOpen(!open);
    setShowPlaylists(false);
  };

  const handleAction = (e: React.MouseEvent, action: () => void, message: string) => {
    e.stopPropagation();
    action();
    if (message) showToast(message, 'success');
    setOpen(false);
  };

  const isLiked = context === 'TRACK' ? likedSongs.some(t => t.id === data.id) : false;

  const menuContent = (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      style={{ top: coords.top + 8, left: coords.left }}
      className="fixed w-[240px] bg-[#1A1A1A] backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden z-[9999]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2 space-y-0.5">
        {/* --- TRACK CONTEXT --- */}
        {context === 'TRACK' && (
          <>
            <button onClick={(e) => handleAction(e, () => toggleLike(data), isLiked ? 'Removed from Liked Songs' : 'Saved to Liked Songs')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-all group">
              <span className="text-[12px] font-bold text-white/70 group-hover:text-white">Save to Liked Songs</span>
              <Heart className={`w-4 h-4 ${isLiked ? 'text-[#ba9eff] fill-[#ba9eff]' : 'text-white/20 group-hover:text-[#ba9eff]'}`} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowPlaylists(!showPlaylists); }}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-all group">
              <span className="text-[12px] font-bold text-white/70 group-hover:text-white">Add to Playlist</span>
              <Plus className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff]" />
            </button>
            <AnimatePresence>
              {showPlaylists && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-1 pb-1 space-y-0.5">
                  {customPlaylists.length === 0 ? (
                    <p className="text-[10px] text-white/20 py-2 text-center font-bold uppercase tracking-widest">No playlists</p>
                  ) : customPlaylists.map(p => (
                    <button key={p.id} onClick={(e) => handleAction(e, () => addToPlaylist(p.id, data), `Added to ${p.name}`)}
                      className="w-full text-left p-2.5 pl-4 text-[11px] font-bold text-white/40 hover:text-white hover:bg-[#ba9eff]/10 rounded-lg transition-all truncate border border-transparent hover:border-[#ba9eff]/20">
                      {p.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={(e) => handleAction(e, () => setQueue([...queue, data]), 'Added to queue')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-all group border-t border-white/5 mt-1">
              <span className="text-[12px] font-bold text-white/70 group-hover:text-white">Add to queue</span>
              <ListPlus className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff]" />
            </button>
            {playlistId && (
              <button onClick={(e) => handleAction(e, () => removeFromPlaylist(playlistId, data.id), 'Removed from playlist')}
                className="w-full flex items-center justify-between p-3 hover:bg-red-500/10 rounded-xl transition-all group">
                <span className="text-[12px] font-bold text-red-400/70 group-hover:text-red-400">Remove from this playlist</span>
                <Trash2 className="w-4 h-4 text-red-400/20 group-hover:text-red-400" />
              </button>
            )}
          </>
        )}

        {/* --- USER PLAYLIST CONTEXT --- */}
        {context === 'USER_PLAYLIST' && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setOpen(false); setShowAddSongsModal(true); }}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-all group">
              <span className="text-[12px] font-bold text-white/70 group-hover:text-white">Add Songs</span>
              <Plus className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff]" />
            </button>
            <button onClick={(e) => handleAction(e, () => {}, 'Edit Coming Soon')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-all group">
              <span className="text-[12px] font-bold text-white/70 group-hover:text-white">Edit details</span>
              <Pencil className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff]" />
            </button>
            <button onClick={(e) => handleAction(e, () => togglePlaylistPrivacy(data.id), data.isPublic ? 'Playlist is Private' : 'Playlist is Public')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-all group">
              <span className="text-[12px] font-bold text-white/70 group-hover:text-white">{data.isPublic ? 'Make private' : 'Make public'}</span>
              {data.isPublic ? <ShieldOff className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff]" /> : <Shield className="w-4 h-4 text-[#ba9eff]" />}
            </button>
            <button onClick={(e) => handleAction(e, () => deletePlaylist(data.id), 'Playlist Deleted')}
              className="w-full flex items-center justify-between p-3 hover:bg-red-500/10 rounded-xl transition-all group">
              <span className="text-[12px] font-bold text-red-400/70 group-hover:text-red-400">Delete Playlist</span>
              <Trash2 className="w-4 h-4 text-red-400/20 group-hover:text-red-400" />
            </button>
          </>
        )}

        {/* --- GENERAL PLAYLIST CONTEXT --- */}
        {context === 'GENERAL_PLAYLIST' && (
          <>
            <button onClick={(e) => handleAction(e, () => { if(data.tracks?.length) { setQueue(data.tracks); play(data.tracks[0]); } }, 'Playing Playlist')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-all group">
              <span className="text-[12px] font-bold text-white/70 group-hover:text-white">Play Now</span>
              <Play className="w-4 h-4 text-[#ba9eff] fill-[#ba9eff] group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={(e) => handleAction(e, () => setQueue([...queue, ...(data.tracks || [])]), 'Playlist added to queue')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-all group border-t border-white/5 mt-1">
              <span className="text-[12px] font-bold text-white/70 group-hover:text-white">Add to Queue</span>
              <ListMusic className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff]" />
            </button>
            <button onClick={(e) => handleAction(e, () => {}, 'Share feature coming soon')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-xl transition-all group">
              <span className="text-[12px] font-bold text-white/70 group-hover:text-white">Share Playlist</span>
              <Share2 className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff]" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div onClick={toggleOpen} className="cursor-pointer">
        {trigger || (
          <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-white/40 hover:text-white">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      <AddSongsModal 
        isOpen={showAddSongsModal} 
        onClose={() => setShowAddSongsModal(false)} 
        playlistId={data.id} 
      />

      {open && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && menuContent}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
