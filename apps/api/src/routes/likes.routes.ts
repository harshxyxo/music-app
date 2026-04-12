import { Router } from 'express';
import { toggleLike } from '../controllers/likes.controller';

const router = Router();

router.post('/toggle', toggleLike);

export default router;
