import { Router } from 'express';
import { validarRegistro } from '../validators/authValidator.js';
import { AuthController } from '../controllers/authController.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Cria uma nova conta de usuário (role sempre "user")
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro de validação
 *       409:
 *         description: Login já está em uso
 */
router.post('/register', validarRegistro, AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Login e senha são obrigatórios
 *       401:
 *         description: Login ou senha inválidos
 */
router.post('/login', AuthController.login);

export default router;