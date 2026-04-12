'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal, Heart, ListPlus, Download, Share2, 
  FolderPlus, Trash2, Pencil, Shield, ShieldOff, X, 
  ChevronRight, ListMusic, Plus
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Track, usePlayerStore, Playlist } from '../store/usePlayerStore';
import { useToast } from './Toast';
import Tooltip from './Tooltip';

type MenuContext = 'USER_PLAYLIST' | 'LIBRARY_PLAYLIST' | 'TRACK';

interface ContextDropdownProps {
  context: MenuContext;
  data: any; // Track or Playlist
  trigger?: React.ReactNode;
  playlistId?: string; // Optional context for track in playlist
}

export default function ContextDropdown({ context, data, trigger, playlistId }: ContextDropdownProps) {
  const [open, setOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  
  const { 
    toggleLike, likedSongs, queue, setQueue, customPlaylists, 
    addToPlaylist, addToOffline, deletePlaylist, togglePlaylistPrivacy,
    removeFromPlaylist
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
      setCoords({ 
        top: rect.bottom + window.scrollY, 
        left: rect.right - 256 + window.scrollX // 256 is menu width (w-64)
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
      className="fixed w-64 bg-black/50 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[9999]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2 space-y-0.5">
        {/* --- TRACK CONTEXT --- */}
        {context === 'TRACK' && (
          <>
            <button onClick={(e) => handleAction(e, () => toggleLike(data), isLiked ? 'Removed from Liked Songs' : 'Saved to Liked Songs')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-lg transition-all group">
              <span className="text-[12px] font-medium text-white/70 group-hover:text-white">Save to Liked Songs</span>
              <Heart className={`w-4 h-4 ${isLiked ? 'text-[#ba9eff] fill-[#ba9eff]' : 'text-white/20 group-hover:text-[#ba9eff]'}`} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowPlaylists(!showPlaylists); }}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-lg transition-all group">
              <span className="text-[12px] font-medium text-white/70 group-hover:text-white">Add to Playlist</span>
              <Plus className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff]" />
            </button>
            <AnimatePresence>
              {showPlaylists && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-1 pb-1 space-y-0.5">
                  {customPlaylists.map(p => (
                    <button key={p.id} onClick={(e) => handleAction(e, () => addToPlaylist(p.id, data), `Added to ${p.name}`)}
                      className="w-full text-left p-2.5 pl-4 text-[11px] font-medium text-white/40 hover:text-white hover:bg-[#ba9eff]/10 rounded-lg transition-all truncate border border-transparent hover:border-[#ba9eff]/20">
                      {p.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {playlistId && (
              <button onClick={(e) => handleAction(e, () => removeFromPlaylist(playlistId, data.id), 'Removed from playlist')}
                className="w-full flex items-center justify-between p-3 hover:bg-red-500/10 rounded-lg transition-all group">
                <span className="text-[12px] font-medium text-red-400/70 group-hover:text-red-400">Remove from this playlist</span>
                <Trash2 className="w-4 h-4 text-red-400/20 group-hover:text-red-400" />
              </button>
            )}
            <button onClick={(e) => handleAction(e, () => setQueue([...queue, data]), 'Added to queue')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-lg transition-all group border-t border-white/5 mt-1">
              <span className="text-[12px] font-medium text-white/70 group-hover:text-white">Add to queue</span>
              <ListPlus className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff]" />
            </button>
          </>
        )}

        {/* --- USER PLAYLIST CONTEXT --- */}
        {context === 'USER_PLAYLIST' && (
          <>
            <button onClick={(e) => handleAction(e, () => {}, 'Edit mode: Coming soon')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-lg transition-all group">
              <span className="text-[12px] font-medium text-white/70 group-hover:text-white">Edit details</span>
              <Pencil className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff]" />
            </button>
            <button onClick={(e) => handleAction(e, () => togglePlaylistPrivacy(data.id), data.isPublic ? 'Playlist is now Private' : 'Playlist is now Public')}
              className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-lg transition-all group">
              <span className="text-[12px] font-medium text-white/70 group-hover:text-white">{data.isPublic ? 'Make private' : 'Make public'}</span>
              {data.isPublic ? <ShieldOff className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff]" /> : <Shield className="w-4 h-4 text-[#ba9eff]" />}
            </button>
            <button onClick={(e) => handleAction(e, () => deletePlaylist(data.id), 'Playlist deleted')}
              className="w-full flex items-center justify-between p-3 hover:bg-red-500/10 rounded-lg transition-all group">
              <span className="text-[12px] font-medium text-red-400/70 group-hover:text-red-400">Delete</span>
              <Trash2 className="w-4 h-4 text-red-400/20 group-hover:text-red-400" />
            </button>
          </>
        )}

        {/* --- LIBRARY PLAYLIST CONTEXT --- */}
        {context === 'LIBRARY_PLAYLIST' && (
          <>
            <button onClick={(e) => handleAction(e, () => {}, 'Removed from library')}
              className="w-full flex items-center justify-between p-3 hover:bg-red-500/10 rounded-lg transition-all group">
              <span className="text-[12px] font-medium text-red-400/70 group-hover:text-red-400">Remove from Library</span>
              <Trash2 className="w-4 h-4 text-red-400/20 group-hover:text-red-400" />
            </button>
          </>
        )}

        {/* --- SHARED OPTIONS --- */}
        <button onClick={(e) => handleAction(e, () => { navigator.clipboard.writeText(window.location.href); }, 'Link copied to clipboard!')}
          className="w-full flex items-center justify-between p-3 hover:bg-white/10 rounded-lg transition-all group border-t border-white/5">
          <span className="text-[12px] font-medium text-white/70 group-hover:text-white">Share</span>
          <Share2 className="w-4 h-4 text-white/20 group-hover:text-[#ba9eff]" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div onClick={toggleOpen}>
        {trigger || (
          <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-white/40 hover:text-white">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && menuContent}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
