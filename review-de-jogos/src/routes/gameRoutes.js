import { Router } from 'express';
import { GameController } from '../controllers/gameController.js';
import {
  validarCriarGame,
  validarAtualizarGame,
  validarIdGame,
} from '../middlewares/gameValidator.js';
import { autenticar } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', GameController.getAll);
router.get('/:id', validarIdGame, GameController.getById);
router.post('/', autenticar, validarCriarGame, GameController.create);
router.put('/:id', autenticar, validarAtualizarGame, GameController.update);
router.delete('/:id', autenticar, validarIdGame, GameController.delete);

export default router;
