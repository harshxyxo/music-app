'use client';

import { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

export default function GlobalKeyboardListener() {
  const { togglePlay, play, pause, duration, setTime, currentTrack } = usePlayerStore();

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;

      const player = (window as any).groovraPlayer;

      // Seek Forward/Backward (Brute-Force Direct Player Access)
      if (e.code === 'ArrowRight' || e.code === 'End') {
        e.preventDefault();
        if (player && typeof player.getCurrentTime === 'function') {
          player.seekTo(player.getCurrentTime() + 5, true);
        }
      }
      if (e.code === 'ArrowLeft' || e.code === 'Home') {
        e.preventDefault();
        if (player && typeof player.getCurrentTime === 'function') {
          player.seekTo(Math.max(0, player.getCurrentTime() - 5), true);
        }
      }

      // Play/Pause Toggle (Real Player Command Execution)
      if (e.code === 'Space') {
        e.preventDefault();
        if (player && typeof player.getPlayerState === 'function') {
           const playerState = player.getPlayerState();
           const isActuallyPlaying = playerState === (window as any).YT.PlayerState.PLAYING;
           if (isActuallyPlaying) {
              player.pauseVideo();
              pause();
           } else {
              player.playVideo();
              play();
           }
        } else {
           // Fallback to state-only toggle if player is unavailable
           togglePlay();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [togglePlay, play, pause]);

  return null;
}
