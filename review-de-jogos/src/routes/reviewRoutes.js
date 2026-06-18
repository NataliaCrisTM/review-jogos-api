import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import {
  validarCriarReview,
  validarAtualizarReview,
  validarIdReview,
  validarGameIdReview,
} from '../validators/reviewValidator.js';
import { autenticar } from '../middlewares/authMiddleware.js';
import { autorizar } from '../middlewares/authorizationMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/reviews/game/{gameId}:
 *   get:
 *     summary: Lista todas as reviews de um jogo específico
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Lista de reviews do jogo (uma por usuário que avaliou)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       404:
 *         description: Jogo não encontrado
 */
router.get('/game/:gameId', validarGameIdReview, ReviewController.getByGameId);

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Lista todas as reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Lista de reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/', ReviewController.getAll);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Busca uma review pelo id
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f7a8b9c0d2
 *     responses:
 *       200:
 *         description: Review encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       404:
 *         description: Review não encontrada
 */
router.get('/:id', validarIdReview, ReviewController.getById);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Cria uma review (um usuário só pode avaliar o mesmo jogo uma vez)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: Review criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       401:
 *         description: Token não fornecido ou inválido
 *       404:
 *         description: Jogo não encontrado
 *       409:
 *         description: Usuário já avaliou esse jogo
 */
router.post('/', autenticar, autorizar('admin', 'user'), validarCriarReview, ReviewController.create);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Atualiza uma review (apenas o autor ou um admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f7a8b9c0d2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewUpdateInput'
 *     responses:
 *       200:
 *         description: Review atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Você só pode editar as suas próprias reviews
 *       404:
 *         description: Review não encontrada
 */
router.put('/:id', autenticar, autorizar('admin', 'user'), validarAtualizarReview, ReviewController.update);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Remove uma review (apenas o autor ou um admin)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64f1a2b3c4d5e6f7a8b9c0d2
 *     responses:
 *       204:
 *         description: Review removida com sucesso
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Você só pode excluir as suas próprias reviews
 *       404:
 *         description: Review não encontrada
 */
router.delete('/:id', autenticar, autorizar('admin', 'user'), validarIdReview, ReviewController.delete);

export default router;