'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal, PlusCircle, Share2, Pencil, Trash2, 
  Download, Lock, Users, Radio, ListMusic, EyeOff, FolderPlus 
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SpotifyPlaylistMenuProps {
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function SpotifyPlaylistMenu({ onDelete, onEdit }: SpotifyPlaylistMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const menuItems = [
    { label: 'Add to queue', icon: ListMusic },
    { label: 'Start a Jam', icon: Radio },
    { label: 'Add to profile', icon: PlusCircle },
    { label: 'Edit details', icon: Pencil, onClick: onEdit },
    { label: 'Delete', icon: Trash2, onClick: onDelete, danger: true },
    { label: 'Download', icon: Download },
    { label: 'Make private', icon: Lock },
    { label: 'Invite collaborators', icon: Users },
    { label: 'Exclude from your taste profile', icon: EyeOff },
    { label: 'Move to folder', icon: FolderPlus, hasArrow: true },
    { label: 'Add to other playlist', icon: PlusCircle, hasArrow: true },
    { label: 'Share', icon: Share2, hasArrow: true },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setOpen(!open)} 
        className="p-2 text-[var(--text-muted)] hover:text-white transition-colors"
      >
        <MoreHorizontal className="w-8 h-8" />
      </button>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute left-0 top-12 w-64 bg-[#282828] shadow-2xl rounded-md overflow-hidden z-[200] p-1"
          >
            {menuItems.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-white/10 rounded-sm transition-colors ${item.danger ? 'text-red-500' : 'text-white/90'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 opacity-70" />
                  <span>{item.label}</span>
                </div>
                {item.hasArrow && <span className="text-[10px] opacity-50">▶</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
