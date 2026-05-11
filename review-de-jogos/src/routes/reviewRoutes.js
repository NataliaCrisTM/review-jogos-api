import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import {
  validarCriarReview,
  validarAtualizarReview,
  validarIdReview,
  validarGameIdReview,
} from '../middlewares/reviewValidator.js';

const router = Router();

// Rota específica ANTES da rota com parâmetro genérico
router.get('/game/:gameId', validarGameIdReview, ReviewController.getByGameId);

router.get('/', ReviewController.getAll);
router.get('/:id', validarIdReview, ReviewController.getById);
router.post('/', validarCriarReview, ReviewController.create);
router.put('/:id', validarAtualizarReview, ReviewController.update);
router.delete('/:id', validarIdReview, ReviewController.delete);

export default router;
