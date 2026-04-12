import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ENV } from '../config/env';

// Initialize S3 Client using AWS SDK V3
const s3Client = new S3Client({
  region: ENV.AWS_REGION,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generates a pre-signed URL for direct-to-S3 uploads from the client browser/app.
 * This is the modern, highly scalable approach to file uploads, preventing our backend node server 
 * from bottlenecks processing heavy MP3 streams internally.
 */
export const generatePresignedUploadUrl = async (fileName: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: ENV.S3_BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  });

  try {
    // Generate an expiring URL (5 minutes) mapping exactly to the secure PUT command 
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    return uploadUrl;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw new Error('Could not generate secure S3 upload URL');
  }
};
