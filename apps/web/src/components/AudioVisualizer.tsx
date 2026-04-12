'use client';

import { motion } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';
import { useEffect, useState } from 'react';

export default function AudioVisualizer({ className = '' }: { className?: string }) {
  const { isPlaying } = usePlayerStore();
  const [pulse, setPulse] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Simulate audio visualizer pulse when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPulse(1 + Math.random() * 0.2); // Random scale between 1 and 1.2
        setRotation((prev) => prev + (Math.random() * 10 - 5)); // Subtle organic rotation
      }, 150);
    } else {
      setPulse(1);
      setRotation(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <motion.div
      animate={{ scale: pulse, opacity: isPlaying ? 0.7 : 0.3, rotate: rotation }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`absolute inset-[-20px] bg-gradient-to-tr from-neon-pink via-purple-500 to-soft-orange rounded-full blur-2xl z-[-1] ${className}`}
    />
  );
}
