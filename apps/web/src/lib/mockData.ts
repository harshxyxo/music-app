import { Track } from '../store/usePlayerStore';

export interface Artist {
  id: string;
  name: string;
  image: string;
  monthlyListeners: string;
  bio?: string;
  verified: boolean;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverImage: string;
  releaseYear: string;
  tracks: string[]; // Track IDs
}

export const artists: Artist[] = [
  {
    id: 'karan-aujla',
    name: 'Karan Aujla',
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&h=800&fit=crop',
    monthlyListeners: '25,432,109',
    verified: true,
  },
  {
    id: 'diljit-dosanjh',
    name: 'Diljit Dosanjh',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=800&fit=crop',
    monthlyListeners: '18,902,341',
    verified: true,
  },
  {
    id: 'sidhu-moosewala',
    name: 'Sidhu Moose Wala',
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800&h=800&fit=crop',
    monthlyListeners: '15,234,890',
    verified: true,
  },
  {
    id: 'ap-dhillon',
    name: 'AP Dhillon',
    image: 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?w=800&h=800&fit=crop',
    monthlyListeners: '12,456,789',
    verified: true,
  },
  {
    id: 'shubh',
    name: 'Shubh',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop',
    monthlyListeners: '10,123,456',
    verified: true,
  }
];

export const albums: Album[] = [
  {
    id: 'making-memories',
    title: 'Making Memories',
    artistId: 'karan-aujla',
    artistName: 'Karan Aujla',
    coverImage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&h=800&fit=crop',
    releaseYear: '2023',
    tracks: ['softly', 'admiring-you', 'bachke-bachke']
  },
  {
    id: 'ghost',
    title: 'Ghost',
    artistId: 'diljit-dosanjh',
    artistName: 'Diljit Dosanjh',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=800&fit=crop',
    releaseYear: '2024',
    tracks: ['case', 'lemonade']
  },
  {
    id: 'two-as-aside',
    title: 'Two As Aside',
    artistId: 'ap-dhillon',
    artistName: 'AP Dhillon',
    coverImage: 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?w=800&h=800&fit=crop',
    releaseYear: '2022',
    tracks: ['excuses', 'insane']
  }
];

export const tracks: (Track & { artistId: string; albumId: string })[] = [
  {
    id: 'softly',
    title: 'Softly',
    artist: 'Karan Aujla',
    artistId: 'karan-aujla',
    albumId: 'making-memories',
    coverImage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&h=800&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'admiring-you',
    title: 'Admiring You',
    artist: 'Karan Aujla',
    artistId: 'karan-aujla',
    albumId: 'making-memories',
    coverImage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&h=800&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'bachke-bachke',
    title: 'Bachke Bachke',
    artist: 'Karan Aujla',
    artistId: 'karan-aujla',
    albumId: 'making-memories',
    coverImage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&h=800&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'case',
    title: 'Case',
    artist: 'Diljit Dosanjh',
    artistId: 'diljit-dosanjh',
    albumId: 'ghost',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=800&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 'excuses',
    title: 'Excuses',
    artist: 'AP Dhillon',
    artistId: 'ap-dhillon',
    albumId: 'two-as-aside',
    coverImage: 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?w=800&h=800&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: 'cheques',
    title: 'Cheques',
    artist: 'Shubh',
    artistId: 'shubh',
    albumId: 'still-rollin',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=800&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  }
];
