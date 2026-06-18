import { Router } from 'express';
import { GameController } from '../controllers/gameController.js';
import {
  validarCriarGame,
  validarAtualizarGame,
  validarIdGame,
} from '../validators/gameValidator.js';
import { autenticar } from '../middlewares/authMiddleware.js';
import { autorizar } from '../middlewares/authorizationMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Lista todos os jogos
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Lista de jogos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 */
router.get('/', GameController.getAll);

/**
 * @swagger
 * /api/games/{id}:
 *   get:
 *     summary: Busca um jogo pelo id
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Jogo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       404:
 *         description: Jogo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', validarIdGame, GameController.getById);

/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Cria um novo jogo (apenas admin)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameInput'
 *     responses:
 *       201:
 *         description: Jogo criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Apenas admin pode criar jogos
 */
router.post('/', autenticar, autorizar('admin'), validarCriarGame, GameController.create);

/**
 * @swagger
 * /api/games/{id}:
 *   put:
 *     summary: Atualiza um jogo (apenas admin)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GameInput'
 *     responses:
 *       200:
 *         description: Jogo atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Apenas admin pode editar jogos
 *       404:
 *         description: Jogo não encontrado
 */
router.put('/:id', autenticar, autorizar('admin'), validarAtualizarGame, GameController.update);

/**
 * @swagger
 * /api/games/{id}:
 *   delete:
 *     summary: Remove um jogo e todas as reviews associadas (apenas admin)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       204:
 *         description: Jogo removido com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Apenas admin pode excluir jogos
 *       404:
 *         description: Jogo não encontrado
 */
router.delete('/:id', autenticar, autorizar('admin'), validarIdGame, GameController.delete);

export default router;