import { Router } from 'express';
import { WebController } from '../controllers/webController.js';

const router = Router();

router.get('/games-view', WebController.gamesView);

export default router;
