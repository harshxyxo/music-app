import { Track } from '../store/usePlayerStore';

export async function searchYT(query: string, type: string = 'song'): Promise<Track[]> {
  try {
    const res = await fetch(`/api/yt?q=${encodeURIComponent(query)}&type=${type}`);
    const data = await res.json();
    if (!data || data.error) return [];
    
    // Convert to Track interface
    return data.map((t: any) => ({
      ...t,
      // Ensure audioUrl is a direct stream or a placeholder that the player can handle
      // For this implementation, we assume the player or a middleware will resolve the YT URL
      audioUrl: t.audioUrl || `https://youtube.com/watch?v=${t.id}` 
    }));
  } catch (err) {
    console.error('YouTube Service Error:', err);
    return [];
  }
}
