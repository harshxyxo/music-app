'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { searchTracks, shuffle } from '../../../services/saavn';
import { usePlayerStore, Track } from '../../../store/usePlayerStore';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Play, Heart, ArrowLeft, Clock, MoreHorizontal, 
  Shuffle, Download, UserPlus, Pause, Zap
} from 'lucide-react';

import ContextMenu from '../../../components/ContextMenu';
import BackButton from '../../../components/BackButton';
import { useToast } from '../../../components/Toast';
import Link from 'next/link';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const genreId = decodeURIComponent(Array.isArray(params.id) ? params.id[0] : params.id || '');
  const store = usePlayerStore();
  const { 
    play, pause, isPlaying, currentTrack, likedSongs, 
    toggleLike, setQueue, userName, deletePlaylist, playCounts,
    isAutoplay, isRightSidebarOpen, toggleRightSidebar, toggleFollow, followedArtists,
    logListening, addToOffline, bulkAddToOffline, addToPlaylist, customPlaylists,
    isShuffle, toggleShuffle
  } = store;
  const { showToast } = useToast();
  

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [mounted, setMounted] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const isLikedSongs = genreId === 'Liked Songs';
  const customPlaylist = store.customPlaylists.find(p => p.id === genreId || p.name === genreId);
  const [remotePlaylist, setRemotePlaylist] = useState<any>(null);
  
  const playlistData = customPlaylist || remotePlaylist;
  const displayTitle = playlistData ? playlistData.name : (isLikedSongs ? 'Liked Songs' : genreId);
  const isPublic = playlistData ? playlistData.isPublic : true;

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isLikedSongs || customPlaylist) {
        const list = isLikedSongs ? likedSongs : customPlaylist?.tracks || [];
        setTracks(shuffle(list));
        setHasMore(false);
      } else {
        // Try fetching from Firestore (Public Playlist)
        try {
          const playlistDoc = await getDoc(doc(db, 'playlists', genreId));
          if (playlistDoc.exists()) {
            const data = playlistDoc.data();
            setRemotePlaylist(data);
            setTracks(shuffle(data.tracks || []));
            setHasMore(false);
          } else {
            // Fallback to Saavn Search (Genre/Artist)
            const results = await searchTracks(genreId);
            setTracks(shuffle(results));
            setHasMore(results.length >= 10);
            setPage(1);
          }
        } catch (err) {
          const results = await searchTracks(genreId);
          setTracks(shuffle(results));
        }
      }
      setLoading(false);
    }
    load();
  }, [genreId, customPlaylist]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || isLikedSongs || playlistData) return;
    setLoadingMore(true);
    const variations = ['new', 'best', 'top', 'latest', 'popular', 'hit', 'superhit', 'remix'];
    const extra = variations[page % variations.length];
    const more = await searchTracks(`${genreId} ${extra}`);
    const newTracks = more.filter(t => !tracks.some(e => e.id === t.id));
    if (newTracks.length === 0) setHasMore(false);
    else { setTracks(prev => [...prev, ...newTracks]); setPage(p => p + 1); }
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, genreId, tracks, isLikedSongs, playlistData]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) loadMore();
    }, { threshold: 0.1 });
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore, loadingMore]);

  const totalDuration = tracks.reduce((acc, _) => acc + 210, 0); // Mock duration estimation
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  const playlistCover = tracks[0]?.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop';
  const isCurrentPlaylistPlaying = tracks.some(t => t.id === currentTrack?.id) && isPlaying;

  const handleDelete = () => {
    if (customPlaylist) {
      deletePlaylist(customPlaylist.id);
      router.push('/');
    }
  };

  return (
    <div 
      className="min-h-full pb-32 bg-[#121212] overflow-y-auto custom-scrollbar outline-none"
      tabIndex={0}
      onMouseEnter={(e) => e.currentTarget.focus()}
    >
      {/* Massive Header Banner */}
      <div className="relative h-[340px] flex items-end px-8 pb-6 transition-all group overflow-hidden">
        {/* Dynamic Background Gradient */}
        <div className="absolute inset-0 bg-[#0f1218] opacity-100" />
        <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 20% 40%, #ba9eff, transparent 50%), radial-gradient(circle at 80% 20%, #53ddfc, transparent 50%)`, filter: 'blur(100px)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1218] via-transparent to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-8 left-8 z-20">
          <BackButton />
        </div>
        
        <div className="relative z-10 flex items-end gap-10 w-full max-w-7xl mx-auto">
          <div className="w-64 h-64 shadow-2xl flex-shrink-0 transition-transform hover:scale-[1.02] duration-500 rounded-[2rem] overflow-hidden border-4 border-white/5">
            <img src={playlistCover} className="w-full h-full object-cover" alt="" />
          </div>
          
          <div className="flex flex-col gap-4 pb-4">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${isPublic ? 'text-[#ba9eff] bg-[#ba9eff]/10 border-[#ba9eff]/20' : 'text-white/40 bg-white/5 border-white/10'}`}>
                {isPublic ? 'Public Playlist' : 'Private Playlist'}
              </span>
            </div>
            <h1 className="text-8xl font-black tracking-tighter text-white mb-2 line-clamp-1">{displayTitle}</h1>
            
            <div className="flex items-center gap-1.5 text-xs font-black text-white px-2">
              <div className="flex items-center gap-2">
                <span className="text-[#ba9eff]">{userName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="text-white/60">{tracks.length} curated tracks</span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="text-white/40 font-bold uppercase tracking-widest">
                  {hours > 0 ? `${hours}h ` : ''}{minutes}m
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-6">
        {/* Background Gradient Extension */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none -mt-6" />

        {/* Controls Bar */}
        <div className="flex items-center gap-10 mb-12">
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (isCurrentPlaylistPlaying) pause();
              else if (tracks.length) { setQueue(tracks); play(tracks[0]); }
            }}
            className="px-10 py-5 bg-[#ba9eff] hover:bg-[#ba9eff]/90 rounded-full flex items-center justify-center gap-3 shadow-2xl shadow-[#ba9eff]/20 transition-all group"
          >
            {isCurrentPlaylistPlaying ? (
              <>
                <div className="flex gap-1"><div className="w-1 h-4 bg-[#0f1218] rounded-full" /><div className="w-1 h-4 bg-[#0f1218] rounded-full" /></div>
                <span className="text-xs font-black text-[#0f1218] uppercase tracking-[0.2em]">Pause All</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 text-[#0f1218] fill-[#0f1218]" />
                <span className="text-xs font-black text-[#0f1218] uppercase tracking-[0.2em]">Play All</span>
              </>
            )}
          </motion.button>

          <div className="flex items-center gap-10">
            <button 
              onClick={() => toggleShuffle()}
              className={`transition-all ${isShuffle ? 'text-[#ba9eff] drop-shadow-[0_0_8px_rgba(186,158,255,0.5)]' : 'text-white/20 hover:text-white'}`}
            >
              <Shuffle className="w-7 h-7" />
            </button>
            <button 
              onClick={() => {
                bulkAddToOffline(tracks);
                showToast('Playlist Downloaded for Offline', 'success');
              }}
              className="relative text-white/20 hover:text-white transition-all group"
            >
              <Download className="w-7 h-7" />
            </button>
            <button 
              onClick={() => showToast('Invite Link Copied', 'success')}
              className="text-white/20 hover:text-white transition-all"
            >
              <UserPlus className="w-7 h-7" />
            </button>
            <ContextMenu 
            context={customPlaylist ? "USER_PLAYLIST" : "GENERAL_PLAYLIST"} 
            data={customPlaylist ? { ...customPlaylist, onDelete: handleDelete } : { id: genreId, name: genreId, tracks, onDelete: handleDelete }} 
            trigger={
              <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/40 hover:text-white transition-all hover:scale-105 active:scale-95">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            } 
          />
          </div>
        </div>

        {/* Tracks Table */}
        <div className="text-left w-full border-separate border-spacing-y-0">
          <div className="flex items-center px-6 py-4 border-b border-white/5 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 bg-transparent">
            <span className="w-16">#</span>
            <span className="flex-1">Track details</span>
            <span className="w-56 hidden md:block">Album</span>
            <span className="w-32 hidden lg:block">Released</span>
            <span className="w-20 flex justify-end">Time</span>
          </div>

          <Reorder.Group axis="y" values={tracks} onReorder={setTracks} className="space-y-1 mt-4">
            {tracks.map((track, i) => {
              const isActive = currentTrack?.id === track.id;
              const isLiked = mounted && likedSongs.some(t => t.id === track.id);
              
              return (
                <Reorder.Item 
                  key={track.id} 
                  value={track}
                  layout
                  dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                  onClick={() => { setQueue(tracks); play(track); }}
                  className={`flex items-center px-6 py-4 rounded-[2rem] group hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5 ${isActive ? 'bg-[#ba9eff]/5 border-[#ba9eff]/10' : ''}`}
                >
                  {/* Number / Play Icon */}
                  <div className="w-16 flex items-center">
                    <span className={`text-xs font-black transition-colors ${isActive ? 'text-[#ba9eff]' : 'text-white/20'} group-hover:hidden w-6 text-center`}>{i + 1}</span>
                    <Play className={`w-4 h-4 ${isActive ? 'text-[#ba9eff]' : 'text-white'} fill-current hidden group-hover:block mx-auto`} />
                  </div>

                  {/* Title & Artist */}
                  <div className="flex-1 flex items-center gap-6 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xl shrink-0">
                      <img src={(track.coverImage || '').replace('150x150', '500x500')} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="truncate">
                      <p className={`text-sm font-black truncate mb-1 transition-colors ${isActive ? 'text-[#ba9eff]' : 'text-white'}`}>{track.title}</p>
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/artist/${encodeURIComponent(track.artist)}`} 
                          onClick={e => e.stopPropagation()} 
                          className="text-[10px] font-bold text-white/30 hover:text-[#ba9eff] uppercase tracking-widest transition-all block truncate"
                        >
                          {track.artist}
                        </Link>
                        {playCounts?.[track.id] > 0 && (
                          <>
                            <span className="text-[10px] text-white/10">•</span>
                            <span className="text-[10px] font-black text-[#ba9eff] uppercase tracking-widest">{playCounts[track.id]} Plays</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="w-56 hidden md:block truncate pr-10">
                    <span className="text-xs font-bold text-white/20 group-hover:text-white/40 transition-colors uppercase tracking-widest">{track.title}</span>
                  </div>

                  {/* Date Added */}
                  <div className="w-32 hidden lg:block text-[10px] font-black text-white/10 uppercase tracking-widest">
                    {track.language || 'English'}
                  </div>

                  {/* Duration & Like */}
                  <div className="w-20 flex items-center justify-end gap-6 text-[10px] font-bold text-white/20 group-hover:text-white transition-colors">
                    <button 
                      onClick={e => { e.stopPropagation(); toggleLike(track); }} 
                      className={`transition-all opacity-0 group-hover:opacity-100 ${isLiked ? 'opacity-100' : ''}`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'text-[#ba9eff] fill-[#ba9eff]' : 'text-white/20 hover:text-white'}`} />
                    </button>
                    <span>4:22</span>
                    <div className="opacity-0 group-hover:opacity-100"><ContextMenu context="TRACK" data={track} playlistId={customPlaylist?.id} /></div>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>

        {hasMore && !loading && (
          <div ref={sentinelRef} className="py-12 flex justify-center">
            {loadingMore && (
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-[#1ed760] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#1ed760] animate-bounce [animation-delay:-.15s]" />
                <div className="w-2 h-2 rounded-full bg-[#1ed760] animate-bounce [animation-delay:-.3s]" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

