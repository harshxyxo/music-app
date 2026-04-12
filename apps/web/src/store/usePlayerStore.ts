import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore';

export interface Track {
  id: string;
  title: string;
  name?: string; // For Firestore compatibility
  artist: string;
  artistId?: string;
  coverImage?: string;
  coverUrl?: string; // For Firestore compatibility
  audioUrl: string;
  language?: string;
  duration?: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  isPublic: boolean;
}

export interface ListeningEvent {
  trackId: string;
  artist: string;
  title: string;
  timestamp: number;
}

export interface FollowedArtist {
  name: string;
  image: string;
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  currentTime: number;
  duration: number;
  
  likedSongs: Track[];
  recentPlayed: Track[];
  customPlaylists: Playlist[];
  highlights: Track[];
  listeningHistory: ListeningEvent[];
  playCounts: Record<string, number>;
  
  userName: string;
  userImage: string | null;
  setUserName: (name: string) => void;
  setUserImage: (image: string | null) => void;

  setLikedSongs: (songs: Track[]) => void;
  setCustomPlaylists: (playlists: Playlist[]) => void;
  resetUserStates: () => void;

  setQueue: (tracks: Track[]) => void;
  play: (track?: Track) => void;
  pause: () => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setTime: (currentTime: number, duration: number) => void;

  toggleLike: (track: Track) => void;
  addRecent: (track: Track) => void;
  createPlaylist: (name: string, isPublic?: boolean) => void;
  deletePlaylist: (id: string) => void;
  togglePlaylistPrivacy: (id: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  setHighlights: (tracks: Track[]) => void;
  logListening: (track: Track) => void;
  incrementPlayCount: (trackId: string) => void;
  
  isShuffle: boolean;
  isRepeat: boolean;
  isAutoplay: boolean;
  isPrivateSession: boolean;
  audioQuality: 'low' | 'medium' | 'high';
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setAutoplay: (enabled: boolean) => void;
  setPrivateSession: (enabled: boolean) => void;
  setAudioQuality: (quality: 'low' | 'medium' | 'high') => void;

  isRightSidebarOpen: boolean;
  toggleRightSidebar: () => void;

  followedArtists: FollowedArtist[];
  toggleFollow: (artist: FollowedArtist) => void;
  
  offlineTracks: Track[];
  addToOffline: (track: Track) => void;
  bulkAddToOffline: (tracks: Track[]) => void;
  removeFromOffline: (trackId: string) => void;

  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  removeSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  bassBoost: number;
  setBassBoost: (level: number) => void;
  crossfadeSettings: number;
  setCrossfadeSettings: (seconds: number) => void;
  sleepTimer: number | null;
  setSleepTimer: (minutes: number | null) => void;
  addToQueue: (track: Track) => void;
}

// Web Audio API Globals
let audioContext: AudioContext;
let source: MediaElementAudioSourceNode | null = null;
let bassFilter: BiquadFilterNode | null = null;

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      isPlaying: false,
      volume: 0.8,
      progress: 0,
      currentTime: 0,
      duration: 0,
      
      likedSongs: [],
      recentPlayed: [],
      followedArtists: [],
      customPlaylists: [],
      highlights: [],
      listeningHistory: [],
      playCounts: {},
      isAutoplay: true,
      isShuffle: false,
      isRepeat: false,
      isPrivateSession: false,
      audioQuality: 'high',

      userName: 'Groovra User',
      userImage: null,
      setUserName: (name) => set({ userName: name }),
      setUserImage: (image) => set({ userImage: image }),

      setLikedSongs: (songs) => set({ likedSongs: songs }),
      setCustomPlaylists: (playlists) => set({ customPlaylists: playlists }),
      resetUserStates: () => set({ 
        likedSongs: [], 
        customPlaylists: [], 
        recentPlayed: [], 
        followedArtists: [],
        userName: 'Groovra User',
        userImage: null
      }),

