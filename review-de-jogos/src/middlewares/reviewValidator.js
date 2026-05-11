import { body, param, validationResult } from 'express-validator';

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

const regrasReview = [
  body('gameId')
    .trim()
    .notEmpty().withMessage('O gameId é obrigatório.')
    .isUUID().withMessage('O gameId deve ser um UUID válido.'),

  body('nota')
    .notEmpty().withMessage('A nota é obrigatória.')
    .isFloat({ min: 0, max: 10 }).withMessage('A nota deve ser um número entre 0 e 10.'),

  body('comentario')
    .trim()
    .notEmpty().withMessage('O comentário é obrigatório.')
    .isLength({ min: 10 }).withMessage('O comentário deve ter no mínimo 10 caracteres.'),

  body('horasJogadas')
    .notEmpty().withMessage('As horas jogadas são obrigatórias.')
    .isFloat({ min: 0 }).withMessage('As horas jogadas devem ser um número maior ou igual a 0.'),
];

const regrasAtualizarReview = [
  body('nota')
    .notEmpty().withMessage('A nota é obrigatória.')
    .isFloat({ min: 0, max: 10 }).withMessage('A nota deve ser um número entre 0 e 10.'),

  body('comentario')
    .trim()
    .notEmpty().withMessage('O comentário é obrigatório.')
    .isLength({ min: 10 }).withMessage('O comentário deve ter no mínimo 10 caracteres.'),

  body('horasJogadas')
    .notEmpty().withMessage('As horas jogadas são obrigatórias.')
    .isFloat({ min: 0 }).withMessage('As horas jogadas devem ser um número maior ou igual a 0.'),
];

const regraId = [
  param('id')
    .isUUID().withMessage('O id informado não é um UUID válido.'),
];

const regraGameId = [
  param('gameId')
    .isUUID().withMessage('O gameId informado não é um UUID válido.'),
];

export const validarCriarReview = [...regrasReview, validar];
export const validarAtualizarReview = [...regraId, ...regrasAtualizarReview, validar];
export const validarIdReview = [...regraId, validar];
export const validarGameIdReview = [...regraGameId, validar];
