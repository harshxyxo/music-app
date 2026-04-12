'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, collection, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { usePlayerStore, Playlist } from '@/store/usePlayerStore';

export default function AuthListener() {
  const { setLikedSongs, setCustomPlaylists, setUserName, setUserImage, resetUserStates } = usePlayerStore();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User logged in
        setUserName(user.displayName || 'Groovra User');
        setUserImage(user.photoURL);

        const userDocRef = doc(db, 'users', user.uid);
        
        // Ensure user document exists (especially for new signups/guests)
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: user.email || 'guest@groovra.com',
            displayName: user.displayName || 'Guest',
            likedSongs: [],
            customPlaylists: [],
            createdAt: new Date().toISOString()
          });
        }

        // Real-time listener for user data (likedSongs, etc)
        const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            if (data.likedSongs) setLikedSongs(data.likedSongs);
          }
        });

        // Real-time listener for user's playlists
        const playlistsQuery = query(collection(db, 'playlists'), where('userId', '==', user.uid));
        const unsubscribePlaylists = onSnapshot(playlistsQuery, (snapshot) => {
          const playlists: Playlist[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.deleted) {
              playlists.push({ id: doc.id, ...data } as Playlist);
            }
          });
          setCustomPlaylists(playlists);
        });

        return () => {
          unsubscribeUser();
          unsubscribePlaylists();
        };
      } else {
        // User logged out
        resetUserStates();
        localStorage.removeItem('isAuthenticated');
      }
    });

    return () => unsubscribeAuth();
  }, [setLikedSongs, setCustomPlaylists, setUserName, setUserImage, resetUserStates]);

  return null;
}
