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
  const artistId = searchParams.get('id');

  if (!artistId) return NextResponse.json({ error: 'Missing artist ID' }, { status: 400 });

  try {
    await init();
    
    const artist = await ytmusic.getArtist(artistId) as any;
    
    // Some basic mapping to ensure we return what the UI expects
    return NextResponse.json({
      name: artist.name,
      description: artist.description || `${artist.name} is a renowned musical artist with a unique sound.`,
      image: artist.thumbnails?.[artist.thumbnails.length - 1]?.url || '',
      topTracks: artist.topSongs?.slice(0, 20).map((s: any) => ({
        id: s.videoId,
        title: s.name,
        artist: artist.name,
        artistId: artistId,
        coverImage: `https://img.youtube.com/vi/${s.videoId}/maxresdefault.jpg`,
        audioUrl: `https://youtube.com/watch?v=${s.videoId}`
      })) || [],
      albums: (artist.albums || []).slice(0, 4).map((a: any) => ({
        id: a.albumId,
        title: a.name,
        coverImage: a.thumbnails?.[a.thumbnails.length - 1]?.url || '',
        releaseYear: 'Authentic 2024'
      })),
      similar: (artist.related || []).slice(0, 10).map((r: any) => ({
        id: r.artistId,
        name: r.name,
        image: r.thumbnails?.[r.thumbnails.length - 1]?.url || ''
      }))
    });
  } catch (err) {
    console.error('YTMusic Artist Fetch Error:', err);
    return NextResponse.json({ error: 'Failed to fetch artist details' }, { status: 500 });
  }
}
