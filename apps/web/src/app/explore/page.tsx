'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import BackButton from '../../components/BackButton';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function ExplorePage() {
  const categories = [
    { title: 'Bollywood', query: 'Bollywood top hits', gradient: 'from-[#ff4b2b] to-[#ff416c]', image: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?w=400&h=400&fit=crop' },
    { title: 'Punjabi', query: 'Punjabi top songs', gradient: 'from-[#8e2de2] to-[#4a00e0]', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' },
    { title: 'Haryanvi', query: 'Haryanvi top songs', gradient: 'from-[#f2994a] to-[#f2c94c]', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop' },
    { title: 'Pop', query: 'top pop songs', gradient: 'from-[#00c6ff] to-[#0072ff]', image: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=400&h=400&fit=crop' },
    { title: 'Rock', query: 'rock songs popular', gradient: 'from-[#0f0c29] via-[#302b63] to-[#24243e]', image: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=400&h=400&fit=crop' },
    { title: 'Lo-Fi', query: 'lofi chill beats', gradient: 'from-[#a8ff78] to-[#78ffd6]', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop' },
    { title: 'Romantic', query: 'romantic songs new', gradient: 'from-[#ee0979] to-[#ff6a00]', image: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&h=400&fit=crop' },
    { title: 'Indie', query: 'Indie music popular', gradient: 'from-[#11998e] to-[#38ef7d]', image: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=400&h=400&fit=crop' },
    { title: 'Trending', query: 'trending songs', gradient: 'from-[#fc466b] to-[#3f5efb]', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop' },
    { title: 'EDM', query: 'EDM party songs', gradient: 'from-[#00b09b] to-[#96c93d]', image: 'https://images.unsplash.com/photo-1574433232643-d1f03eb7a771?w=400&h=400&fit=crop' },
    { title: 'Hip Hop', query: 'hip hop rap songs', gradient: 'from-[#f7971e] to-[#ffd200]', image: 'https://images.unsplash.com/photo-1508919892415-7798782d8c30?w=400&h=400&fit=crop' },
    { title: 'Classics', query: '90s bollywood romantic songs', gradient: 'from-[#eecda3] to-[#ef629f]', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop' },
  ];

  return (
    <div 
      className="h-full overflow-y-auto custom-scrollbar p-10 pb-32 outline-none"
      tabIndex={0}
      onMouseEnter={(e) => e.currentTarget.focus()}
    >
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex items-start gap-6">
        <BackButton />
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2">Explore</h1>
          <p className="text-[#888888] text-sm font-bold uppercase tracking-[0.3em]">Discover your next obsession</p>
        </div>
      </motion.div>
      
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((c, i) => (
          <motion.div key={i} variants={fadeUp}>
            <Link href={`/playlist/${encodeURIComponent(c.query)}`} className="block group">
              <div className={`aspect-[4/5] rounded-[2.5rem] p-8 relative overflow-hidden bg-gradient-to-br ${c.gradient} shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 active:scale-95 border border-white/10`}>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <h3 className="text-3xl font-black text-white leading-none tracking-tighter w-1/2">{c.title}</h3>
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <Play className="w-5 h-5 text-white fill-white ml-1" />
                  </div>
                </div>
                
                {/* Tilted cropped image */}
                <div className="absolute right-[-15%] bottom-[-10%] w-[180px] h-[180px] rounded-[2rem] overflow-hidden rotate-[25deg] shadow-2xl transition-transform duration-700 group-hover:rotate-[15deg] group-hover:scale-110 border-4 border-white/10">
                  <img src={c.image} className="w-full h-full object-cover" alt="" />
                </div>
                
                {/* Glassy overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

