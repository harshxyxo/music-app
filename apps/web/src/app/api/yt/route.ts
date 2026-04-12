import { NextRequest, NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();
let initialized = false;

async function init() {
  if (!initialized) {
    await ytmusic.initialize();
    initialized = true;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const type = searchParams.get('type') || 'song';

  if (!q) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

  try {
    await init();
    
    if (type === 'song') {
      const results = await ytmusic.searchSongs(q);
      return NextResponse.json(results.map(s => ({
        id: s.videoId,
        title: s.name,
        artist: s.artist?.name || 'Unknown Artist',
        artistId: s.artist?.artistId || '',
        coverImage: `https://img.youtube.com/vi/${s.videoId}/maxresdefault.jpg`, 
        audioUrl: `https://youtube.com/watch?v=${s.videoId}`, 
        language: 'english'
      })));
    }

    if (type === 'playlist') {
      const results = await ytmusic.searchPlaylists(q);
      return NextResponse.json(results.map(p => ({
        id: p.playlistId,
        name: p.name,
        coverImage: p.thumbnails?.[p.thumbnails.length - 1]?.url || '',
        trackCount: 0,
        author: p.artist?.name || 'YouTube Music'
      })));
    }

    if (type === 'artist') {
      const results = await ytmusic.searchArtists(q);
      return NextResponse.json(results.map(a => ({
        id: a.artistId,
        name: a.name,
        image: a.thumbnails?.[a.thumbnails.length - 1]?.url || ''
      })));
    }

    return NextResponse.json([]);
  } catch (err) {
    console.error('YTMusic API Error:', err);
    return NextResponse.json({ error: 'Failed to fetch from YouTube Music' }, { status: 500 });
  }
}
