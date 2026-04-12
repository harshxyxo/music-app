'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePlayerStore, Track } from '../../../store/usePlayerStore';
import { artists as mockArtists, albums as mockAlbums, tracks as mockTracks, Artist, Album } from '../../../lib/mockData';
import { Play, Heart, Clock, MoreHorizontal, Pause } from 'lucide-react';
import ContextMenu from '../../../components/ContextMenu';
import BackButton from '../../../components/BackButton';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AlbumPage() {
  const params = useParams();
  const albumId = decodeURIComponent(Array.isArray(params.id) ? params.id[0] : params.id || '');
  const { play, pause, isPlaying, currentTrack, likedSongs, toggleLike, setQueue, playCounts } = usePlayerStore();
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const foundAlbum = mockAlbums.find(a => a.id === albumId);
    if (foundAlbum) {
      setAlbum(foundAlbum);
      const albumTracks = mockTracks.filter(t => t.albumId === foundAlbum.id);
      setTracks(albumTracks);
    }
    setLoading(false);
  }, [albumId]);

  const isCurrentAlbumPlaying = tracks.some(t => t.id === currentTrack?.id) && isPlaying;

  if (!mounted) return null;
  if (!album && !loading) return <div className="p-20 text-center text-white/20">Album not found</div>;

  return (
    <div className="min-h-full pb-32 bg-[#0f1218] overflow-y-auto custom-scrollbar outline-none" tabIndex={0}>
      {/* Header Banner */}
      <div className="relative h-[400px] flex items-end px-10 pb-10 transition-all group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ba9eff]/20 to-transparent opacity-60" />
        <div className="absolute inset-0 bg-[#0f1218]/40" />
        
        <div className="absolute top-8 left-8 z-50">
          <BackButton />
        </div>
        
        <div className="relative z-10 flex items-end gap-10 w-full max-w-7xl mx-auto">
          <div className="w-64 h-64 shadow-2xl flex-shrink-0 rounded-[2rem] overflow-hidden border-4 border-white/5">
            <img src={album?.coverImage} className="w-full h-full object-cover" alt="" />
          </div>
          
          <div className="flex flex-col gap-4 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border text-[#ba9eff] bg-[#ba9eff]/10 border-[#ba9eff]/20">
                Album
              </span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter text-white mb-2 line-clamp-2">{album?.title}</h1>
            
            <div className="flex items-center gap-2 text-xs font-black text-white">
              <Link href={`/artist/${encodeURIComponent(album?.artistId || '')}`} className="text-[#ba9eff] hover:underline decoration-2 underline-offset-4">{album?.artistName}</Link>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="text-white/60">{album?.releaseYear}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="text-white/40">{tracks.length} tracks</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-10 py-10">
        {/* Controls */}
        <div className="flex items-center gap-8 mb-12">
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isCurrentAlbumPlaying) pause();
              else if (tracks.length) { setQueue(tracks); play(tracks[0]); }
            }}
            className="w-16 h-16 bg-[#ba9eff] rounded-full flex items-center justify-center shadow-2xl shadow-[#ba9eff]/30 transition-all"
          >
            {isCurrentAlbumPlaying ? <Pause className="w-7 h-7 text-[#0f1218] fill-[#0f1218]" /> : <Play className="w-7 h-7 text-[#0f1218] fill-[#0f1218] ml-1" />}
          </motion.button>
          
          <button className="text-white/20 hover:text-white transition-all">
            <Heart className="w-7 h-7" />
          </button>
          
          <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/40 hover:text-white transition-all">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        {/* Tracklist */}
        <div className="space-y-1">
          <div className="flex items-center px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 border-b border-white/5 mb-6">
            <span className="w-12">#</span>
            <span className="flex-1">Title</span>
            <span className="w-20 text-right"><Clock className="w-4 h-4 ml-auto" /></span>
          </div>
          
          {tracks.map((track, i) => {
            const isActive = currentTrack?.id === track.id;
            const isLiked = likedSongs.some(t => t.id === track.id);
            
            return (
              <div 
                key={track.id} 
                onClick={() => { setQueue(tracks); play(track); }}
                className={`flex items-center px-6 py-4 rounded-2xl group hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5 ${isActive ? 'bg-[#ba9eff]/5 border-[#ba9eff]/10' : ''}`}
              >
                <span className={`w-12 text-xs font-black transition-colors ${isActive ? 'text-[#ba9eff]' : 'text-white/20'}`}>{i + 1}</span>
                <div className="flex-1 truncate">
                  <p className={`text-sm font-black truncate mb-0.5 transition-colors ${isActive ? 'text-[#ba9eff]' : 'text-white'}`}>{track.title}</p>
                  <p className="text-[10px] font-bold text-white/30 truncate uppercase tracking-widest">{track.artist}</p>
                </div>
                <div className="w-20 flex items-center justify-end gap-6">
                  <button onClick={(e) => { e.stopPropagation(); toggleLike(track); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className={`w-4 h-4 ${isLiked ? 'text-[#ba9eff] fill-[#ba9eff]' : 'text-white/20 hover:text-white'}`} />
                  </button>
                  <span className="text-[10px] font-bold text-white/20">3:45</span>
                  <div className="opacity-0 group-hover:opacity-100"><ContextMenu context="TRACK" data={track} /></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
