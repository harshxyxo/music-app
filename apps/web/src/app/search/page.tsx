'use client';

import { Search as SearchIcon, X, Clock, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { searchTracks } from '../../services/saavn';
import { usePlayerStore, Track, Playlist } from '../../store/usePlayerStore';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { artists as mockArtists, albums as mockAlbums, tracks as mockTracks, Artist, Album } from '../../lib/mockData';
import TrackContextMenu from '../../components/TrackContextMenu';
import Link from 'next/link';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [playlistResults, setPlaylistResults] = useState<Playlist[]>([]);
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const [albumResults, setAlbumResults] = useState<Album[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { play, setQueue, searchHistory, addSearchHistory, removeSearchHistory, clearSearchHistory, playCounts } = usePlayerStore();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        const searchVal = searchQuery.trim().toLowerCase();
        
        // --- MOCK DATA SEARCH ---
        const filteredArtists = mockArtists.filter(a => a.name.toLowerCase().includes(searchVal));
        const filteredAlbums = mockAlbums.filter(a => a.title.toLowerCase().includes(searchVal));
        const filteredMockTracks = mockTracks.filter(t => t.title.toLowerCase().includes(searchVal));
        
        setArtistResults(filteredArtists);
        setAlbumResults(filteredAlbums);

        // --- SAAVN SEARCH ---
        const tracks = await searchTracks(searchQuery);
        // Merge mock tracks and Saavn tracks (avoiding duplicates if any, but IDs differ)
        setResults([...filteredMockTracks, ...tracks.filter(t => !filteredMockTracks.some(mt => mt.title.toLowerCase() === t.title.toLowerCase()))]);

        // --- FIRESTORE PLAYLIST SEARCH ---
        try {
          const q = query(collection(db, 'playlists'), where('isPublic', '==', true));
          const snapshot = await getDocs(q);
          const playlists: Playlist[] = [];
          snapshot.forEach(doc => {
            const data = doc.data() as Playlist;
            if (data.name.toLowerCase().includes(searchVal)) {
              playlists.push({ ...data, id: doc.id });
            }
          });
          setPlaylistResults(playlists);
        } catch (err) {
          console.error('Playlist search failed:', err);
          setPlaylistResults([]);
        }

        setIsSearching(false);
        if (tracks.length > 0 || playlistResults.length > 0 || filteredArtists.length > 0) {
          addSearchHistory(searchQuery.trim());
        }
      } else {
        setResults([]);
        setPlaylistResults([]);
        setArtistResults([]);
        setAlbumResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const topResult = (() => {
    if (!searchQuery) return null;
    const searchVal = searchQuery.toLowerCase();
    const exactArtist = artistResults.find(a => a.name.toLowerCase() === searchVal);
    if (exactArtist) return { type: 'ARTIST', data: exactArtist };
    const exactTrack = results.find(t => t.title.toLowerCase() === searchVal);
    if (exactTrack) return { type: 'TRACK', data: exactTrack };
    if (artistResults[0]) return { type: 'ARTIST', data: artistResults[0] };
    if (results[0]) return { type: 'TRACK', data: results[0] };
    return null;
  })();

  return (
    <div 
      className="p-8 h-full max-w-7xl mx-auto pt-12 flex flex-col custom-scrollbar overflow-y-auto outline-none"
      tabIndex={0}
      onMouseEnter={(e) => e.currentTarget.focus()}
    >
      {/* Search Input */}
      <div className="relative mb-12 max-w-2xl flex-shrink-0">
        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--text-muted)]" />
        <input
          autoFocus
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="w-full bg-black/[0.04] border border-black/10 rounded-full py-5 pl-16 pr-6 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-green)] transition-all text-lg font-medium"
        />
      </div>

      {!searchQuery ? (
        <>
          <div className="flex items-center justify-between mb-8 max-w-2xl">
             <h2 className="text-3xl font-bold font-['Plus_Jakarta_Sans'] tracking-tight text-[var(--text-primary)]">Recent Searches</h2>
             {searchHistory.length > 0 && (
               <button onClick={clearSearchHistory} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Clear All</button>
             )}
          </div>
          <div className="space-y-3 max-w-2xl">
            {searchHistory.length === 0 ? (
               <p className="text-[var(--text-muted)] italic">Your search history is empty. Try searching for something!</p>
            ) : searchHistory.map((item, i) => (
                <div key={i} onClick={() => setSearchQuery(item)} className="flex items-center justify-between p-4 bg-black/[0.02] hover:bg-black/[0.05] rounded-2xl cursor-pointer transition-colors border border-black/5 hover:border-black/10 group shadow-sm">
                  <div className="flex items-center gap-5">
                      <Clock className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-green)] transition-colors" />
                      <span className="font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] tracking-wide">{item}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeSearchHistory(item); }} className="opacity-0 group-hover:opacity-100 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all bg-black/[0.03] rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 space-y-12 pb-24">
          {/* Top Row: Top Result & Songs */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Top Result */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-black text-white tracking-tight mb-6">Top Result</h2>
              {topResult ? (
                <div className="group relative p-8 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-[2.5rem] transition-all overflow-hidden h-full flex flex-col justify-end min-h-[300px]">
                  <div className="absolute top-8 left-8 w-24 h-24 rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src={topResult.type === 'ARTIST' ? (topResult.data as Artist).image : (topResult.data as Track).coverImage} 
                      className={`w-full h-full object-cover shadow-2xl ${topResult.type === 'ARTIST' ? 'rounded-full' : 'rounded-2xl'}`} 
                      alt="" 
                    />
                  </div>
                  <div className="relative z-10 pt-32">
                    <h3 className="text-4xl font-black text-white tracking-tighter mb-2">
                      {topResult.type === 'ARTIST' ? (topResult.data as Artist).name : (topResult.data as Track).title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#ba9eff]">
                        {topResult.type}
                      </span>
                      {topResult.type === 'TRACK' && (
                        <Link href={`/artist/${encodeURIComponent((topResult.data as Track).artist)}`} className="text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors">
                          • {(topResult.data as Track).artist}
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {/* Play Button Overlay */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(topResult.type === 'TRACK') play(topResult.data as Track); }}
                    className="absolute bottom-8 right-8 w-14 h-14 bg-[#ba9eff] rounded-full flex items-center justify-center shadow-2xl shadow-[#ba9eff]/30 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                  >
                    <Play className="w-6 h-6 text-[#0f1218] fill-[#0f1218] ml-1" />
                  </button>
                </div>
              ) : (
                <div className="p-8 bg-white/[0.02] border border-dashed border-white/5 rounded-[2.5rem] h-full flex items-center justify-center text-white/10 italic text-sm">
                  Finding greatness...
                </div>
              )}
            </div>

            {/* Songs List */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-black text-white tracking-tight mb-6">Songs</h2>
              <div className="space-y-1">
                {results.slice(0, 4).map((track) => (
                  <div key={track.id} onClick={() => { setQueue(results); play(track); }} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 cursor-pointer group transition-all border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative shadow-lg shrink-0">
                        <img src={track.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-sm text-white truncate mb-0.5 group-hover:text-[#ba9eff]">{track.title}</p>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest truncate">{track.artist}</p>
                      </div>
                    </div>
                    <TrackContextMenu track={track} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Artists Section */}
          {artistResults.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white tracking-tight">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {artistResults.map((artist) => (
                  <Link key={artist.id} href={`/artist/${encodeURIComponent(artist.id)}`} className="group p-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-[2rem] transition-all text-center">
                    <div className="aspect-square rounded-full overflow-hidden mb-5 shadow-2xl transition-transform duration-500 group-hover:scale-105 border-4 border-white/5 group-hover:border-indigo-500/20">
                      <img src={artist.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <p className="font-bold text-sm text-white truncate mb-1">{artist.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Artist</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Albums Section */}
          {albumResults.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white tracking-tight">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {albumResults.map((album) => (
                  <Link key={album.id} href={`/album/${album.id}`} className="group p-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-[2rem] transition-all">
                    <div className="aspect-square rounded-2xl overflow-hidden mb-5 shadow-2xl transition-transform duration-500 group-hover:scale-105 border border-white/5">
                      <img src={album.coverImage} className="w-full h-full object-cover" alt="" />
                    </div>
                    <p className="font-bold text-sm text-white truncate mb-1">{album.title}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 truncate">{album.artistName}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Playlists Section */}
          {playlistResults.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white tracking-tight">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {playlistResults.map((p) => (
                  <Link key={p.id} href={`/playlist/${p.id}`} className="group p-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-[2rem] transition-all">
                    <div className="aspect-square rounded-2xl overflow-hidden mb-5 shadow-2xl transition-transform duration-500 group-hover:scale-105 border border-white/5 bg-white/5 flex items-center justify-center">
                      {p.tracks && p.tracks[0] ? (
                        <img src={p.tracks[0].coverImage} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="text-[10px] font-black text-white/10 uppercase tracking-widest italic">Empty</div>
                      )}
                    </div>
                    <p className="font-bold text-sm text-white truncate mb-1">{p.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Playlist</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!isSearching && results.length === 0 && playlistResults.length === 0 && artistResults.length === 0 && albumResults.length === 0 && (
             <div className="py-20 text-center space-y-4">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                 <SearchIcon className="w-10 h-10" />
               </div>
               <p className="text-[var(--text-muted)] font-bold text-lg">No results found for "{searchQuery}"</p>
               <p className="text-xs text-white/20 uppercase tracking-widest">Try searching for something else</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
