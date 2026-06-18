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

router.get('/', GameController.getAll);
router.get('/:id', validarIdGame, GameController.getById);
router.post('/', autenticar, autorizar('admin'), validarCriarGame, GameController.create);
router.put('/:id', autenticar, autorizar('admin'), validarAtualizarGame, GameController.update);
router.delete('/:id', autenticar, autorizar('admin'), validarIdGame, GameController.delete);

export default router;
