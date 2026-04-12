export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  coverImage?: string;
  audioUrl: string;
  language?: string;
}

export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * REPLACED: JioSaavn is dropped in favor of YouTube Music API
 * This wrapper ensures all existing calls to searchTracks get diverse YouTube results.
 */
export async function searchTracks(query: string): Promise<Track[]> {
  try {
    const res = await fetch(`/api/yt?q=${encodeURIComponent(query)}&type=song`);
    const data = await res.json();
    if (!data || data.error) return [];
    
    return data.map((t: any) => ({
      ...t,
      // For the audioUrl, we'll try to find a direct stream if possible, or use the YT link
      // Assuming the player handles YT links or a proxy is used.
      audioUrl: t.audioUrl || `https://youtube.com/watch?v=${t.id}` 
    }));
  } catch (error) {
    console.error('YouTube Proxy Search Error:', error);
    return [];
  }
}

export async function getTrendingByGenre(query: string, limit = 20): Promise<Track[]> {
  const results = await searchTracks(query);
  return results.slice(0, limit);
}

export async function searchPlaylists(query: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/yt?q=${encodeURIComponent(query)}&type=playlist`);
    const data = await res.json();
    if (!data || data.error) return [];
    return data;
  } catch (error) {
    console.error('YouTube Proxy Playlists Error:', error);
    return [];
  }
}

export async function searchAlbums(query: string): Promise<any[]> {
  // YTMusic API searchSongs often returns album context, or we can use searchTracks for diversity
  return searchTracks(query);
}

