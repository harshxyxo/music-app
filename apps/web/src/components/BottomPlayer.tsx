'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, 
  ChevronDown, Heart, ListMusic, Volume2, Share2, 
  MoreHorizontal, Download, Plus, Mic2, Users, 
  AlignLeft, CheckCircle2, Clock, Music, X, Zap, Sliders, Moon
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useState, useRef, useEffect, useCallback } from 'react';
import AudioVisualizer from './AudioVisualizer';
import Link from 'next/link';
import { fetchLyrics } from '../services/lyrics';
import { useToast } from './Toast';
import { socketService } from '../services/socket';
import Tooltip from './Tooltip';
import ContextMenu from './ContextMenu';
import React from 'react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';

// --- Memoized Lyrics Component ---
const MemoizedLyrics = React.memo(({ 
  isLoadingLyrics, 
  syncedLyrics, 
  lyrics, 
  currentTime, 
  duration, 
  containerRef,
}: { 
  isLoadingLyrics: boolean; 
  syncedLyrics: any[]; 
  lyrics: string; 
  currentTime: number; 
  duration: number; 
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const activeLineRef = useRef<number>(-1);

  let activeIndex = -1;
  if (syncedLyrics.length > 0) {
    activeIndex = syncedLyrics.findIndex((line, i) => {
      const isPast = currentTime >= line.time;
      const isNext = syncedLyrics[i + 1] ? currentTime < syncedLyrics[i + 1].time : true;
      return isPast && isNext;
    });
  } else if (lyrics) {
    const lines = lyrics.split('\n').filter(l => l.trim());
    const estimatedTimePerLine = (duration || 180) / lines.length;
    activeIndex = Math.floor(currentTime / estimatedTimePerLine);
  }

  useEffect(() => {
    if (activeIndex !== activeLineRef.current && containerRef.current && activeIndex !== -1) {
      activeLineRef.current = activeIndex;
      const activeElement = containerRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        containerRef.current.scrollTo({
          top: activeElement.offsetTop - containerRef.current.clientHeight / 2 + activeElement.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeIndex, containerRef]);

  return (
    <div className="bg-[#1a1a1c] rounded-[2.5rem] p-6 border border-white/5 relative overflow-hidden h-64 max-h-[40vh] flex flex-col backdrop-blur-md">
      <div className="absolute top-4 right-6 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-gold)] opacity-50">Real-time Lyrics</div>
      <div 
        ref={containerRef} 
        className="w-full max-w-2xl mx-auto overflow-y-auto scrollbar-hide bg-transparent outline-none border-none space-y-4 scroll-smooth pb-4 flex-1 transition-all duration-700"
      >
        {isLoadingLyrics ? (
          <p className="text-xl font-medium text-white/20 animate-pulse text-center py-20 uppercase tracking-widest text-[10px]">Syncing Lyrics...</p>
        ) : syncedLyrics.length > 0 ? (
          syncedLyrics.map((line, i) => (
            <p key={i} className={`text-xl font-black tracking-tight transition-all duration-500 ${i === activeIndex ? 'text-white scale-105' : 'text-white/10'}`}>
              {line.text}
            </p>
          ))
        ) : lyrics && lyrics !== 'Lyrics not found' ? (
          lyrics.split('\n').filter(l => l.trim()).map((line, i) => (
            <p key={i} className={`text-xl font-black tracking-tight transition-all duration-700 ${i === activeIndex ? 'text-white scale-105' : 'text-white/10'}`}>
              {line}
            </p>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <Music className="w-8 h-8 text-white/5" />
            <p className="text-sm font-black tracking-tight text-white/20 uppercase">Lyrics Unavailable</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default function BottomPlayer() {
  const { 
    currentTrack, isPlaying, volume, currentTime, duration, queue,
    play, pause, togglePlay, setTime, playNext, playPrevious, setVolume,
    isShuffle, isRepeat, toggleShuffle, toggleRepeat,
    isAutoplay, setQueue, isRightSidebarOpen, toggleRightSidebar, toggleFollow, followedArtists,
    addToOffline, crossfadeSettings, setCrossfadeSettings, sleepTimer, setSleepTimer, likedSongs, toggleLike
  } = usePlayerStore();
  const { showToast } = useToast();
  
  const [expanded, setExpanded] = useState(false);
  const playerRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(0);
  const [seekPos, setSeekPos] = useState(0);
  
  const [lyrics, setLyrics] = useState<string>('');
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [showPlayerMenu, setShowPlayerMenu] = useState(false);
  const [syncedLyrics, setSyncedLyrics] = useState<{ time: number, text: string }[]>([]);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const playlistRef = useRef<HTMLDivElement>(null);
  const [artistInfo, setArtistInfo] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Click Outside for Menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowPlayerMenu(false);
      if (playlistRef.current && !playlistRef.current.contains(event.target as Node)) setShowPlaylistSelector(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Artist Detail
  useEffect(() => {
    if (currentTrack?.artistId) {
      fetch(`/api/yt/artist?id=${currentTrack.artistId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setArtistInfo(data);
        })
        .catch(err => console.error('Artist fetch error:', err));
    } else {
      setArtistInfo(null);
    }
  }, [currentTrack?.artistId]);

  // Global Exposure
  useEffect(() => {
    if (playerRef.current) (window as any).groovraPlayer = playerRef.current;
  }, [playerRef.current]);

  // Load YouTube IFrame API
  useEffect(() => {
    if ((window as any).YT) return;
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  // Initialize/Update Player
  useEffect(() => {
    const videoId = currentTrack?.audioUrl.split('v=')[1]?.split('&')[0] || currentTrack?.id;
    if (!videoId) return;

    const initPlayer = () => {
      if (!videoId || !(window as any).YT) return;
      if (playerRef.current?.loadVideoById) {
        playerRef.current.loadVideoById(videoId);
        if (isPlaying) playerRef.current.playVideo();
        else playerRef.current.pauseVideo();
        return;
      }
      playerRef.current = new (window as any).YT.Player('youtube-player-hidden', {
        height: '0', width: '0', videoId,
        playerVars: { 'autoplay': isPlaying ? 1 : 0, 'controls': 0, 'disablekb': 1 },
        events: {
          onReady: (event: any) => event.target.setVolume(volume * 100),
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              if (isRepeat) event.target.playVideo();
              else if (isAutoplay) playNext();
              else pause();
            }
          }
        }
      });
    };

    if ((window as any).YT?.Player) initPlayer();
    else (window as any).onYouTubeIframeAPIReady = initPlayer;

    if (currentTrack) {
      setIsLoadingLyrics(true);
      fetchLyrics(currentTrack.artist, currentTrack.title).then(lyricText => {
        setIsLoadingLyrics(false);
        if (!lyricText) { setLyrics('Lyrics not found'); setSyncedLyrics([]); return; }
        const lrc: { time: number, text: string }[] = [];
        lyricText.split('\n').forEach(line => {
          const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
          if (match) lrc.push({ time: parseInt(match[1]) * 60 + parseFloat(match[2]), text: match[3].trim() });
        });
        if (lrc.length > 0) { setSyncedLyrics(lrc); setLyrics(''); }
        else { setSyncedLyrics([]); setLyrics(lyricText); }
      });
    }
  }, [currentTrack]);

  // Progress Tracker
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging && playerRef.current && isPlaying) {
        const current = playerRef.current.getCurrentTime?.() || 0;
        const dur = playerRef.current.getDuration?.() || 0;
        if (dur > 0) {
          setTime(current, dur);
          
          // Crossfade Logic (Volume Fade Out)
          const { crossfadeSettings, volume } = usePlayerStore.getState();
          if (crossfadeSettings > 0 && (dur - current) <= crossfadeSettings) {
            const remaining = dur - current;
            const factor = Math.max(0, remaining / crossfadeSettings);
            playerRef.current.setVolume(volume * 100 * factor);
            
            // Trigger next slightly before end to ensure gapless feel
            if (remaining <= 0.2) {
              playNext();
            }
          } else {
            // Restore normal volume
            playerRef.current.setVolume(volume * 100);
          }
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, isDragging, setTime]);

  // Sleep Timer Implementation
  useEffect(() => {
    if (sleepTimer && sleepTimer > 0 && isPlaying) {
      const timeout = setTimeout(() => {
        if (playerRef.current?.pauseVideo) {
          playerRef.current.pauseVideo();
          pause();
          setSleepTimer(null);
          showToast("Sleep timer: Playback paused", "info");
        }
      }, sleepTimer * 60 * 1000);
      return () => clearTimeout(timeout);
    }
  }, [sleepTimer, isPlaying, pause, setSleepTimer, showToast]);

  // Socket Synchronization (Emit changes to room)
  useEffect(() => {
    if (currentTrack) {
      socketService.emitTrackChange(currentTrack);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (playerRef.current?.getCurrentTime) {
      const currentTime = playerRef.current.getCurrentTime();
      socketService.emitPlayState(isPlaying, currentTime);
    }
  }, [isPlaying]);

  // Robust Firestore History Sync (using setDoc with merge for reliability)
  useEffect(() => {
    const syncToFirestore = async () => {
      const user = auth.currentUser;
      if (user && currentTrack) {
        try {
          // Map to the requested structure: id, name, artist, duration, coverUrl
          const trackData = {
            id: currentTrack.id,
            name: currentTrack.title,
            artist: currentTrack.artist,
            duration: currentTrack.duration || usePlayerStore.getState().duration || 0,
            coverUrl: currentTrack.coverImage || ''
          };

          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            recentlyPlayed: arrayUnion(trackData)
          }, { merge: true });
          
          console.log('Synced to Firestore:', currentTrack.title);
        } catch (err) {
          console.error('Firestore sync error:', err);
        }
      }
    };
    
    if (currentTrack?.id) {
       syncToFirestore();
    }
  }, [currentTrack?.id]);

  const { bassBoost, setBassBoost, addToQueue } = usePlayerStore();

  // Sync isPlaying with YouTube Player
  useEffect(() => {
    if (!playerRef.current?.playVideo) return;
    if (isPlaying) playerRef.current.playVideo();
    else playerRef.current.pauseVideo();
  }, [isPlaying]);

  const handleTogglePlay = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60), secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const posValue = isDragging ? localValue : currentTime;
  const progressPercent = duration > 0 ? (posValue / duration) * 100 : 0;
  const hdCover = currentTrack?.coverImage?.replace('150x150', '500x500') || currentTrack?.coverImage;

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0, height: expanded ? '100dvh' : '65px', borderRadius: expanded ? '0px' : '40px' }}
        transition={{ type: 'spring', damping: 40, stiffness: 350 }}
        className={`z-[150] shadow-2xl flex flex-col overflow-hidden ${expanded ? 'fixed inset-0 w-full bg-[#0a0a0c]' : 'fixed bottom-20 md:bottom-4 inset-x-0 mx-auto w-[calc(100%-1rem)] md:w-full max-w-4xl bg-black/80 backdrop-blur-xl border border-white/10 px-3 md:px-4'}`}
      >
        <div id="youtube-player-hidden" className="hidden" />

        {/* Global Popups for both expanded/collapsed if needed */}
        <AnimatePresence>
          {showPlaylistSelector && !expanded && (
            <motion.div 
              ref={playlistRef}
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="fixed bottom-20 left-4 w-56 bg-[#1a1a1c] border border-white/10 rounded-2xl shadow-2xl p-2 z-[200]"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 px-3 py-2">Add to Playlist</p>
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                 {usePlayerStore.getState().customPlaylists.length === 0 ? (
                   <p className="text-[10px] text-white/20 text-center py-4">No playlists found</p>
                 ) : usePlayerStore.getState().customPlaylists.map(p => (
                   <button key={p.id} onClick={() => { usePlayerStore.getState().addToPlaylist(p.id, currentTrack); showToast(`Added to ${p.name}`, 'success'); setShowPlaylistSelector(false); }} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                      <p className="text-xs font-bold text-white/90 truncate">{p.name}</p>
                      <p className="text-[9px] text-white/20 uppercase font-black">{p.tracks.length} tracks</p>
                   </button>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!expanded ? (
          <div className="flex items-center justify-between w-full h-full gap-2 md:gap-4 flex-nowrap">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 md:min-w-[150px] flex-1 md:flex-none cursor-pointer" onClick={() => setExpanded(true)}>
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                <img src={currentTrack.coverImage} className="w-full h-full aspect-square object-cover" alt="" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[12px] text-white truncate">{currentTrack.title}</p>
                <Link 
                  href={`/artist/${encodeURIComponent(currentTrack.artist)}`} 
                  onClick={e => e.stopPropagation()} 
                  className="text-[10px] text-white/40 hover:text-white transition-colors truncate block"
                >
                  {currentTrack.artist}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
              <button onClick={playPrevious} className="hidden md:block text-white/40 hover:text-white transition-colors"><SkipBack className="w-4 h-4" /></button>
              <button onClick={handleTogglePlay} className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                {isPlaying ? <Pause className="w-4 h-4 text-black fill-current" /> : <Play className="w-4 h-4 text-black fill-current ml-0.5" />}
              </button>
              <button onClick={playNext} className="text-white/40 hover:text-white transition-colors"><SkipForward className="w-4 h-4" /></button>
            </div>
            <div className="hidden md:flex flex-1 relative h-10 bg-white/5 rounded-full overflow-hidden items-center px-4 cursor-pointer">
               <div className="absolute left-0 top-0 h-full bg-[var(--accent-gold)]/20 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                <input type="range" min={0} max={duration || 100} value={isDragging ? seekPos : posValue}
                  onPointerDown={() => setIsDragging(true)}
                  onChange={(e) => {
                    setIsDragging(true);
                    setSeekPos(Number(e.target.value));
                    setLocalValue(Number(e.target.value));
                  }}
                  onPointerUp={() => {
                    if (playerRef.current && playerRef.current.seekTo) {
                      playerRef.current.seekTo(seekPos, true);
                    }
                    setIsDragging(false);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 appearance-none" />
               <div className="relative w-full flex justify-between items-center pointer-events-none">
                 <span className="text-[10px] font-black text-white/30 tabular-nums">{formatTime(posValue)}</span>
                 <div className="flex-1 mx-4 h-[1px] bg-white/10" />
                 <span className="text-[10px] font-black text-white/30 tabular-nums">{formatTime(duration)}</span>
               </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col relative bg-[#0a0a0c]">
             {/* Background Blur */}
            <div className="absolute inset-0 z-0 opacity-40 overflow-hidden pointer-events-none">
              <img src={hdCover} className="w-full h-full object-cover blur-[140px] scale-150" alt="" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-[#0a0a0c]" />
            </div>

            {/* Top Bar - Header */}
            <div className="relative z-20 w-full px-8 pt-2 pb-0 flex items-center justify-between flex-shrink-0">
              <button onClick={() => setExpanded(false)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"><ChevronDown className="w-6 h-6 text-white" /></button>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--accent-gold)] mb-1">Now Playing</p>
                <h2 className="text-lg font-black text-white uppercase tracking-widest">{currentTrack.title}</h2>
              </div>
              <button onClick={() => toggleRightSidebar()} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all"><ListMusic className="w-6 h-6" /></button>
            </div>

            {/* Scrollable Area - Content Container */}
            <div className="relative z-10 flex-1 overflow-y-auto px-12 pt-6 custom-scrollbar">
               <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-40">
                  
                  {/* LEFT COLUMN: Art, Song Title, Title, Transport */}
                  <div className="lg:col-span-4 space-y-8">
                     <div className="aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl bg-white/5 p-4 backdrop-blur-3xl group">
                        <img src={hdCover} className="w-full h-full aspect-square object-cover rounded-[2.5rem] group-hover:scale-105 transition-transform duration-1000" alt="" />
                     </div>

                     <div className="space-y-4 px-2">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h1 className="text-4xl font-black text-white tracking-tighter leading-tight">{currentTrack.title}</h1>
                              <div className="flex items-center gap-2">
                                 <Link 
                                   href={`/artist/${encodeURIComponent(currentTrack.artist)}`}
                                   onClick={() => setExpanded(false)}
                                   className="text-xl font-bold text-[#ba9eff] hover:text-white transition-colors"
                                 >
                                   {currentTrack.artist}
                                 </Link>
                                 <CheckCircle2 className="w-4 h-4 text-[#ba9eff]" />
                              </div>
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/heart">
                              <Heart className={`w-6 h-6 transition-all ${likedSongs.some(track => track.id === currentTrack.id) ? 'text-pink-500 fill-pink-500 scale-110' : 'text-white/20 group-heart:text-white'}`} />
                           </button>
                        </div>
                     </div>

                     {/* Transport Controls Card */}
                     <div className="bg-[#1a1a1c] rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-3xl">
                        <div className="relative w-full h-1.5 bg-white/5 rounded-full mb-8 group cursor-pointer overflow-hidden">
                           <motion.div className="absolute h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{ width: `${progressPercent}%` }} />
                            <input type="range" min={0} max={duration || 100} value={isDragging ? seekPos : posValue}
                              onPointerDown={() => setIsDragging(true)}
                              onChange={(e) => {
                                setIsDragging(true);
                                setSeekPos(Number(e.target.value));
                                setLocalValue(Number(e.target.value));
                              }}
                              onPointerUp={() => {
                                if (playerRef.current && playerRef.current.seekTo) {
                                  playerRef.current.seekTo(seekPos, true);
                                }
                                setIsDragging(false);
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 appearance-none" />
                        </div>
                        <div className="flex justify-between items-center mb-8">
                           <span className="text-[10px] font-black text-white/30 tabular-nums">{formatTime(posValue)}</span>
                           <div className="flex items-center gap-10">
                             <SkipBack onClick={playPrevious} className="w-8 h-8 text-white/40 hover:text-white cursor-pointer transition-all active:scale-90" />
                             <button onClick={handleTogglePlay} className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all shadow-xl">
                                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                             </button>
                             <SkipForward onClick={playNext} className="w-8 h-8 text-white/40 hover:text-white cursor-pointer transition-all active:scale-90" />
                           </div>
                           <span className="text-[10px] font-black text-white/30 tabular-nums">{formatTime(duration)}</span>
                        </div>
                        <div className="flex justify-center gap-10 border-t border-white/5 pt-6">
                           <Shuffle onClick={toggleShuffle} className={`w-5 h-5 cursor-pointer ${isShuffle ? 'text-[var(--accent-gold)]' : 'text-white/20 hover:text-white'}`} />
                           <Repeat onClick={toggleRepeat} className={`w-5 h-5 cursor-pointer ${isRepeat ? 'text-[var(--accent-gold)]' : 'text-white/20 hover:text-white'}`} />
                           <Clock className="w-5 h-5 text-white/20 hover:text-white cursor-pointer" />
                        </div>
                     </div>
                  </div>

                  {/* CENTER COLUMN: About Artist Card */}
                  <div className="lg:col-span-4 space-y-8">
                     <div className="bg-[#1a1a1c] rounded-[2.5rem] overflow-hidden border border-white/5 backdrop-blur-3xl flex flex-col group">
                        <div className="h-48 relative overflow-hidden">
                           <img src={artistInfo?.image || hdCover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4000ms]" alt="" />
                           <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1c] via-black/40 to-transparent" />
                           <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">Verified Artist</div>
                        </div>

                        <div className="p-8 space-y-6">
                           <div>
                              <h3 className="text-2xl font-black text-white mb-1">About {currentTrack.artist}</h3>
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{artistInfo ? '46,081,110 monthly listeners' : 'Loading stats...'}</p>
                           </div>

                           <p className="text-xs text-white/50 leading-relaxed line-clamp-4 font-medium">
                             {artistInfo?.description || `${currentTrack.artist} is pushing the boundaries of the genre, blending cinematic melodies with modern rhythms. Experience the journey of a world-class sound architect.`}
                           </p>

                            <button 
                              onClick={() => toggleFollow({ name: currentTrack.artist, image: artistInfo?.image || currentTrack.coverImage })}
                              className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                            >
                              {followedArtists.some(a => a.name === currentTrack.artist) ? 'Following' : 'Follow Artist'}
                            </button>
                         </div>
                      </div>

                      {/* Lyrics Space Fix: Inserted below Artist Card */}
                      <MemoizedLyrics 
                        isLoadingLyrics={isLoadingLyrics}
                        syncedLyrics={syncedLyrics}
                        lyrics={lyrics}
                        currentTime={currentTime}
                        duration={duration}
                        containerRef={lyricsContainerRef}
                      />
                   </div>

                  {/* RIGHT COLUMN: Next in Queue */}
                  <div className="lg:col-span-4 space-y-8">
                     <div className="bg-[#1a1a1c] rounded-[3rem] p-8 border border-white/5 backdrop-blur-3xl flex flex-col min-h-[500px]">
                        <div className="flex items-center justify-between mb-8">
                           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Next in Queue</h3>
                           <button onClick={() => toggleRightSidebar()} className="text-[9px] font-bold text-[#ba9eff] uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        <div className="space-y-4 pr-2 custom-scrollbar">
                           {queue.slice(0, 10).map((track, i) => (
                             <div key={i} onClick={() => play(track)} className={`flex items-center gap-4 group cursor-pointer p-3 rounded-2xl transition-all border border-transparent hover:border-white/5 ${track.id === currentTrack.id ? 'bg-white/5 border-white/5' : 'hover:bg-white/5'}`}>
                                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
                                   <img src={track.coverImage} className="w-full h-full aspect-square object-cover" alt="" />
                                   {track.id === currentTrack.id && (
                                     <div className="absolute inset-0 bg-[#ba9eff]/20 flex items-center justify-center">
                                       <div className="w-1 h-3 bg-[#ba9eff] rounded-full animate-bounce" />
                                     </div>
                                   )}
                                </div>
                                <div className="min-w-0 flex-1">
                                   <p className={`text-[12px] font-black truncate ${track.id === currentTrack.id ? 'text-[#ba9eff]' : 'text-white'}`}>{track.title}</p>
                                   <p className="text-[10px] font-bold text-white/20 uppercase tracking-tight">{track.artist}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Spacer to allow scrolling past the fixed footer */}
               <div className="h-40 flex-shrink-0" />
            </div>

            {/* Bottom Action Bar - Pill shaped bar at the bottom */}
            <div className="absolute bottom-12 inset-x-0 z-[100] w-full flex justify-center pointer-events-none">
               <div className="flex items-center gap-8 bg-[#1a1a1c]/90 backdrop-blur-3xl px-10 py-5 rounded-full border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] pointer-events-auto relative">
                  
                  {/* Playlist Selector Dropup */}
                  <AnimatePresence>
                    {showPlaylistSelector && (
                      <motion.div 
                        ref={playlistRef}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-20 left-4 w-56 bg-[#1a1a1c] border border-white/10 rounded-2xl shadow-2xl p-2 z-[110]"
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 px-3 py-2">Add to Playlist</p>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                           {usePlayerStore.getState().customPlaylists.length === 0 ? (
                             <p className="text-[10px] text-white/20 text-center py-4">No playlists found</p>
                           ) : usePlayerStore.getState().customPlaylists.map(p => (
                             <button key={p.id} onClick={() => { usePlayerStore.getState().addToPlaylist(p.id, currentTrack); showToast(`Added to ${p.name}`, 'success'); setShowPlaylistSelector(false); }} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                                <p className="text-xs font-bold text-white/90 truncate">{p.name}</p>
                                <p className="text-[9px] text-white/20 uppercase font-black">{p.tracks.length} tracks</p>
                             </button>
                           ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 3-Dots Menu Dropup (Audio FX & Settings) */}
                  <AnimatePresence>
                    {showPlayerMenu && (
                      <motion.div 
                        ref={menuRef}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-20 right-4 w-64 bg-[#1a1a1c] border border-white/10 rounded-[2rem] shadow-2xl p-4 z-[110] space-y-6"
                      >
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4 px-1">Audio Settings</p>
                           <div className="space-y-4">
                              <div className="flex items-center justify-between px-1">
                                 <span className="text-xs font-bold text-white/70">Equalizer (Bass Boost)</span>
                                  <button 
                                    onClick={() => setBassBoost(bassBoost > 0 ? 0 : 15)}
                                    className={`w-10 h-5 rounded-full transition-all relative ${bassBoost > 0 ? 'bg-[var(--accent-gold)]' : 'bg-white/10'}`}
                                  >
                                     <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${bassBoost > 0 ? 'left-6' : 'left-1'}`} />
                                  </button>
                              </div>
                              <div className="px-1">
                                 <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-white/70">Sleep Timer</span>
                                    <span className="text-[10px] font-black text-[var(--accent-gold)]">{sleepTimer ? `${sleepTimer}m` : 'Off'}</span>
                                 </div>
                                 <div className="flex gap-2">
                                    {[15, 30, 60].map(m => (
                                      <button key={m} onClick={() => { setSleepTimer(m); showToast(`Sleep timer set to ${m}m`, 'success'); }} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${sleepTimer === m ? 'bg-[var(--accent-gold)] text-black' : 'bg-white/5 text-white/40'}`}>{m}m</button>
                                    ))}
                                    <button onClick={() => setSleepTimer(0)} className="flex-1 py-1.5 rounded-lg bg-white/5 text-white/40 text-[10px] font-black">Off</button>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="pt-4 border-t border-white/5 space-y-1">
                           <button onClick={() => { addToQueue(currentTrack); showToast('Added to queue', 'success'); setShowPlayerMenu(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-xs font-bold text-white/70 transition-colors"><span>Add to Queue</span><Plus className="w-4 h-4 opacity-40" /></button>
                           <button onClick={() => { addToOffline(currentTrack); showToast('Downloading...', 'info'); setShowPlayerMenu(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-xs font-bold text-white/70 transition-colors"><span>Download</span><Download className="w-4 h-4 opacity-40" /></button>
                           <button onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Link Copied!', 'success'); setShowPlayerMenu(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-xs font-bold text-white/70 transition-colors"><span>Share</span><Share2 className="w-4 h-4 opacity-40" /></button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowPlaylistSelector(prev => !prev); setShowPlayerMenu(false); }} 
                    className={`p-2.5 rounded-xl transition-all ${showPlaylistSelector ? 'bg-[var(--accent-gold)] text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]' : 'text-white/40 hover:text-white'}`}
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                  <button onClick={() => addToOffline(currentTrack)} className="p-2.5 rounded-xl text-white/40 hover:text-white transition-all"><Download className="w-6 h-6" /></button>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Link Copied!', 'success'); }} className="p-2.5 rounded-xl text-white/40 hover:text-white transition-all"><Share2 className="w-6 h-6" /></button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowPlayerMenu(prev => !prev); setShowPlaylistSelector(false); }} 
                    className={`p-2.5 rounded-xl transition-all border-l border-white/10 pl-6 ${showPlayerMenu ? 'text-[var(--accent-gold)]' : 'text-white/40 hover:text-white'}`}
                  >
                    <MoreHorizontal className="w-6 h-6 rotate-90" />
                  </button>
                </div>
              </div>
           </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
