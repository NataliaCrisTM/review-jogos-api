import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import {
  validarCriarReview,
  validarAtualizarReview,
  validarIdReview,
  validarGameIdReview,
} from '../middlewares/reviewValidator.js';
import { autenticar } from '../middlewares/authMiddleware.js';

const router = Router();

// Rota específica ANTES da rota com parâmetro genérico
router.get('/game/:gameId', validarGameIdReview, ReviewController.getByGameId);

router.get('/', ReviewController.getAll);
router.get('/:id', validarIdReview, ReviewController.getById);
router.post('/', autenticar, validarCriarReview, ReviewController.create);
router.put('/:id', autenticar, validarAtualizarReview, ReviewController.update);
router.delete('/:id', autenticar, validarIdReview, ReviewController.delete);

export default router;