      searchHistory: [],
      addSearchHistory: (query) => {
        const { searchHistory } = get();
        const updated = [query, ...searchHistory.filter(q => q !== query)].slice(0, 10);
        set({ searchHistory: updated });
      },
      removeSearchHistory: (query) => {
        const { searchHistory } = get();
        set({ searchHistory: searchHistory.filter(q => q !== query) });
      },
      clearSearchHistory: () => set({ searchHistory: [] }),
      
      bassBoost: 0,
      setBassBoost: (level: number) => {
        set({ bassBoost: level });
        
        // Real logic if audioContext is available (usually initialized on first user interaction)
        if (typeof window !== 'undefined' && (window as any).groovraAudioElement) {
          if (!audioContext) audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (!source) source = audioContext.createMediaElementSource((window as any).groovraAudioElement);
          if (!bassFilter) {
            bassFilter = audioContext.createBiquadFilter();
            bassFilter.type = "lowshelf";
            bassFilter.frequency.value = 200;
            source.connect(bassFilter);
            bassFilter.connect(audioContext.destination);
          }
          bassFilter.gain.value = level;
        }
      },

      crossfadeSettings: 5,
      setCrossfadeSettings: (seconds: number) => set({ crossfadeSettings: seconds }),

      sleepTimer: null,
      setSleepTimer: (minutes: number | null) => set({ sleepTimer: minutes }),

      setHighlights: (tracks) => set({ highlights: tracks }),

