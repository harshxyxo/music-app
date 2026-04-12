import { Request, Response } from 'express';
import { prisma } from '@groovra/database';

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { track, userEmail, userName } = req.body;

    if (!track || !userEmail) {
      return res.status(400).json({ error: 'Missing track or user email' });
    }

    // 1. Sync User from Firebase
    let user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          username: userName ? userName.replace(/\s+/g, '').toLowerCase() : userEmail.split('@')[0],
          password: 'oauth_placeholder', // Firebase handles real auth
        }
      });
    }

    // 2. Ensure dependencies (Artist, Album) for the isolated Track
    const artistName = track.artist || 'Unknown Artist';
    let artist = await prisma.artist.findFirst({ where: { name: artistName } });
    if (!artist) {
      artist = await prisma.artist.create({ data: { name: artistName } });
    }

    let album = await prisma.album.findFirst({ where: { title: 'Unknown Album', artistId: artist.id } });
    if (!album) {
      album = await prisma.album.create({ 
        data: { title: 'Unknown Album', artistId: artist.id, releaseDate: new Date() } 
      });
    }

    // 3. Upsert Track
    let trackRecord = await prisma.track.findUnique({ where: { id: track.id.toString() } });
    if (!trackRecord) {
      trackRecord = await prisma.track.create({
        data: {
          id: track.id.toString(),
          title: track.title,
          audioUrl: track.audioUrl,
          durationMs: 200000, // placeholder
          albumId: album.id,
          artistId: artist.id,
        }
      });
    }

    // 4. Toggle the Like
    const existingLike = await prisma.userLike.findUnique({
      where: {
        userId_trackId: {
          userId: user.id,
          trackId: trackRecord.id,
        }
      }
    });

    if (existingLike) {
      await prisma.userLike.delete({ where: { id: existingLike.id } });
      return res.json({ message: 'Track unliked', liked: false });
    } else {
      await prisma.userLike.create({
        data: {
          userId: user.id,
          trackId: trackRecord.id,
        }
      });
      return res.json({ message: 'Track liked', liked: true });
    }

  } catch (error) {
    console.error('Toggle Like Error:', error);
    res.status(500).json({ error: 'Internal server error while syncing likes' });
  }
};
