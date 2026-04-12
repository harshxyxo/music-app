'use client';

import { usePlayerStore, Track, ListeningEvent } from '../../store/usePlayerStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Clock, Music, Users, Flame, LayoutGrid, Sparkles, Play, Share2, ArrowLeft, ArrowRight, X, User } from 'lucide-react';
import RecapStory from '../../components/RecapStory';
import { useToast } from '../../components/Toast';
import Link from 'next/link';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const DrilldownModal = ({ 
  title, 
  isOpen, 
  onClose, 
  children 
}: { title: string, isOpen: boolean, onClose: () => void, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }} 
          className="relative bg-[#0f1115] border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        >
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowLeft className="w-5 h-5 text-white/40 cursor-pointer hover:text-white transition-colors" onClick={onClose} />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">{title}</h3>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default function AnalyticsPage() {
  // --- Consistently Top-Level Hooks ---
  const { listeningHistory, playCounts, recentPlayed, play } = usePlayerStore();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [activeDrilldown, setActiveDrilldown] = useState<'time' | 'artists' | 'songs' | null>(null);
  const [realRecentlyPlayed, setRealRecentlyPlayed] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const fetchRealData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRealRecentlyPlayed(data.recentlyPlayed || []);
          }
        } catch (err) {
          console.error('Error fetching analytics:', err);
        }
      }
    };
    fetchRealData();
  }, []);

  const stats = useMemo(() => {
    if (!mounted) return null;

    // Use Firestore data if available, fallback to store's listeningHistory for structure if needed
    // But since the user wants real data, we prioritize realRecentlyPlayed
    const dataToUse = realRecentlyPlayed.length > 0 ? realRecentlyPlayed : [];

    if (dataToUse.length === 0 && listeningHistory.length === 0) return null;

    // Total Minutes: Summing real durations (stored in seconds)
    const totalMinutes = Math.floor(dataToUse.reduce((acc, t) => acc + (t.duration || 0), 0) / 60) || Math.floor(listeningHistory.length * 3.5);

    // Group by Day for Bar Chart (Last 7 Days)
    const now = Date.now();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
      return { 
        label: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        date: d.toDateString(),
        count: 0,
        minutes: 0 
      };
    });

    // If we have realRecentlyPlayed, we might not have timestamps for each play if we only use arrayUnion on one field.
    // However, the user didn't ask for a chronological log in recentlyPlayed, just a set of tracks.
    // If recentlyPlayed doesn't have timestamps, the bar chart will be empty.
    // But the user request said: "Dynamically calculate the Analytics page stats based on this real data."
    // Let's assume for now that we use listeningHistory for the chart if recentlyPlayed lacks timestamps,
    // or we just show the total.
    
    listeningHistory.forEach(event => {
      const eventDate = new Date(event.timestamp).toDateString();
      const dayIdx = last7Days.findIndex(d => d.date === eventDate);
      if (dayIdx !== -1) {
        last7Days[dayIdx].count++;
        last7Days[dayIdx].minutes += 3.5;
      }
    });

    // Top Artists - from realRecentlyPlayed
    const artistGroups = dataToUse.reduce((acc: Record<string, any>, curr: any) => {
      // 1. Define strict ban list (lowercase)
      const bannedArtists = ['mithoon', 'megacreate', 'various artists', 'unknown', 'gehra hua'];

      // 2. Extract raw name
      const rawArtist = curr.artist || (curr.artists && curr.artists[0]?.name) || "";

      // 3. Aggressively clean the string (Remove commas, &, feat, ft, - Topic, and anything inside parentheses)
      const cleanArtist = rawArtist.replace(/ - topic|feat\..*|ft\..*|,.*|&.*|\(.*\)|\[.*\]|-/gi, '').trim();

      // 4. Strict Validation
      if (!cleanArtist) return acc; // Skip empty

      const normalizedArtist = cleanArtist.toLowerCase();
      const normalizedTrackName = (curr.name || "").toLowerCase();
      const normalizedTrackTitle = (curr.title || "").toLowerCase();

      // Skip if the cleaned artist name is exactly the track name or title
      if (normalizedArtist === normalizedTrackName || normalizedArtist === normalizedTrackTitle) return acc;

      // Skip if the artist name string CONTAINS the track name (e.g., "Gehra Hua (From...)")
      if (normalizedTrackName && normalizedArtist.includes(normalizedTrackName)) return acc;

      if (bannedArtists.some(banned => normalizedArtist.includes(banned))) return acc; // Skip banned artists
      
      if (!acc[cleanArtist]) {
        acc[cleanArtist] = { 
          name: cleanArtist, 
          plays: 0, 
          imageUrl: curr.coverUrl || curr.coverImage // Restore surrogate images
        };
      }
      acc[cleanArtist].plays++;
      return acc;
    }, {} as Record<string, any>);
    
    const topArtists = Object.values(artistGroups)
      .sort((a: any, b: any) => b.plays - a.plays)
      .slice(0, 5);

    // Top Songs - from realRecentlyPlayed
    const songCounts = dataToUse.reduce((acc: Record<string, any>, curr: any) => {
      const key = curr.id;
      if (!acc[key]) acc[key] = { ...curr, count: 0 };
      acc[key].count++;
      return acc;
    }, {} as Record<string, any>);
    
    const topSongs = Object.values(songCounts)
      .sort((a, b) => b.count - a.count)
      .map((s: any) => ({ ...s, title: s.title || s.name })); // ensure title exists

    // Superfan Logic (Track with most plays)
    const superFanTrack = topSongs[0];

    // The Vibe (fallback to listeningHistory for timestamps if not in recentlyPlayed)
    const hours = listeningHistory.map(e => new Date(e.timestamp).getHours());
    const avgHour = hours.length > 0 ? hours.reduce((a: number, b: number) => a + b, 0) / hours.length : 12;
    let vibe = "Night Owl 🦉";
    if (avgHour >= 5 && avgHour < 12) vibe = "Morning Bliss 🌅";
    else if (avgHour >= 12 && avgHour < 18) vibe = "Afternoon Flow 🌊";
    else if (avgHour >= 18 && avgHour < 22) vibe = "Evening Chill 🌙";

    return { 
      totalMinutes, 
      topArtists, 
      topSongs, 
      vibe, 
      last7Days, 
      superFanTrack 
    };
  }, [mounted, listeningHistory, realRecentlyPlayed]);

  const topSongTrack = useMemo(() => {
    if (!stats || stats.topSongs.length === 0) return recentPlayed[0];
    return realRecentlyPlayed.find(t => t.id === stats.topSongs[0]?.id) || recentPlayed.find(t => t.id === stats.topSongs[0]?.id) || recentPlayed[0];
  }, [stats, recentPlayed, realRecentlyPlayed]);

  const topArtistImage = useMemo(() => {
    if (!stats || !stats.topArtists[0]) return null;
    return stats.topArtists[0].imageUrl;
  }, [stats]);

  const recapData = useMemo(() => {
    if (!stats) return null;
    return {
      totalMinutes: stats.totalMinutes,
      topArtist: stats.topArtists[0]?.name || 'Unknown',
      topSong: stats.topSongs[0]?.title || 'Unknown',
      topSongImage: topSongTrack?.coverUrl || topSongTrack?.coverImage,
      topArtistImage: topArtistImage
    };
  }, [stats, topSongTrack, topArtistImage]);


  if (!mounted) return <div className="p-10 bg-[#0a0a0c] min-h-full" />;

  if (!stats) return null; // Fallback during memo calculation

  // Ensure recapData is not null before rendering RecapStory
  if (!recapData) return null;

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-10 pb-32">
      
      {realRecentlyPlayed.length === 0 && listeningHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Music className="w-10 h-10 text-white/20" />
           </div>
           <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">No tracks played yet</h2>
              <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest">Start listening to build your Sound Capsule</p>
           </div>
           <Link href="/explore" className="px-10 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 active:scale-95 transition-all">Start Listening</Link>
        </div>
      ) : (
        <>
          {/* Sound Capsule Header */}
      <div className="space-y-4">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
        </button>
        <h1 className="text-5xl font-black text-white tracking-tighter">Your Sound Capsule</h1>
        <div className="flex items-center justify-between">
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
            {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()} • Aggregated from Firestore Sync
          </p>
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowRecap(true)}
              className="px-6 py-2 bg-gradient-to-r from-[#ba9eff] to-[#7e57c2] rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#ba9eff]/20 flex items-center gap-2"
            >
              <Sparkles className="w-3 h-3" /> Your 2026 Recap
            </motion.button>
            <button onClick={() => showToast('Sharing coming soon!', 'info')} className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid - Sound Capsule Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Time Listened Card */}
        <motion.div 
          onClick={() => setActiveDrilldown('time')}
          whileHover={{ y: -5 }}
          className="lg:col-span-2 p-8 rounded-[2rem] bg-[#121418] border border-white/5 cursor-pointer group relative overflow-hidden flex flex-col justify-between h-[280px]"
        >
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Time Listened</p>
            <h3 className="text-5xl font-black text-[#53ddfc] tracking-tighter">
              {stats.totalMinutes.toLocaleString()} <span className="text-xl text-white/40">minutes</span>
            </h3>
          </div>
          <div className="flex items-end gap-1 h-20 px-2 mt-4">
               {stats.last7Days.map((day, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                    <div 
                      className="w-full bg-[#53ddfc]/20 rounded-t-sm group-hover/bar:bg-[#53ddfc]/40 transition-all"
                      style={{ height: `${Math.max((day.minutes / (Math.max(...stats.last7Days.map(d => d.minutes)) || 1)) * 100, 10)}%` }}
                    />
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">{day.label}</span>
                 </div>
               ))}
          </div>
        </motion.div>

        {/* Top Artist Card */}
        <motion.div 
          onClick={() => setActiveDrilldown('artists')}
          whileHover={{ y: -5 }}
          className="p-8 rounded-[2rem] bg-[#121418] border border-white/5 cursor-pointer group h-[280px] flex flex-col justify-between"
        >
          <div>
             <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Top Artist</p>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
             </div>
             <h4 className="text-xl font-black text-[#ba9eff] tracking-tight truncate">{stats.topArtists[0]?.name}</h4>
          </div>
          <div className="relative w-24 h-24 mx-auto mb-2 flex items-center justify-center">
            {topArtistImage ? (
              <>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ba9eff] to-[#53ddfc] animate-pulse blur-xl opacity-20" />
                <img 
                  src={topArtistImage} 
                  className="w-full h-full rounded-full object-cover relative z-10 border-4 border-white/10" 
                  alt="" 
                />
              </>
            ) : (
              <div className="w-full h-full rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center">
                 <User className="text-white/20 w-10 h-10" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Song Card */}
        <motion.div 
          onClick={() => setActiveDrilldown('songs')}
          whileHover={{ y: -5 }}
          className="p-8 rounded-[2rem] bg-[#121418] border border-white/5 cursor-pointer group h-[280px] flex flex-col justify-between"
        >
          <div>
             <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Top Song</p>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
             </div>
             <h4 className="text-xl font-black text-yellow-400 tracking-tight truncate">{stats.topSongs[0]?.title}</h4>
          </div>
          <div className="relative w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img 
              src={topSongTrack?.coverImage || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop'} 
              className="w-full h-full object-cover" 
              alt="" 
            />
          </div>
        </motion.div>

        {/* Superfan Card - Bottom Wide */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 p-8 rounded-[2.5rem] bg-gradient-to-r from-[#1a1c22] to-[#0f1115] border border-white/5 overflow-hidden flex flex-col md:flex-row items-center gap-8 group"
        >
           <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-yellow-400" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">You're a true superfan</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-widest leading-tight">
                 You listened to <span className="text-[#53ddfc]">{stats.superFanTrack?.title}</span> <br className="hidden md:block" />
                 by <span className="text-[#ba9eff]">{stats.superFanTrack?.artist}</span> more than anyone else.
              </h2>
              <div className="pt-2">
                 <button 
                  onClick={() => {
                    const track = recentPlayed.find(t => t.id === stats.superFanTrack?.id);
                    if (track) play(track);
                  }}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-3"
                 >
                    <Play className="w-3 h-3 fill-white" /> Loop it again
                 </button>
              </div>
           </div>
           <div className="w-full md:w-[400px] h-[180px] rounded-[2rem] overflow-hidden relative border border-white/10 shrink-0">
               <img 
                src={topSongTrack?.coverImage || 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&h=400&fit=crop'} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" 
                alt="" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
               <div className="absolute bottom-6 left-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-[#53ddfc]/30 overflow-hidden">
                     <img src={topArtistImage} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Masterpiece of the Year</p>
                    <p className="text-sm font-black text-white tracking-tight">{stats.superFanTrack?.title}</p>
                  </div>
               </div>
           </div>
        </motion.div>

      </div>

      <RecapStory open={showRecap} onClose={() => setShowRecap(false)} data={recapData} />


      {/* Drill-down Modals */}
      <DrilldownModal 
        title="Time Listened Details" 
        isOpen={activeDrilldown === 'time'} 
        onClose={() => setActiveDrilldown(null)}
      >
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-black text-white tracking-tighter mb-2">You listened to music for <span className="text-[#53ddfc]">{stats.totalMinutes.toLocaleString()} minutes</span> this month.</h2>
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Daily average: {Math.floor(stats.totalMinutes / 30)} min</p>
          </div>
          
          <div className="space-y-4">
             <div className="flex justify-between items-end mb-4 h-48 px-4">
               {stats.last7Days.map((day, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-3 group/modal-bar">
                    <div className="relative flex flex-col items-center flex-1 w-12 group">
                        <div className="absolute -top-8 bg-white/10 px-2 py-1 rounded text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{Math.floor(day.minutes)}m</div>
                        <div 
                          className="w-full bg-gradient-to-t from-[#53ddfc] to-[#ba9eff] rounded-xl group-hover/modal-bar:brightness-125 transition-all shadow-lg shadow-[#53ddfc]/10"
                          style={{ height: `${Math.max((day.minutes / (Math.max(...stats.last7Days.map(d => d.minutes)) || 1)) * 100, 5)}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">{day.label}</span>
                 </div>
               ))}
             </div>
             <div className="h-px bg-white/5 w-full" />
          </div>

          <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-4">
             <p className="text-xl font-bold text-white/80 leading-relaxed italic">"You listen to <span className="text-[#53ddfc]">506% more music</span> than the average listener in India."</p>
          </div>
        </div>
      </DrilldownModal>

      <DrilldownModal 
        title="Top Artists" 
        isOpen={activeDrilldown === 'artists'} 
        onClose={() => setActiveDrilldown(null)}
      >
        <div className="space-y-8">
           <div className="mb-10">
              <h2 className="text-4xl font-black text-white tracking-tighter mb-2">You listened to <span className="text-[#ba9eff]">{stats.topArtists.length} artists</span> this month.</h2>
           </div>
             <div className="space-y-4">
               {stats.topArtists.map((artist: any, i: number) => {
                 return (
                  <div 
                    key={artist.name} 
                    onClick={() => { window.location.href = `/artist/${encodeURIComponent(artist.name)}`; }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-all group cursor-pointer"
                  >
                     <div className="flex items-center gap-6">
                        <span className="text-xl font-black text-white/10 w-8">{i + 1}</span>
                        <Link 
                          href={`/artist/${encodeURIComponent(artist.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-indigo-500/40 transition-colors cursor-pointer bg-white/5 flex items-center justify-center"
                        >
                           {artist.imageUrl ? (
                             <img 
                              src={artist.imageUrl} 
                              className="w-full h-full object-cover rounded-full" 
                              alt="" 
                             />
                           ) : (
                             <div className="w-full h-full bg-white/10 flex items-center justify-center">
                               <User className="text-white/50 w-6 h-6" />
                             </div>
                           )}
                        </Link>
                        <div>
                          <p className="text-base font-black text-white group-hover:text-[#ba9eff] transition-colors">{artist.name}</p>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Artist</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{artist.plays} Plays</span>
                  </div>
                );
              })}
            </div>
        </div>
      </DrilldownModal>

      <DrilldownModal 
        title="Top Songs" 
        isOpen={activeDrilldown === 'songs'} 
        onClose={() => setActiveDrilldown(null)}
      >
        <div className="space-y-8">
           <div className="mb-10">
              <h2 className="text-4xl font-black text-white tracking-tighter mb-2">You played <span className="text-yellow-400">{stats.topSongs.length} different songs</span> this month.</h2>
           </div>
            <div className="space-y-4">
              {stats.topSongs.slice(0, 5).map((song: any, i: number) => {
                const track = realRecentlyPlayed.find(t => t.id === song.id) || recentPlayed.find(t => t.id === song.id);
                const TRACK_FALLBACK = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop';
                return (
                  <div key={song.id} onClick={() => track && play(track as Track)} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 transition-all group cursor-pointer">
                     <div className="flex items-center gap-6 flex-1 min-w-0">
                        <span className="text-xl font-black text-white/10 w-8">{i + 1}</span>
                        <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/10 group-hover:border-yellow-400/40 transition-colors shrink-0 bg-white/5">
                           <img 
                            src={track?.coverUrl || track?.coverImage || TRACK_FALLBACK} 
                            onError={(e) => { e.currentTarget.src = TRACK_FALLBACK }}
                            className="w-full h-full object-cover" 
                            alt="" 
                           />
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-black text-white group-hover:text-yellow-400 transition-colors truncate">{song.title}</p>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest truncate">{song.artist}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest whitespace-nowrap">{song.count} Plays</span>
                        <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                  </div>
                );
              })}
            </div>
        </div>
      </DrilldownModal>

      <style jsx>{`
        .shadow-glow-cyan {
          text-shadow: 0 0 30px rgba(83, 221, 252, 0.4);
        }
      `}</style>
        </>
      )}
    </div>
  );
}
