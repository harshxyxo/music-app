'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Check, Music2 } from 'lucide-react';
import { searchTracks } from '@/services/saavn';
import { Track, usePlayerStore } from '@/store/usePlayerStore';

interface AddSongsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
}

export default function AddSongsModal({ isOpen, onClose, playlistId }: AddSongsModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToPlaylist, customPlaylists } = usePlayerStore();
  
  const playlist = customPlaylists.find(p => p.id === playlistId);
  const currentTrackIds = new Set(playlist?.tracks.map(t => t.id) || []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await searchTracks(query);
        setResults(searchResults);
      } catch (err) {
        console.error('Search failed:', err);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Add Songs</h2>
            <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-1">Search for tracks to add to your playlist</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-8 mb-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[#ba9eff] transition-colors" />
            <input 
              autoFocus
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for songs, artists, or albums..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-white/10 focus:outline-none focus:border-[#ba9eff]/50 transition-all font-bold"
            />
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[#ba9eff]/20 border-t-[#ba9eff] rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ba9eff]/40">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((track) => {
                const isAdded = currentTrackIds.has(track.id);
                return (
                  <div key={track.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-white/5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shrink-0">
                      <img src={track.coverImage} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate mb-0.5">{track.title}</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest truncate">{track.artist}</p>
                    </div>
                    <button 
                      onClick={() => !isAdded && addToPlaylist(playlistId, track)}
                      disabled={isAdded}
                      className={`p-3 rounded-xl transition-all ${isAdded ? 'bg-[#ba9eff]/10 text-[#ba9eff]' : 'bg-white/5 text-white/20 hover:bg-[#ba9eff] hover:text-[#0f1218] hover:scale-105 active:scale-95'}`}
                    >
                      {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/10">
              <Music2 className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">No tracks found</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-white/5">
              <Search className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-sm font-black uppercase tracking-widest">Type to start searching</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
