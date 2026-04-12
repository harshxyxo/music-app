import { Track } from "../store/usePlayerStore";

const APP_NAME = 'GROOVRA';

let cachedHost: string | null = null;

export async function getAudiusHost() {
  if (cachedHost) return cachedHost;
  try {
    const res = await fetch('https://api.audius.co');
    const data = await res.json();
    const hosts: string[] = data.data;
    cachedHost = hosts[Math.floor(Math.random() * hosts.length)];
    return cachedHost;
  } catch (error) {
    console.error('Failed to fetch Audius hosts', error);
    return 'https://api.audius.co'; 
  }
}

export async function getTrendingTracks(): Promise<Track[]> {
  try {
    const host = await getAudiusHost();
    const res = await fetch(`${host}/v1/tracks/trending?app_name=${APP_NAME}&limit=15`);
    const json = await res.json();
    if (!json.data) return [];
    return json.data.map((track: any) => formatAudiusTrack(track, host));
  } catch (error) {
    console.error('Error fetching trending tracks:', error);
    return [];
  }
}

export async function getTrendingByGenre(genre: string, limit: number = 10): Promise<Track[]> {
  try {
    const host = await getAudiusHost();
    const res = await fetch(`${host}/v1/tracks/trending?genre=${encodeURIComponent(genre)}&app_name=${APP_NAME}&limit=${limit}`);
    const json = await res.json();
    if (!json.data) return [];
    return json.data.map((track: any) => formatAudiusTrack(track, host));
  } catch (error) {
    console.error(`Error fetching trending ${genre} tracks:`, error);
    return [];
  }
}

export async function searchTracks(query: string): Promise<Track[]> {
  if (!query) return [];
  try {
    const host = await getAudiusHost();
    const res = await fetch(`${host}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${APP_NAME}`);
    const json = await res.json();
    if (!json.data) return [];
    return json.data.map((track: any) => formatAudiusTrack(track, host));
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
}

function formatAudiusTrack(track: any, host: string): Track {
  const coverImage = track.artwork ? 
    (track.artwork['480x480'] || track.artwork['150x150'] || track.artwork['1000x1000']) : 
    undefined;

  return {
    id: String(track.id),
    title: track.title,
    artist: track.user.name,
    coverImage,
    audioUrl: `${host}/v1/tracks/${track.id}/stream?app_name=${APP_NAME}`
  };
}
