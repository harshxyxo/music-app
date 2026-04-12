import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generatePresignedUploadUrl } from '../services/s3.service';
import { prisma } from '@groovra/database';

/**
 * Generates an AWS S3 presigned URL preventing server bottlenecks during file transit
 */
export const getUploadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'Missing fileName or fileType params' });
    }

    // Ensuring unique file identifiers prevents bucket overlaps
    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    
    // Abstracting secure AWS implementation to our injected S3 service SDK script
    const uploadUrl = await generatePresignedUploadUrl(uniqueFileName, fileType);
    
    res.json({
      uploadUrl,
      fileKey: uniqueFileName,
      message: 'Use this URL to execute your raw binary PUT upload from the client',
    });
  } catch (error) {
    console.error('S3 Upload URL Error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};

/**
 * Maps the permanent metadata into our postgres Prisma schema post-upload.
 */
export const createTrack = async (req: AuthRequest, res: Response) => {
  try {
    const { title, durationMs, audioUrl, albumId, artistId } = req.body;

    // Strict validation mapping against Prisma null constraints
    if (!title || !audioUrl || !albumId || !artistId) {
      return res.status(400).json({ error: 'Missing mandatory track metadata params' });
    }

    // Persist verified object logic directly returning generated id
    const track = await prisma.track.create({
      data: {
        title,
        durationMs: durationMs || 0,
        audioUrl,
        albumId,
        artistId,
      },
    });

    res.status(201).json({ message: 'Track metadata registered successfully', track });
  } catch (error) {
    console.error('Track Creation Meta Error:', error);
    res.status(500).json({ error: 'Failed to record track metadata into database' });
  }
};

/**
 * Standard relational GET pipeline resolving track, artist, and nested album covers globally.
 */
export const getTracks = async (req: AuthRequest, res: Response) => {
  try {
    const tracks = await prisma.track.findMany({
      include: {
        artist: { select: { id: true, name: true, image: true } },
        album: { select: { id: true, title: true, coverImage: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Standard pagination cutoff point scaling
    });

    res.json({ tracks });
  } catch (error) {
    console.error('Fetch Tracks Graph Error:', error);
    res.status(500).json({ error: 'Failed retrieving stream graphs across network' });
  }
};
