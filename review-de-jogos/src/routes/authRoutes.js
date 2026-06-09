import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';

const router = Router();

// Única rota: POST /api/auth/login
router.post('/login', AuthController.login);

export default router;