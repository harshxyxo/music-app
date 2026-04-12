'use client';

import { useEffect, useState, useRef } from 'react';
import { usePlayerStore, Track } from '../../store/usePlayerStore';
import { searchTracks } from '../../services/saavn';
import { Play, Users, Music, ListMusic, ArrowLeft, MoreHorizontal, Share2, Pencil, Camera, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useToast } from '../../components/Toast';
import { searchPlaylists } from '../../services/saavn';
import TrackContextMenu from '../../components/TrackContextMenu';
import JamModal from '../../components/JamModal';
import CreatePlaylistModal from '../../components/CreatePlaylistModal';
import BlendModal from '../../components/BlendModal';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ProfilePage() {
  const { play, setQueue, customPlaylists, createPlaylist, userName, setUserName, followedArtists, recentPlayed, playCounts } = usePlayerStore();
  const { showToast } = useToast();
  const [tempName, setTempName] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showPlaylistsModal, setShowPlaylistsModal] = useState(false);
  
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [showBlendModal, setShowBlendModal] = useState(false);
  const [showJamModal, setShowJamModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [publicPlaylists, setPublicPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTempName(userName);
    const savedPic = localStorage.getItem('profilePic');
    if (savedPic) setProfileImage(savedPic);
  }, [userName]);

  useEffect(() => {
    // Only show real data from store. We sort recentPlayed by playCounts to show 'top' tracks/artists.
    const topTracksFromStore = [...recentPlayed].sort((a, b) => (playCounts[b.id] || 0) - (playCounts[a.id] || 0)).slice(0, 5);
    setTopTracks(topTracksFromStore);

    const artistMap = new Map();
    recentPlayed.forEach((t: Track) => {
      if (!artistMap.has(t.artist)) {
        artistMap.set(t.artist, { artist: t.artist, coverImage: t.coverImage });
      }
    });
    const topArtistsFromStore = Array.from(artistMap.values()).slice(0, 10);
    setTopArtists(topArtistsFromStore);
    
    // Public playlists are real custom playlists that are public
    setPublicPlaylists(customPlaylists.filter(p => p.isPublic));
    setLoading(false);
  }, [recentPlayed, customPlaylists, playCounts]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        localStorage.setItem('profilePic', base64String);
        showToast('Profile photo updated!', 'success');
      };
      reader.readAsDataURL(file);
      setIsChangingPhoto(false);
    }
  };

  if (!mounted) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Profile link copied to clipboard!', 'success');
  };

    const publicCount = customPlaylists.filter(p => p.isPublic).length;
  const privateCount = customPlaylists.filter(p => !p.isPublic).length;

  return (
    <div 
      className="h-full overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#1e232e] to-[#0f1218] outline-none"
      tabIndex={0}
      onMouseEnter={(e) => e.currentTarget.focus()}
    >
      {/* Header Banner */}
      <div className="relative h-80 flex items-end p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1218] to-transparent z-10" />
        <div className="absolute inset-0 bg-[#53ddfc]/10 blur-[120px] rounded-full -top-40 -left-40 w-[600px] h-[600px]" />
        
        <div className="relative z-20 flex items-center gap-8 mb-4">
          <div className="w-48 h-48 rounded-full overflow-hidden border-[6px] border-white/5 shadow-2xl shadow-black/50 group relative cursor-pointer" onClick={() => setIsChangingPhoto(true)}>
            {profileImage ? (
              <img src={profileImage} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#53ddfc] to-[#ba9eff] flex items-center justify-center">
                <span className="text-6xl font-black text-white/90">{userName.split(' ').map(n => n[0]).join('')}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
              <Camera className="w-8 h-8 text-white" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Photo</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#53ddfc] mb-3 block opacity-80">Profile</span>
            <div className="flex items-center gap-4 group">
              <h1 className="text-7xl font-black tracking-tighter text-white flex items-center gap-4">
                {userName}
              </h1>
              <button onClick={() => { setTempName(userName); setIsEditingName(true); }} className="p-3 rounded-full hover:bg-white/10 text-white/20 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Pencil className="w-6 h-6" /></button>
            </div>
            <div className="flex items-center gap-6 text-white/60 text-sm font-bold mt-6">
              <button 
                onClick={() => setShowPlaylistsModal(true)} 
                className="hover:text-white transition-colors text-white underline underline-offset-4 decoration-[#53ddfc]/40"
              >
                {customPlaylists.length} Playlists
              </button>
              <span className="opacity-20">•</span>
              <button 
                onClick={() => setShowFollowingModal(true)} 
                className="hover:text-white transition-colors text-white underline underline-offset-4 decoration-[#53ddfc]/40"
              >
                {followedArtists.length} Following
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-16">
        {/* Actions */ }
        <div className="flex items-center gap-6 relative">
          <button onClick={handleShare} className="flex items-center gap-2.5 px-8 py-3 bg-[#53ddfc] hover:bg-[#4bcceb] rounded-full text-[11px] font-black tracking-wider text-[#0f1218] transition-all uppercase shadow-lg shadow-[#53ddfc]/20 hover:scale-105 active:scale-95"><Share2 className="w-4 h-4" /> Share Profile</button>
          
          <div className="relative">
            <button 
              onClick={() => setOptionsMenuOpen(prev => !prev)}
              className={`p-3 rounded-full transition-all border border-white/5 ${optionsMenuOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/40 hover:text-white'}`}
            >
              <MoreHorizontal className="w-6 h-6" />
            </button>

            <AnimatePresence>
              {optionsMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 mt-3 w-64 p-3 bg-[#1a1d24] border border-white/10 rounded-[2rem] shadow-2xl z-[100] backdrop-blur-xl"
                >
                  <div className="space-y-1">
                    {[
                      { label: 'Playlist', icon: ListMusic, action: () => setShowCreatePlaylistModal(true) },
                      { label: 'Blend', icon: Zap, action: () => setShowBlendModal(true) },
                      { label: 'Jam', icon: Music, action: () => setShowJamModal(true) },
                    ].map((item) => (
                      <button 
                        key={item.label}
                        onClick={() => { item.action(); setOptionsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl transition-all group text-left"
                      >
                        <item.icon className="w-4 h-4 text-white/40 group-hover:text-[#53ddfc] transition-colors" />
                        <span className="text-[11px] font-bold text-white/90 group-hover:text-white uppercase tracking-widest">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Top Artists This Month */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3"><Users className="w-6 h-6 text-[#53ddfc]" /> Top artists this month</h2>
            <Link href="/explore" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors border-b border-transparent hover:border-white/40 pb-1">See all</Link>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-6 no-scrollbar">
            {topArtists.map((artist, i) => (
              <Link key={i} href={`/artist/${encodeURIComponent(artist.artist)}`} className="flex-shrink-0 text-center group cursor-pointer block">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <div className="w-36 h-36 rounded-full overflow-hidden mb-4 border-2 border-white/5 group-hover:border-[#53ddfc]/50 transition-all shadow-xl group-hover:scale-105 duration-300 relative">
                    <img src={artist.coverImage || 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop'} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs font-bold text-white/80 group-hover:text-white transition-colors truncate w-36 px-2">{artist.artist}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Artist</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Tracks and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pb-32">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3"><Music className="w-6 h-6 text-[#ba9eff]" /> Top tracks this month</h2>
              <Link href="/new-releases" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors border-b border-transparent hover:border-white/40 pb-1">See all</Link>
            </div>
            <div className="space-y-2">
              {topTracks.map((track, i) => (
                <div key={i} onClick={() => { setQueue(topTracks); play(track); }} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 cursor-pointer group transition-all border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <span className="w-5 text-[11px] font-black text-white/20 text-center">{i + 1}</span>
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img src={track.coverImage} className="w-full h-full rounded-lg shadow-lg" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"><Play className="w-5 h-5 text-white fill-white" /></div>
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate group-hover:text-[#53ddfc] transition-colors">{track.title}</p>
                      <p className="text-[10px] text-white/40 font-bold mt-1 truncate">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <TrackContextMenu track={track} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3"><ListMusic className="w-6 h-6 text-[#53ddfc]" /> Public Playlists</h2>
              <Link href="/explore" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors border-b border-transparent hover:border-white/40 pb-1">See all</Link>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {publicPlaylists.map((p, i) => (
                <Link key={i} href={p.tracks ? `/playlist/${encodeURIComponent(p.name)}` : `/playlist/${encodeURIComponent(p.name)}`} className="bg-white/[0.03] p-5 rounded-[2rem] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-white/10 to-transparent mb-5 flex items-center justify-center overflow-hidden shadow-2xl relative">
                    <img src={p.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#53ddfc] flex items-center justify-center scale-90 group-hover:scale-100 transition-transform shadow-xl shadow-[#53ddfc]/30"><Play className="w-6 h-6 text-[#0f1218] fill-[#0f1218] ml-1" /></div>
                    </div>
                  </div>
                  <p className="text-sm font-black text-white truncate mb-1">{p.name}</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{p.trackCount || p.tracks?.length || 0} Tracks</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showFollowingModal && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFollowingModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
            <motion.div 
              initial={{ scale: 0.9, y: 40, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.9, y: 40, opacity: 0 }} 
              className="relative bg-[#1a1d24] border border-white/10 p-12 rounded-[3.5rem] w-full max-w-2xl max-h-[80vh] overflow-y-auto no-scrollbar shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Following</h3>
                <button onClick={() => setShowFollowingModal(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              
              {followedArtists.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 text-white/5 mx-auto mb-6" />
                  <p className="text-white/30 font-bold uppercase tracking-widest text-sm">You haven't followed anyone yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  {followedArtists.map((artist, i) => (
                    <Link key={i} href={`/artist/${encodeURIComponent(artist.name)}`} onClick={() => setShowFollowingModal(false)} className="text-center group block">
                      <div className="w-full aspect-square rounded-full overflow-hidden mb-4 border-2 border-white/5 group-hover:border-[#53ddfc]/50 transition-all shadow-xl group-hover:scale-105 duration-300 relative">
                        <img src={artist.image || 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop'} className="w-full h-full object-cover" alt="" />
                      </div>
                      <p className="text-xs font-black text-white group-hover:text-[#53ddfc] transition-colors truncate">{artist.name}</p>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {showPlaylistsModal && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPlaylistsModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
            <motion.div 
              initial={{ scale: 0.9, y: 40, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.9, y: 40, opacity: 0 }} 
              className="relative bg-[#1a1d24] border border-white/10 p-12 rounded-[3.5rem] w-full max-w-2xl max-h-[80vh] overflow-y-auto no-scrollbar shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Your Playlists</h3>
                <button onClick={() => setShowPlaylistsModal(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              
              {customPlaylists.length === 0 ? (
                <div className="text-center py-20">
                  <ListMusic className="w-16 h-16 text-white/5 mx-auto mb-6" />
                  <p className="text-white/30 font-bold uppercase tracking-widest text-sm">No playlists created yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {customPlaylists.map((p) => (
                    <Link key={p.id} href={`/playlist/${encodeURIComponent(p.id)}`} onClick={() => setShowPlaylistsModal(false)} className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#53ddfc]/20 to-[#ba9eff]/20 flex items-center justify-center border border-white/10">
                          <ListMusic className="w-8 h-8 text-[#53ddfc]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-black text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{p.tracks.length} Tracks • {p.isPublic ? 'Public' : 'Private'}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Create Playlist Modal */}
        <CreatePlaylistModal open={showCreatePlaylistModal} onClose={() => setShowCreatePlaylistModal(false)} />

        {/* Blend Modal */}
        <BlendModal open={showBlendModal} onClose={() => setShowBlendModal(false)} />

        {/* Jam Modal Integration */}
        <JamModal open={showJamModal} onClose={() => setShowJamModal(false)} />

        {isEditingName && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditingName(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#1a1d24] border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-black text-white mb-6 tracking-tight">Edit Profile Details</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 mb-2 block">Your Name</label>
                  <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-[#53ddfc] transition-all" autoFocus />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditingName(false)} className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">Cancel</button>
                  <button onClick={() => { setUserName(tempName); setIsEditingName(false); showToast('Name updated successfully!', 'success'); }} className="flex-1 py-4 rounded-2xl bg-[#53ddfc] hover:bg-[#4bcceb] text-[#0f1218] font-bold transition-all">Save Changes</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isChangingPhoto && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChangingPhoto(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#1a1d24] border border-white/10 p-12 rounded-[2.5rem] w-full max-w-sm text-center">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6"><Camera className="w-10 h-10 text-white/20" /></div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">Update Profile Photo</h3>
              <p className="text-xs text-white/30 font-bold mb-8 tracking-wide">Select a photo from your device</p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
                accept="image/*" 
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-full py-4 rounded-2xl bg-[#53ddfc] text-[#0f1218] font-bold mb-4 shadow-lg shadow-[#53ddfc]/20 uppercase tracking-widest text-[10px]"
              >
                Select File
              </button>
              
              <button 
                onClick={() => { 
                  setProfileImage(null); 
                  localStorage.removeItem('profilePic');
                  setIsChangingPhoto(false); 
                }} 
                className="w-full py-4 rounded-2xl text-white/40 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]"
              >
                Remove current photo
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
