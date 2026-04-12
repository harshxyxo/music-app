'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Volume2, VolumeX, Music, Users, Clock, Flame } from 'lucide-react';

interface StorySlide {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  color: string;
  icon: any;
  image?: string;
}

interface RecapStoryProps {
  open: boolean;
  onClose: () => void;
  data: {
    totalMinutes: number;
    topArtist: string;
    topArtistImage?: string;
    topSong: string;
    topSongImage?: string;
  };
}

export default function RecapStory({ open, onClose, data }: RecapStoryProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  const slides: StorySlide[] = [
    {
      id: 'welcome',
      title: 'Wait, what was that?',
      subtitle: 'Your year in music just flashed before our eyes.',
      value: `${new Date().getFullYear()} Recap`,
      color: 'bg-[#ba9eff]',
      icon: Music
    },
    {
      id: 'minutes',
      title: 'You really went for it.',
      subtitle: 'Total minutes spent vibing on Groovra.',
      value: `${data.totalMinutes.toLocaleString()} Minutes`,
      color: 'bg-[#53ddfc]',
      icon: Clock
    },
    {
      id: 'top-song',
      title: 'One song stood out.',
      subtitle: 'Your most played track of the year.',
      value: data.topSong,
      color: 'bg-[#ff6b6b]',
      icon: Music,
      image: data.topSongImage
    },
    {
      id: 'top-artist',
      title: 'Your Main Character.',
      subtitle: 'Nobody came close to this artist.',
      value: data.topArtist,
      color: 'bg-[#ba9eff]',
      icon: Users,
      image: data.topArtistImage
    },
    {
      id: 'wrap-up',
      title: 'This was your year.',
      subtitle: 'Thanks for being part of the Groovra journey.',
      value: 'Keep it Loud',
      color: 'bg-[#0f1218]',
      icon: Flame
    }
  ];

  useEffect(() => {
    if (!open) return;
    
    const duration = 5000; // 5s per slide
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(curr => curr + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [open, currentSlide, slides.length, onClose]);

  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
      setProgress(0);
    }
  }, [open]);

  if (!open) return null;

  const current = slides[currentSlide];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-black flex flex-center justify-center p-0 md:p-10"
      >
        <div className="relative w-full max-w-[450px] aspect-[9/16] bg-[#0f1218] overflow-hidden rounded-none md:rounded-[2.5rem] shadow-2xl flex flex-col">
          
          {/* Progress Bars */}
          <div className="absolute top-6 inset-x-6 z-50 flex gap-1.5 px-2">
            {slides.map((_, i) => (
              <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: i === currentSlide ? `${progress}%` : (i < currentSlide ? '100%' : '0%') 
                  }}
                  className="h-full bg-white transition-none"
                />
              </div>
            ))}
          </div>

          {/* Close Button */}
          <button onClick={onClose} className="absolute top-12 right-8 z-50 p-2 bg-black/20 backdrop-blur-xl rounded-full text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Content Area */}
          <motion.div 
            key={current.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className={`flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden ${current.color}`}
          >
            {/* Background elements */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-20%] w-full h-full bg-white/20 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-20%] w-full h-full bg-black/20 blur-[100px] rounded-full" />
            </div>

            {current.image ? (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-12 relative w-64 h-64 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/20">
                <img src={current.image} className="w-full h-full object-cover" alt="" />
              </motion.div>
            ) : (
                <div className="mb-12 p-10 bg-white/10 rounded-full border border-white/20 backdrop-blur-xl">
                  <current.icon className="w-20 h-20 text-white" />
                </div>
            )}

            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 mb-4">{current.subtitle}</p>
              <h2 className="text-4xl font-black text-white leading-[0.9] tracking-tight mb-8 px-4">{current.title}</h2>
              <div className="inline-block px-8 py-4 bg-white text-black rounded-2xl shadow-xl">
                <span className="text-xs font-black uppercase tracking-widest">{current.value}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Navigation Controls */}
          <div className="absolute inset-y-0 inset-x-0 flex z-30">
            <div 
              className="flex-1 cursor-pointer" 
              onClick={() => {
                if (currentSlide > 0) { setCurrentSlide(curr => curr - 1); setProgress(0); }
              }}
            />
            <div 
              className="flex-1 cursor-pointer" 
              onClick={() => {
                if (currentSlide < slides.length - 1) { setCurrentSlide(curr => curr + 1); setProgress(0); }
                else onClose();
              }}
            />
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
