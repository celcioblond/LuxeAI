import express from 'express';
import { getRecommendations } from '../controllers/recommendation.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getRecommendations);

export default router;
