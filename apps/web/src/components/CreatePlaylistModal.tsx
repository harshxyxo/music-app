'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ListMusic, Check } from 'lucide-react';
import { useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useToast } from './Toast';

export default function CreatePlaylistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const { createPlaylist } = usePlayerStore();
  const { showToast } = useToast();

  const handleCreate = () => {
    if (!name.trim()) {
      showToast('Please enter a playlist name', 'error');
      return;
    }
    createPlaylist(name, isPublic);
    showToast(`Playlist "${name}" created!`, 'success');
    setName('');
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#1a1d24] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-md relative shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#53ddfc]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#53ddfc]/20">
                <ListMusic className="w-8 h-8 text-[#53ddfc]" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Create Playlist</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 mb-2 block">Playlist Name</label>
                <input 
                  type="text" 
                  placeholder="My awesome mix"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-[#53ddfc] transition-all placeholder:text-white/10"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-white">Public Playlist</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Visible on your profile</p>
                </div>
                <button 
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isPublic ? 'bg-[#53ddfc]' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: isPublic ? 26 : 4 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleCreate}
                  className="w-full py-4 bg-[#53ddfc] text-[#0f1218] text-[11px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#53ddfc]/20"
                >
                  Create Playlist
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
