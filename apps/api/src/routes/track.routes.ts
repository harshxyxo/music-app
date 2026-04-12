import { Router } from 'express';
import { getUploadUrl, createTrack, getTracks } from '../controllers/track.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Apply JWT verification middleware protecting all core track manipulation interactions
router.use(requireAuth);

router.post('/upload-url', getUploadUrl);
router.post('/', createTrack);
router.get('/', getTracks);

export default router;
