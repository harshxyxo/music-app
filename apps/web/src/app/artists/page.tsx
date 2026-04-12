'use client';

import { useEffect, useState } from 'react';
import { searchTracks } from '../../services/saavn';
import { Track } from '../../store/usePlayerStore';
import Link from 'next/link';
import { motion } from 'framer-motion';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

interface ArtistEntry {
  name: string;
  image: string;
  source: 'saavn' | 'youtube';
}

const curatedArtistQueries = [
  'Arijit Singh', 'A.R. Rahman', 'Shreya Ghoshal', 'Pritam', 'Atif Aslam',
  'Neha Kakkar', 'Diljit Dosanjh', 'Badshah', 'Jubin Nautiyal', 'Armaan Malik',
  'Vishal Mishra', 'Darshan Raval', 'Sachet Tandon', 'B Praak', 'KK',
  'Sunidhi Chauhan', 'Yo Yo Honey Singh', 'AP Dhillon', 'Sidhu Moose Wala', 'Guru Randhawa',
];

async function fetchYouTubeFallback(): Promise<ArtistEntry[]> {
  // Use Invidious (no API key needed) to search for artist channels
  try {
    const queries = curatedArtistQueries.slice(0, 12);
    const results: ArtistEntry[] = [];
    // Fetch a few at a time to avoid hammering
    for (const name of queries) {
      try {
        const res = await fetch(`https://vid.puffyan.us/api/v1/search?q=${encodeURIComponent(name + ' music')}&type=channel&sort_by=relevance`);
        const data = await res.json();
        if (data?.[0]) {
          const ch = data[0];
          const thumb = ch.authorThumbnails?.find((t: any) => t.width >= 176)?.url || ch.authorThumbnails?.[0]?.url || '';
          results.push({ name, image: thumb.startsWith('//') ? 'https:' + thumb : thumb, source: 'youtube' });
        }
      } catch { 
        results.push({ name, image: '', source: 'youtube' });
      }
    }
    return results;
  } catch {
    return curatedArtistQueries.slice(0, 12).map(name => ({ name, image: '', source: 'youtube' }));
  }
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<ArtistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Try JioSaavn first — search curated artists and deduplicate
        const results = await Promise.all(
          curatedArtistQueries.map(q => searchTracks(q))
        );

        const artistMap = new Map<string, ArtistEntry>();
        results.forEach((tracks, i) => {
          const name = curatedArtistQueries[i];
          if (!artistMap.has(name) && tracks.length > 0) {
            artistMap.set(name, { name, image: tracks[0].coverImage || '', source: 'saavn' });
          }
        });

        if (artistMap.size >= 6) {
          setArtists(Array.from(artistMap.values()));
        } else {
          // Fallback to YouTube
          const ytArtists = await fetchYouTubeFallback();
          setArtists(ytArtists);
        }
      } catch (err) {
        console.error('Failed to load artists from Saavn, using YouTube fallback:', err);
        const ytArtists = await fetchYouTubeFallback();
        setArtists(ytArtists);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-32 skeleton rounded" />
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => <div key={i} className="flex flex-col items-center gap-2"><div className="w-20 h-20 rounded-full skeleton" /><div className="h-3 w-16 skeleton rounded" /></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 pb-24">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] mb-0.5">Artists</h1>
        <p className="text-[var(--text-muted)] text-xs font-medium">Popular artists you love</p>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {artists.map((artist, i) => (
          <motion.div key={i} variants={fadeUp}>
            <Link href={`/artist/${encodeURIComponent(artist.name)}`} className="flex flex-col items-center gap-2 group">
              <div className="w-[88px] h-[88px] rounded-full overflow-hidden border-2 border-black/5 group-hover:border-[var(--accent-green)]/40 group-hover:shadow-lg transition-all">
                {artist.image ? (
                  <img src={artist.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={artist.name} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{artist.name[0]}</span>
                  </div>
                )}
              </div>
              <span className="font-semibold text-[11px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors text-center w-24 truncate">{artist.name}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
