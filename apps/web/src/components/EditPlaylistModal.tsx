'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Image } from 'lucide-react';
import { useState } from 'react';
import { usePlayerStore, Playlist } from '../store/usePlayerStore';
import { useToast } from './Toast';

export default function EditPlaylistModal({ playlist, open, onClose }: { playlist: Playlist | null; open: boolean; onClose: () => void }) {
  const [name, setName] = useState(playlist?.name || '');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(playlist?.isPublic ?? true);
  const { customPlaylists } = usePlayerStore();
  const { showToast } = useToast();

  // Sync name when playlist changes
  if (playlist && name !== playlist.name && !open) {
    // will be reset on open
  }

  const handleSave = () => {
    if (!playlist || !name.trim()) return;
    // Update playlist name in store (we modify the store directly)
    const store = usePlayerStore.getState();
    const updated = store.customPlaylists.map(p => p.id === playlist.id ? { ...p, name: name.trim(), isPublic } : p);
    usePlayerStore.setState({ customPlaylists: updated });
    showToast(`Playlist renamed to "${name.trim()}"`, 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && playlist && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-xl" onClick={onClose}>
          <motion.div 
            initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-[#12161e]/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 w-full max-w-md relative shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all"><X className="w-5 h-5" /></button>
            <h2 className="text-2xl font-black tracking-tight mb-6">Edit Playlist</h2>

            <div className="flex gap-5 mb-6">
              {/* Cover placeholder */}
              <div className="w-32 h-32 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors flex-shrink-0 group">
                <div className="text-center">
                  <Image className="w-8 h-8 text-white/20 group-hover:text-white/40 mx-auto mb-1 transition-colors" />
                  <span className="text-[10px] font-medium text-white/30">Upload Cover</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1 block">Name</label>
                  <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#53ddfc] transition-all text-sm font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1 block">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a description..." rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#53ddfc] transition-all text-sm font-medium resize-none" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Private Playlist</span>
                  <button type="button" onClick={() => setIsPublic(!isPublic)} className={`w-10 h-5 rounded-full transition-all relative ${!isPublic ? 'bg-[#53ddfc]' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${!isPublic ? 'right-1 bg-[#0f1218]' : 'left-1 bg-white/40'}`} />
                  </button>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={!name.trim()} className="w-full py-4 bg-gradient-to-r from-[#ba9eff] to-[#53ddfc] text-black text-sm font-black rounded-2xl disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg">
              Save Changes
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
