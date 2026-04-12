'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Moon, Sun, Download, Shield, User, Music } from 'lucide-react';
import { useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useToast } from './Toast';
import { useRouter } from 'next/navigation';

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { 
    volume, setVolume, isAutoplay, setAutoplay, 
    isPrivateSession, setPrivateSession, audioQuality, setAudioQuality,
    crossfadeSettings, setCrossfadeSettings, userName, userImage
  } = usePlayerStore();
  const { showToast } = useToast();
  const [language, setLanguage] = useState('en');
  const router = useRouter();

  if (!open) return null;

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    const langMap: any = { en: 'English (US)', hi: 'Hindi (हिन्दी)', pa: 'Punjabi (ਪੰਜਾਬੀ)', hr: 'Haryanvi' };
    showToast(`Language updated to ${langMap[val]}`, 'info');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={onClose} />
        <motion.div 
          initial={{ scale: 0.92, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 30 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="bg-[#12161e]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 w-full max-w-lg relative shadow-[0_40px_100px_rgba(0,0,0,0.9)] max-h-[85vh] overflow-y-auto custom-scrollbar"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all z-10"><X className="w-5 h-5" /></button>
          
          <h2 className="text-3xl font-black tracking-tight mb-8 text-white">Settings</h2>

          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4 text-white/40"><User className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest px-1">Account</span></div>
              <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#53ddfc] shadow-[0_0_20px_rgba(83,221,252,0.3)] flex-shrink-0">
                    <img src={userImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-widest">
                      {userName}
                    </p>
                    <p className="text-[10px] text-[#53ddfc] uppercase tracking-[0.2em] font-black">
                      Groovra Member
                    </p>
                  </div>
                </div>
                <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-black tracking-wider transition-all uppercase">Manage</button>
              </div>
            </section>

            {/* Quality Section */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-white/40"><Music className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest px-1">Audio Quality</span></div>
              <div className="relative">
                <select value={audioQuality} onChange={(e) => setAudioQuality(e.target.value as any)} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold appearance-none cursor-pointer focus:outline-none focus:border-[#53ddfc] text-white/80">
                  <option value="low" className="bg-[#12161e]">Low (Data Saver)</option>
                  <option value="medium" className="bg-[#12161e]">Medium (Standard)</option>
                  <option value="high" className="bg-[#12161e]">High (Extreme)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-xs text-white">▼</div>
              </div>
            </section>

            {/* Playback Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2 text-white/40"><Volume2 className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-widest px-1">Playback</span></div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Autoplay</p>
                  <p className="text-[10px] text-white/30">Keep playing similar songs when music ends</p>
                </div>
                <button onClick={() => setAutoplay(!isAutoplay)} 
                  className={`w-10 h-5 rounded-full relative transition-all ${isAutoplay ? 'bg-[#53ddfc]' : 'bg-white/10'}`}>
                  <motion.div animate={{ x: isAutoplay ? 21 : 3 }} className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-md" />
                </button>
              </div>

              {/* Crossfade Section */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">Crossfade</p>
                  <span className="text-[10px] font-black text-[#53ddfc] uppercase tracking-widest">{crossfadeSettings}s</span>
                </div>
                <div className="relative group">
                  <input 
                    type="range" 
                    min={0} 
                    max={10} 
                    value={crossfadeSettings} 
                    onChange={(e) => setCrossfadeSettings(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#53ddfc]" 
                  />

                </div>
                <p className="text-[9px] text-white/20 mt-2 uppercase tracking-widest font-bold">Seamless transitions between tracks</p>
              </div>
            </section>

            {/* Social Section - Removed Private Session as requested */}
            
            <section className="pt-8 border-t border-white/5">
              <button 
                onClick={() => {
                  localStorage.removeItem('isAuthenticated');
                  localStorage.removeItem('groovra-storage'); // Clear store as well for full logout
                  router.push('/auth');
                  onClose();
                }}
                className="w-full py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 group"
              >
                Log Out
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              </button>
            </section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
