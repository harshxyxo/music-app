'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Disc3, Music2, Users, Radio, Clock, Heart, FolderOpen, Plus, X, Trash2, Pencil, Library, Download, List, Grid } from 'lucide-react';
import { usePlayerStore, Playlist } from '../store/usePlayerStore';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EditPlaylistModal from './EditPlaylistModal';
import Tooltip from './Tooltip';
import ContextMenu from './ContextMenu';

export default function Sidebar() {
  const { play, setQueue, customPlaylists, userName, setUserName, followedArtists, recentPlayed, playCounts, createPlaylist, deletePlaylist } = usePlayerStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editPlaylist, setEditPlaylist] = useState<Playlist | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortType, setSortType] = useState('Recents');
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => setMounted(true), []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) { 
      createPlaylist(newPlaylistName.trim(), isPublic); 
      setNewPlaylistName(''); 
      setIsPublic(true);
      setModalOpen(false); 
    }
  };

  const libraryLinks = [
    { name: 'Browse', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Albums', href: '/albums', icon: Disc3 },
    { name: 'Artists', href: '/artists', icon: Users },
    { name: 'Explore', href: '/explore', icon: Radio },
  ];

  const myMusicLinks = [
    { name: 'Recently Played', href: '/analytics', icon: Clock },
    { name: 'Favorite Songs', href: '/playlist/Liked%20Songs', icon: Heart },
    { name: 'Local Files', href: '/local-files', icon: FolderOpen },
  ];

  return (
    <>
      <aside className="hidden md:flex w-56 flex-shrink-0 bg-[#1A1A1A] text-white/50 flex-col h-full rounded-l-[40px] overflow-hidden">
        {/* Logo */}
        <div className="p-8 pb-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#53ddfc] shadow-[0_0_15px_rgba(83,221,252,0.4)] flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-[#0f1218]">G</span>
            </div>
            <span className="font-black text-lg text-white tracking-tighter">Groovra</span>
          </Link>
        </div>
        {/* Single Scrollable Section for Library, My Music, and Playlists */}
        <div 
          className="flex-1 overflow-y-auto pb-24 custom-scrollbar outline-none" 
          tabIndex={0} 
          onMouseEnter={(e) => e.currentTarget.focus()}
        >
          {/* Library */}
          <div className="px-4 mb-6">
            <h3 className="text-neutral-500 font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">Library</h3>
            <div className="space-y-1.5">
              {libraryLinks.map(link => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-2xl transition-all group ${active ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-[#ba9eff]' : ''}`} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* My Music */}
          <div className="px-4 mb-6">
            <h3 className="text-neutral-500 font-semibold text-[10px] uppercase tracking-[0.2em] mb-3">My Music</h3>
            <div className="space-y-1.5">
              {myMusicLinks.map(link => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-2xl transition-all group ${active ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'text-[#53ddfc]' : ''}`} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{link.name}</span>
                  </Link>
                );
              })}
              
              {/* Offline Backup - Static Item */}
              <Tooltip text="Offline Backup">
                <Link href="/offline" className="flex items-center gap-3 py-2.5 px-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all group">
                  <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Offline Backup
                </Link>
              </Tooltip>
            </div>
          </div>

          {/* Playlists */}
          <div className="px-4 flex flex-col relative pb-8 mt-2 border-t border-white/5 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-neutral-500 font-semibold text-[10px] uppercase tracking-[0.2em]">Playlists</h3>
              <div className="flex items-center gap-3 pr-2">
                <Tooltip text="Playlist Options">
                  <button onClick={() => setSortOpen(prev => !prev)} className={`text-white/20 hover:text-white transition-colors ${sortOpen ? 'text-white' : ''}`}><Library className="w-4 h-4" /></button>
                </Tooltip>
                <Tooltip text="Create New Playlist">
                  <button onClick={() => setModalOpen(true)} className="text-white/20 hover:text-[#ba9eff] transition-colors"><Plus className="w-4 h-4" /></button>
                </Tooltip>
              </div>
            </div>

            {/* Sort Dropdown */}
            <AnimatePresence>
              {sortOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute top-12 right-4 z-50 bg-[#1A1A1A] border border-white/10 p-2 rounded-2xl shadow-2xl min-w-[140px]">
                  {['Latest', 'Alphabetical', 'Track Count'].map((opt) => (
                    <button key={opt} onClick={() => { setSortType(opt); setSortOpen(false); }}
                      className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`flex-1 ${viewType === 'grid' ? 'grid grid-cols-2 gap-3 p-1' : 'space-y-1'}`}>
              {mounted && customPlaylists.map(p => (
                <div key={p.id} className={`flex items-center gap-2 group ${viewType === 'grid' ? 'flex-col items-start bg-white/[0.03] p-3 rounded-2xl transition-all hover:bg-white/[0.06] border border-white/5' : ''}`}>
                  <Link href={`/playlist/${encodeURIComponent(p.id)}`} className={`flex-1 text-[12px] font-bold text-white/30 hover:text-white transition-colors truncate ${viewType === 'grid' ? 'text-[11px] w-full text-center' : 'px-4 py-2 whitespace-nowrap'}`}>
                    {viewType === 'grid' && <div className="aspect-square bg-gradient-to-br from-white/10 to-transparent rounded-xl mb-3 flex items-center justify-center shadow-inner"><Music2 className="w-6 h-6 text-white/10" /></div>}
                    {p.name}
                  </Link>
                  {viewType === 'list' && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                      <ContextMenu context="USER_PLAYLIST" data={p} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <EditPlaylistModal playlist={editPlaylist} open={!!editPlaylist} onClose={() => setEditPlaylist(null)} />


      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-[#1A1A1A] border border-white/10 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#53ddfc] to-transparent opacity-50" />
              <button onClick={() => setModalOpen(false)} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              <h2 className="text-2xl font-black mb-2 text-white tracking-tight">Create New Playlist</h2>
              <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-8">Personalize your music collection</p>
              <form onSubmit={handleCreate}>
                <div className="relative group mb-6">
                  <input autoFocus type="text" value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} placeholder="Playlist name" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 px-6 text-white placeholder:text-white/10 focus:outline-none focus:border-[#53ddfc]/50 transition-all font-bold text-lg" />
                </div>

                <div className="flex items-center justify-between mb-8 px-2">
                  <span className="text-xs font-black uppercase tracking-widest text-white/40">Private Playlist</span>
                  <button type="button" onClick={() => setIsPublic(prev => !prev)} className={`w-12 h-6 rounded-full transition-all relative ${!isPublic ? 'bg-[#53ddfc]' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${!isPublic ? 'right-1 bg-[#0f1218]' : 'left-1 bg-white/40'}`} />
                  </button>
                </div>
                <button type="submit" disabled={!newPlaylistName.trim()} className="w-full py-5 bg-[#53ddfc] hover:bg-[#4bcceb] text-[#0f1218] text-xs font-black uppercase tracking-[0.2em] rounded-2xl disabled:opacity-20 shadow-xl shadow-[#53ddfc]/20 hover:scale-[1.02] active:scale-95 transition-all">Create Playlist</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
