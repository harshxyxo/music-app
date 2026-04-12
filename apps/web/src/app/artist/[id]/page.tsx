'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { searchTracks } from '../../../services/saavn';
import { usePlayerStore, Track as StoreTrack } from '../../../store/usePlayerStore';
import { Play, CheckCircle2, ArrowLeft, Heart, UserPlus, MoreHorizontal, Music } from 'lucide-react';
import ContextMenu from '../../../components/ContextMenu';
import BackButton from '../../../components/BackButton';
import Link from 'next/link';
import { motion } from 'framer-motion';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function ArtistPage() {
  const params = useParams();
  const artistParam = decodeURIComponent(Array.isArray(params.id) ? params.id[0] : params.id || '');
  const { play, currentTrack, setQueue, isPlaying, pause, toggleFollow, followedArtists, playCounts } = usePlayerStore();
  
  const [artist, setArtist] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [similarArtists, setSimilarArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function load() {
      setLoading(true);
      
      try {
        // Step 1: Search for the artist to get the official artistId and high-quality image
        const artistSearchRes = await fetch(`/api/yt?q=${encodeURIComponent(artistParam)}&type=artist`);
        const artistSearchResults = await artistSearchRes.json();
        
        let targetArtistId = '';
        let officialArtistName = artistParam;
        let officialImage = '';

        if (artistSearchResults && artistSearchResults.length > 0) {
          // Find the best match
          const bestMatch = artistSearchResults.find((a: any) => a.name.toLowerCase() === artistParam.toLowerCase()) || artistSearchResults[0];
          targetArtistId = bestMatch.id;
          officialArtistName = bestMatch.name;
          officialImage = bestMatch.image;
        }

        if (targetArtistId) {
          // Step 2: Fetch authentic top tracks using the artistId
          const artistDetailRes = await fetch(`/api/yt/artist?id=${targetArtistId}`);
          const artistDetails = await artistDetailRes.json();
          if (artistDetails && artistDetails.topTracks) {
            setTracks(artistDetails.topTracks);
            setArtist({
              id: targetArtistId,
              name: officialArtistName,
              image: artistDetails.image || officialImage,
              monthlyListeners: artistDetails.subscribers || 'Verified Official Artist',
              verified: true
            });

            // Populate dynamic albums and similar artists
            if (artistDetails.albums) {
                setAlbums(artistDetails.albums.map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    artistId: targetArtistId,
                    artistName: officialArtistName,
                    coverImage: a.coverImage,
                    releaseYear: 'Album',
                    tracks: []
                })));
            }

            if (artistDetails.similar) {
                setSimilarArtists(artistDetails.similar.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    image: s.image,
                    monthlyListeners: 'Fans also like',
                    verified: true
                })));
            }
          }
        } else {
          // Fallback to strict track search by artist name to prevent "scrambling"
          const main = await searchTracks(artistParam);
          // Filter to ensure results actually match the artist name provided in the URL
          const filtered = main.filter(t => t.artist.toLowerCase().includes(artistParam.toLowerCase()));
          const finalTracks = filtered.length > 0 ? filtered : main;
          const top20 = finalTracks.slice(0, 20);
          setTracks(top20);
          
          if (top20[0]) {
            setArtist({
              id: encodeURIComponent(top20[0].artist),
              name: top20[0].artist,
              image: top20[0].coverImage || ARTIST_FALLBACK,
              monthlyListeners: 'Verified Artist',
              verified: true
            });
          }
        }
      } catch (err) {
        console.error('Artist load failed:', err);
      }
      setLoading(false);
    }
    if (artistParam) load();
  }, [artistParam]);

  const ARTIST_FALLBACK = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop';
  const TRACK_FALLBACK = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop';

  const heroImage = artist?.image || (tracks[0]?.coverImage || '').replace('150x150', '800x800') || ARTIST_FALLBACK;
  const isArtistPlaying = tracks.some(t => t.id === currentTrack?.id) && isPlaying;
  const displayName = artist?.name || artistParam;

  if (!mounted) return null;

  return (
    <div 
      className="h-full overflow-y-auto custom-scrollbar bg-[#1a0b36] relative outline-none" 
      onScroll={(e) => setScrolled((e.target as HTMLDivElement).scrollTop > 100)}
      tabIndex={0}
      onMouseEnter={(e) => e.currentTarget.focus()}
    >
      {/* Cinematic Banner - Deep Indigo Gradient */}
      <div className="relative h-[50vh] min-h-[450px] w-full overflow-hidden flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#1a0b36]" />
          <img src={heroImage} className="w-full h-full object-cover blur-[80px] scale-125 opacity-40" alt="" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b36]/80 via-black/40 to-[#1a0b36]" />
          <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#1a0b36] to-transparent" />
        </div>

        {/* Back Button */}
        <div className="absolute top-8 left-8 z-50">
          <BackButton />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-10 flex items-center gap-16">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 0.8, ease: "easeOut" }} 
            className="w-80 h-80 rounded-full overflow-hidden border-[12px] border-white/5 shadow-[0_0_80px_rgba(49,46,129,0.5)] shrink-0 relative group bg-white/5"
          >
            <img 
              src={heroImage} 
              onError={(e) => { e.currentTarget.src = ARTIST_FALLBACK }}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              alt="" 
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          <div className="flex flex-col gap-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="flex items-center gap-3">
              <div className="px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full backdrop-blur-xl">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" /> Verified Artist
                </span>
              </div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{artist?.monthlyListeners || 'Dynamic Monthly Listeners'}</span>
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.3, duration: 0.5 }} 
              className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-tight"
            >
              {displayName}
            </motion.h1>
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="relative z-20 px-10 -mt-20 pb-40">
        {/* Action Bar */}
        <div className="flex items-center gap-10 mb-16">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
            onClick={() => { 
                if (isArtistPlaying) pause(); 
                else if (tracks.length) { 
                    setQueue(tracks); 
                    play(tracks[0]); 
                } 
            }}
            className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center shadow-xl transition-all hover:bg-indigo-400 group active:scale-90 shrink-0"
          >
            {isArtistPlaying ? (
              <div className="flex gap-1.5"><div className="w-1.5 h-6 bg-black rounded-full" /><div className="w-1.5 h-6 bg-black rounded-full" /></div>
            ) : (
              <Play className="w-7 h-7 text-black fill-black ml-1" />
            )}
          </motion.button>
          
          <button 
            onClick={() => toggleFollow({ name: displayName, image: heroImage })}
            className={`flex items-center gap-3 px-8 py-4 rounded-full border border-white/10 text-sm font-black uppercase tracking-widest transition-all ${followedArtists.some(a => a.name === displayName) ? 'bg-[#ba9eff] text-[#0f1218] border-[#ba9eff]' : 'bg-white/5 hover:bg-white/10 text-white'}`}
          >
            <UserPlus className="w-5 h-5" /> {followedArtists.some(a => a.name === displayName) ? 'Following' : 'Follow'}
          </button>
          
          <button className="p-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-16">
          {/* Top Tracks Column */}
          <div className="xl:col-span-3">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-white tracking-tight">Popular Tracks</h2>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white cursor-pointer transition-colors">Show All Discography</span>
            </div>
            {loading ? (
              <div className="space-y-6">{[...Array(10)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-[2rem] animate-pulse" />)}</div>
            ) : (
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-1">
                {tracks.slice(0, 20).map((track, i) => {
                  const isActive = currentTrack?.id === track.id;
                  return (
                    <motion.div key={`${track.id}-${i}`} variants={fadeUp} onClick={() => { setQueue(tracks); play(track); }}
                      className={`flex items-center justify-between py-3 px-4 rounded-xl cursor-pointer group transition-all border border-transparent ${isActive ? 'bg-indigo-500/10 border-indigo-500/20 shadow-lg' : 'hover:bg-white/[0.03] hover:border-white/[0.03]'}`}>
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <span className={`w-8 text-right text-xs font-black transition-colors ${isActive ? 'text-indigo-400' : 'text-white/20'}`}>{i + 1}</span>
                        <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden shadow-2xl bg-white/5">
                          <img 
                            src={(track.coverImage || '').replace('150x150', '500x500')} 
                            onError={(e) => { e.currentTarget.src = TRACK_FALLBACK }}
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                          <div className="absolute inset-0 bg-indigo-500/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        </div>
                        <div className="truncate">
                          <p className={`font-black text-base truncate mb-0.5 transition-colors ${isActive ? 'text-indigo-400' : 'text-white'}`}>{track.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">{track.artist}</p>
                            {playCounts?.[track.id] > 0 && (
                              <>
                                <span className="text-[10px] text-white/10">•</span>
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{playCounts[track.id]} Plays</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] font-mono w-12 text-right">4:42</span>
                        <span className="text-[10px] font-black text-white/5 uppercase tracking-[0.2em] hidden md:block">{track.language || 'Global'}</span>
                        <ContextMenu context="TRACK" data={track} />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          <div className="space-y-16">
            {/* Removed About Artist box as per request */}

            <div>
              <h2 className="text-xl font-black text-white tracking-tight mb-8">Popular Releases</h2>
              <div className="space-y-8">
                {albums.slice(0, 4).map((album) => (
                  <Link key={album.id} href={`/album/${album.id}`} className="flex items-center gap-6 cursor-pointer group">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 border border-white/5 shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 bg-white/5">
                      <img 
                        src={album.coverImage} 
                        onError={(e) => { e.currentTarget.src = TRACK_FALLBACK }}
                        className="w-full h-full object-cover" 
                        alt="" 
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm text-white truncate mb-1 group-hover:text-indigo-400 transition-colors">{album.title}</p>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">{album.releaseYear} • Album</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-white tracking-tight mb-8">Fans also like</h2>
              <div className="grid grid-cols-2 gap-8">
                {similarArtists.slice(0, 4).map((a, i) => (
                  <Link key={i} href={`/artist/${encodeURIComponent(a.id)}`} className="text-center group block">
                    <div className="aspect-square rounded-full overflow-hidden mb-4 border-4 border-white/5 group-hover:border-indigo-500/30 transition-all shadow-2xl group-hover:scale-110 bg-white/5">
                      <img 
                        src={a.image} 
                        onError={(e) => { e.currentTarget.src = ARTIST_FALLBACK }}
                        className="w-full h-full object-cover" 
                        alt="" 
                      />
                    </div>
                    <p className="font-black text-[10px] text-white/40 group-hover:text-white uppercase tracking-widest transition-colors truncate px-2">{a.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

