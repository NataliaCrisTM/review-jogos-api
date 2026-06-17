import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import {
  validarCriarReview,
  validarAtualizarReview,
  validarIdReview,
  validarGameIdReview,
} from '../middlewares/reviewValidator.js';
import { autenticar } from '../middlewares/authMiddleware.js';
import { autorizar } from '../middlewares/authorizationMiddleware.js';

const router = Router();

// Rota específica ANTES da rota com parâmetro genérico
router.get('/game/:gameId', validarGameIdReview, ReviewController.getByGameId);

router.get('/', ReviewController.getAll);
router.get('/:id', validarIdReview, ReviewController.getById);
router.post('/', autenticar, autorizar('admin', 'user'), validarCriarReview, ReviewController.create);
router.put('/:id', autenticar, autorizar('admin', 'user'), validarAtualizarReview, ReviewController.update);
router.delete('/:id', autenticar, autorizar('admin', 'user'), validarIdReview, ReviewController.delete);

export default router;
