import { Router } from 'express';
import { validarRegistro } from '../validators/authValidator.js';
import { AuthController } from '../controllers/authController.js';

const router = Router();

router.post('/register', validarRegistro, AuthController.register);
router.post('/login', AuthController.login);

export default router;