export async function fetchLyrics(artist: string, title: string): Promise<string> {
  try {
    const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    const data = await res.json();
    if (data && data.lyrics) {
      return data.lyrics;
    }
    return '';
  } catch (err) {
    console.error('Lyrics API Error:', err);
    return '';
  }
}
