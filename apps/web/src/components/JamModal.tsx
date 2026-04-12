'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Zap, Hash, Copy, Check, Share2, Play } from 'lucide-react';
import { useState } from 'react';
import { useToast } from './Toast';
import { socketService } from '../services/socket';
import { usePlayerStore } from '../store/usePlayerStore';

export default function JamModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [uniqueLink] = useState(() => `${window.location.origin}/jam/${Math.random().toString(36).substring(2, 10)}`);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [autoInvite, setAutoInvite] = useState(false);
  const { showToast } = useToast();
  const { userName, queue, currentTrack, play } = usePlayerStore();

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'GRV-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomCode(code);
    socketService.joinRoom(code);
    showToast(`Jam Session Started!`, 'success');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(uniqueLink);
    showToast('Unique Jam link copied!', 'success');
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-[#121212] border border-white/10 rounded-[2.5rem] w-full max-w-2xl relative shadow-2xl flex flex-col h-[85vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1ed760] to-[#1db954] flex items-center justify-center shadow-lg">
                   <Users className="w-6 h-6 text-black" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tighter">{userName || 'User'}'s Jam</h2>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-white/40" /></button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10 pb-32">
             <div className="space-y-6 text-center">
                <p className="text-sm font-bold text-white/70">Invite friends to your Jam</p>
                <div className="flex justify-center">
                   <button 
                     onClick={copyLink}
                     className="px-10 py-4 bg-[#1ed760] hover:bg-[#1db954] text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-full transition-all flex items-center gap-3 shadow-xl shadow-[#1ed760]/20"
                   >
                     <Share2 className="w-4 h-4" /> Share link
                   </button>
                </div>
             </div>

             <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="space-y-1">
                   <p className="text-sm font-bold text-white">Auto-invite people nearby</p>
                   <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.1em]">People on your Wi-Fi will be invited.</p>
                </div>
                <button 
                  onClick={() => setAutoInvite(!autoInvite)}
                  className={`w-12 h-6 rounded-full transition-all relative ${autoInvite ? 'bg-[#1ed760]' : 'bg-white/10'}`}
                >
                  <motion.div animate={{ x: autoInvite ? 26 : 4 }} className="absolute top-1 w-4 h-4 rounded-full bg-white" />
                </button>
             </div>

             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-sm font-black text-white/90 uppercase tracking-widest">Queue</h3>
                   <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Playing On Repeat</span>
                </div>
                <div className="space-y-3">
                   {queue.length === 0 ? (
                      <p className="text-center py-10 text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Queue is empty</p>
                   ) : queue.map((track: any, i: number) => (
                      <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${track.id === currentTrack?.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}>
                         <div className="w-12 h-12 rounded-lg overflow-hidden relative group">
                            <img src={track.coverImage} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => play(track)}>
                               <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${track.id === currentTrack?.id ? 'text-[#1ed760]' : 'text-white'}`}>
                               {track.id === currentTrack?.id && <span className="mr-2 italic">...</span>}
                               {track.title}
                            </p>
                            <p className="text-[10px] text-white/40 font-bold truncate mt-0.5">{track.artist}</p>
                         </div>
                         <Hash className="w-4 h-4 text-white/10" />
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
