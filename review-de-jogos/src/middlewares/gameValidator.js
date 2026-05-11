import { body, param, validationResult } from 'express-validator';

const STATUS_VALIDOS = ['na fila', 'jogando', 'zerado', 'abandonado'];

export const validar = (req, res, next) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Erro de validação.',
      erros: erros.array().map(e => ({
        campo: e.path,
        mensagem: e.msg,
      })),
    });
  }
  next();
};

const regrasGame = [
  body('titulo')
    .trim()
    .notEmpty().withMessage('O título é obrigatório.')
    .isLength({ min: 2 }).withMessage('O título deve ter no mínimo 2 caracteres.'),

  body('plataforma')
    .trim()
    .notEmpty().withMessage('A plataforma é obrigatória.'),

  body('genero')
    .trim()
    .notEmpty().withMessage('O gênero é obrigatório.'),

  body('status')
    .trim()
    .notEmpty().withMessage('O status é obrigatório.')
    .isIn(STATUS_VALIDOS).withMessage(`O status deve ser um dos seguintes: ${STATUS_VALIDOS.join(', ')}.`),
];

const regraId = [
  param('id')
    .isUUID().withMessage('O id informado não é um UUID válido.'),
];

export const validarCriarGame = [...regrasGame, validar];
export const validarAtualizarGame = [...regraId, ...regrasGame, validar];
export const validarIdGame = [...regraId, validar];
