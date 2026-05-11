import { Router } from 'express';
import { GameController } from '../controllers/gameController.js';
import {
  validarCriarGame,
  validarAtualizarGame,
  validarIdGame,
} from '../middlewares/gameValidator.js';

const router = Router();

router.get('/', GameController.getAll);
router.get('/:id', validarIdGame, GameController.getById);
router.post('/', validarCriarGame, GameController.create);
router.put('/:id', validarAtualizarGame, GameController.update);
router.delete('/:id', validarIdGame, GameController.delete);

export default router;
