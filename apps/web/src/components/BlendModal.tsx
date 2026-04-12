'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Plus } from 'lucide-react';
import { useToast } from './Toast';
import { usePlayerStore } from '../store/usePlayerStore';

export default function BlendModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useToast();
  const { userName } = usePlayerStore();
  const [uniqueLink] = useState(() => `${window.location.origin}/blend/invite/${Math.random().toString(36).substring(2, 10)}`);

  const handleInvite = () => {
    navigator.clipboard.writeText(uniqueLink);
    showToast('Unique Blend invite link copied!', 'success');
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-black/90 backdrop-blur-2xl" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#0f1218] border border-white/5 rounded-[3.5rem] p-12 w-full max-w-md relative shadow-2xl text-center overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Subtle Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#ba9eff]/10 to-transparent pointer-events-none" />
          
          <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors z-20">
            <X className="w-6 h-6" />
          </button>

          <div className="relative z-10 space-y-10">
            {/* Avatars Section */}
            <div className="flex justify-center items-center h-32 relative">
               <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#53ddfc] to-[#ba9eff] border-[6px] border-[#0f1218] shadow-2xl z-10 flex items-center justify-center">
                  <span className="text-3xl font-black text-white">{userName[0]}</span>
               </div>
               <div className="w-24 h-24 rounded-full bg-[#1a1d24] border-[6px] border-[#0f1218] shadow-2xl -ml-8 flex items-center justify-center border-dashed border-white/10">
                  <Plus className="w-10 h-10 text-white/10" />
               </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white tracking-tighter">Invite friends to Blend</h2>
              <p className="text-sm text-white/50 leading-relaxed font-medium">
                Invite up to 10 friends to a Blend, a shared playlist that gives you social recommendations based on all of your music tastes.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <button 
                onClick={handleInvite}
                className="px-10 py-4 bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
              >
                Invite
              </button>

              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 text-[10px] text-white/30 font-bold leading-relaxed uppercase tracking-widest text-left">
                Note: People in this Blend will be able to add their friends. We may also create other playlists that include social recommendations.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