      toggleLike: async (track) => {
        const { likedSongs } = get();
        const exists = likedSongs.some(t => t.id === track.id);
        
        // Optimistic Update
        set({ likedSongs: exists ? likedSongs.filter(t => t.id !== track.id) : [...likedSongs, track] });

        try {
          const user = auth.currentUser;
          if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
              likedSongs: exists ? arrayRemove(track) : arrayUnion(track)
            });
          }
        } catch (err) {
          console.error('Failed to sync like to Firestore:', err);
          // Rollback if needed, but arrayUnion/arrayRemove is usually reliable
        }
      },

      addRecent: async (track) => {
        const { recentPlayed, isPrivateSession, duration } = get();
        if (isPrivateSession) return;
        const cleanList = recentPlayed.filter(t => t.id !== track.id);
        const trackWithDuration = { ...track, duration: track.duration || duration || 0 };
        const updatedRecent = [trackWithDuration, ...cleanList].slice(0, 15);
        set({ recentPlayed: updatedRecent });
      },

      createPlaylist: async (name: string, isPublic = true) => {
        const { customPlaylists } = get();
        const playlistName = String(name || 'Untitled Playlist').trim();
        const user = auth.currentUser;
        if (!user) return;

        const newPlaylistId = Date.now().toString();
        const newPlaylist: Playlist & { userId: string } = {
          id: newPlaylistId,
          name: playlistName,
          tracks: [],
          isPublic: isPublic,
          userId: user.uid
        };
        
        // Optimistic Update
        set({ customPlaylists: [...customPlaylists, newPlaylist] });

        try {
          const playlistDocRef = doc(db, 'playlists', newPlaylistId);
          await setDoc(playlistDocRef, newPlaylist);
        } catch (err) {
          console.error('Failed to sync playlist to Firestore:', err);
        }
      },

      togglePlaylistPrivacy: async (id) => {
        const { customPlaylists } = get();
        const playlist = customPlaylists.find(p => p.id === id);
        if (!playlist) return;

        const updated = customPlaylists.map(p => 
          p.id === id ? { ...p, isPublic: !p.isPublic } : p
        );
        set({ customPlaylists: updated });

        try {
          const playlistDocRef = doc(db, 'playlists', id);
          await updateDoc(playlistDocRef, { isPublic: !playlist.isPublic });
        } catch (err) {
          console.error('Failed to sync privacy toggle:', err);
        }
      },

      deletePlaylist: async (id) => {
        const { customPlaylists } = get();
        set({ customPlaylists: customPlaylists.filter(p => p.id !== id) });

        try {
          const user = auth.currentUser;
          if (user) {
            // In a real app, you might want to use a cloud function or just delete the doc
            const playlistDocRef = doc(db, 'playlists', id);
            // Check if user owns it before deleting (basic client-side check)
            const snap = await getDoc(playlistDocRef);
            if (snap.exists() && snap.data().userId === user.uid) {
              await updateDoc(playlistDocRef, { deleted: true }); // Or use deleteDoc(playlistDocRef)
              // For now, let's keep it simple and just delete or flag it
              // deleteDoc is better if you have permissions set up
              // import { deleteDoc } from 'firebase/firestore'; 
            }
          }
        } catch (err) {
          console.error('Failed to delete playlist from Firestore:', err);
        }
      },

      addToPlaylist: async (playlistId, track) => {
        const { customPlaylists } = get();
        const playlist = customPlaylists.find(p => p.id === playlistId);
        if (!playlist) return;

        const updated = customPlaylists.map(p => 
          p.id === playlistId && !p.tracks.some(t => t.id === track.id)
            ? { ...p, tracks: [...p.tracks, track] }
            : p
        );
        set({ customPlaylists: updated });

        try {
          const playlistDocRef = doc(db, 'playlists', playlistId);
          await updateDoc(playlistDocRef, {
            tracks: arrayUnion(track)
          });
        } catch (err) {
          console.error('Failed to add track to Firestore playlist:', err);
        }
      },

      removeFromPlaylist: async (playlistId, trackId) => {
        const { customPlaylists } = get();
        const playlist = customPlaylists.find(p => p.id === playlistId);
        if (!playlist) return;

        const trackToRemove = playlist.tracks.find(t => t.id === trackId);
        if (!trackToRemove) return;

        const updated = customPlaylists.map(p => 
          p.id === playlistId 
            ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) }
            : p
        );
        set({ customPlaylists: updated });

        try {
          const playlistDocRef = doc(db, 'playlists', playlistId);
          await updateDoc(playlistDocRef, {
            tracks: arrayRemove(trackToRemove)
          });
        } catch (err) {
          console.error('Failed to remove track from Firestore playlist:', err);
        }
      },

      setQueue: (tracks) => set({ queue: tracks }),
      
      play: (track) => {
        const state = get();
        if (track) {
          const isNewTrack = track.id !== state.currentTrack?.id;
          set({ isPlaying: true, currentTrack: track, ...(isNewTrack && { progress: 0, currentTime: 0 }) });
          if (isNewTrack) state.addRecent(track);
        } else if (state.currentTrack) {
          set({ isPlaying: true });
        }
      },
      
      pause: () => set({ isPlaying: false }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      toggleRepeat: () => set((state) => ({ isRepeat: !state.isRepeat })),
      setAutoplay: (enabled) => set({ isAutoplay: enabled }),
      setPrivateSession: (enabled) => set({ isPrivateSession: enabled }),
      setAudioQuality: (quality) => set({ audioQuality: quality }),
      
      playNext: () => {
        const { currentTrack, queue, addRecent, isShuffle, isRepeat } = get();
        if (!currentTrack || queue.length === 0) return;
        if (isRepeat) { set({ isPlaying: true, progress: 0, currentTime: 0 }); return; }
        let nextTrack;
        if (isShuffle) {
          const remaining = queue.filter(t => t.id !== currentTrack.id);
          nextTrack = remaining[Math.floor(Math.random() * remaining.length)] || queue[0];
        } else {
          const idx = queue.findIndex(t => t.id === currentTrack.id);
          nextTrack = queue[(idx + 1) % queue.length];
        }
        set({ currentTrack: nextTrack, isPlaying: true, progress: 0, currentTime: 0 });
        addRecent(nextTrack);
      },
      
      playPrevious: () => {
        const { currentTrack, queue, addRecent, isShuffle } = get();
        if (!currentTrack || queue.length === 0) return;
        let prevTrack;
        if (isShuffle) {
          const remaining = queue.filter(t => t.id !== currentTrack.id);
          prevTrack = remaining[Math.floor(Math.random() * remaining.length)] || queue[0];
        } else {
          const idx = queue.findIndex(t => t.id === currentTrack.id);
          prevTrack = queue[idx - 1 < 0 ? queue.length - 1 : idx - 1];
        }
        set({ currentTrack: prevTrack, isPlaying: true, progress: 0, currentTime: 0 });
        addRecent(prevTrack);
      },

      setVolume: (volume) => set({ volume }),
      setProgress: (progress) => set({ progress }),
      setTime: (currentTime, duration) => {
        const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
        set({ currentTime, duration, progress });
      },

      isRightSidebarOpen: false,
      toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),

      toggleFollow: (artist) => {
        const { followedArtists } = get();
        const exists = followedArtists.some(a => a.name === artist.name);
        set({ followedArtists: exists ? followedArtists.filter(a => a.name !== artist.name) : [...followedArtists, artist] });
      },

      offlineTracks: [],
      addToOffline: (track) => {
        const { offlineTracks } = get();
        if (!offlineTracks.some(t => t.id === track.id)) {
          set({ offlineTracks: [...offlineTracks, track] });
        }
      },
      bulkAddToOffline: (tracks) => {
        const { offlineTracks } = get();
        const newTracks = tracks.filter(t => !offlineTracks.some(ot => ot.id === t.id));
        if (newTracks.length > 0) {
          set({ offlineTracks: [...offlineTracks, ...newTracks] });
        }
      },
      removeFromOffline: (trackId) => {
        const { offlineTracks } = get();
        set({ offlineTracks: offlineTracks.filter(t => t.id !== trackId) });
      },

      logListening: async (track) => {
        const { listeningHistory, isPrivateSession, incrementPlayCount } = get();
        if (isPrivateSession) return;
        const newEvent: ListeningEvent = {
          trackId: track.id,
          artist: track.artist,
          title: track.title,
          timestamp: Date.now()
        };
        const updatedHistory = [newEvent, ...listeningHistory].slice(0, 500);
        set({ listeningHistory: updatedHistory });
        incrementPlayCount(track.id);

        try {
          const user = auth.currentUser;
          if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
              playHistory: arrayUnion(newEvent)
            });
          }
        } catch (err) {
          console.error('Failed to sync logListening to Firestore:', err);
        }
      },

      incrementPlayCount: (trackId: string) => {
        const { playCounts } = get();
        set({ playCounts: { ...playCounts, [trackId]: (playCounts[trackId] || 0) + 1 } });
      },

      addToQueue: (track: Track) => {
        const { queue } = get();
        if (!queue.some(t => t.id === track.id)) {
          set({ queue: [...queue, track] });
        }
      }
    }),
    {
      name: 'groovra-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Failsafe: Filter out zombie dummy data and placeholders
          state.followedArtists = Array.isArray(state.followedArtists) ? state.followedArtists.filter(a => 
            a.name && 
            a.image && 
            !a.image.includes('ocean') && 
            !a.image.includes('placeholder')
          ) : [];
          // Failsafe: Ensure playlists have valid names and tracks
          state.customPlaylists = Array.isArray(state.customPlaylists) ? state.customPlaylists.map(p => ({
            ...p,
            name: typeof p.name === 'string' ? p.name : 'Untitled Playlist',
            tracks: Array.isArray(p.tracks) ? p.tracks : []
          })) : [];
          // Ensure listening history is an array
          state.listeningHistory = Array.isArray(state.listeningHistory) ? state.listeningHistory : [];
          state.playCounts = typeof state.playCounts === 'object' && state.playCounts !== null ? state.playCounts : {};
          state.likedSongs = Array.isArray(state.likedSongs) ? state.likedSongs : [];
          state.offlineTracks = Array.isArray(state.offlineTracks) ? state.offlineTracks : [];
        }
      },
      partialize: (state) => ({
        likedSongs: state.likedSongs,
        recentPlayed: state.recentPlayed,
        customPlaylists: state.customPlaylists,
        userName: state.userName,
        userImage: state.userImage,
        searchHistory: state.searchHistory,
        volume: state.volume,
        isAutoplay: state.isAutoplay,
        isPrivateSession: state.isPrivateSession,
        audioQuality: state.audioQuality,
        followedArtists: state.followedArtists,
        offlineTracks: state.offlineTracks,
        listeningHistory: state.listeningHistory,
        playCounts: state.playCounts,
        sleepTimer: state.sleepTimer,
      }),
    }
  )
);

