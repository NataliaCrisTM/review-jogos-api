import { body, validationResult } from 'express-validator';

export const validar = (req, res, next) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Erro de validação.',
      erros: erros.array().map(e => ({ campo: e.path, mensagem: e.msg })),
    });
  }
  next();
};

const regrasRegistro = [
  body('login').trim().notEmpty().withMessage('O login é obrigatório.')
    .isLength({ min: 3 }).withMessage('O login deve ter no mínimo 3 caracteres.'),
  body('senha').notEmpty().withMessage('A senha é obrigatória.')
    .isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
  body('nome').trim().notEmpty().withMessage('O nome é obrigatório.'),
];

export const validarRegistro = [...regrasRegistro, validar];