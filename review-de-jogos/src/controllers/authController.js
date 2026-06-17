import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';

import 'dotenv/config';
const CHAVE_SECRETA = process.env.JWT_SECRET;
const EXPIRACAO    = process.env.JWT_EXPIRES_IN || '1h';

export class AuthController {

  static async register(req, res, next) {
  try {
    const { login, senha, nome } = req.body;

    // 1. Login já em uso?
    const jaExiste = await userRepository.existsByLogin(login);
    if (jaExiste) {
      return res.status(409).json({ sucesso: false, mensagem: 'Este login já está em uso.' });
    }

    
    const senhaHash = await bcrypt.hash(senha, 10);

    // 3. Role sempre forçada para 'user': ninguém se autopromove a admin
    //    mandando "role": "admin" no corpo da requisição.
    const novoUsuario = await userRepository.create({ login, senha: senhaHash, nome, role: 'user' });

    return res.status(201).json({
      sucesso: true,
      usuario: { id: novoUsuario._id.toString(), login: novoUsuario.login, nome: novoUsuario.nome, role: novoUsuario.role },
    });
  } catch (err) {
    next(err);
  }
}

  static async login(req, res, next) {
    try {
      const { login, senha } = req.body;

      // 1. Verifica se os campos foram enviados
      if (!login || !senha) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Login e senha são obrigatórios.',
        });
      }

      // 2. Busca o usuário no banco
      const usuario = await userRepository.findByLogin(login);
      //console.log('USUARIO ENCONTRADO:', usuario);

      // 3. Verifica se existe e se a senha bate
      const senhaValida = usuario
        ? await bcrypt.compare(senha, usuario.senha)
        : false;
        //console.log('SENHA RECEBIDA:', senha);
        //console.log('SENHA VALIDA:', senhaValida);

      if (!senhaValida) {
        return res.status(401).json({
          sucesso: false,
          mensagem: 'Login ou senha inválidos.',
        });
      }

      // 4. Gera o token com o payload (dados do usuário)
      const payload = {
        userId: usuario._id,
        login:  usuario.login,
        nome:   usuario.nome,
        role: usuario.role,
      };

      const token = jwt.sign(payload, CHAVE_SECRETA, {
        expiresIn: EXPIRACAO,
      });

      // 5. Retorna o token ao cliente
      return res.status(200).json({
        sucesso: true,
        token,
      });

    } catch (err) {
      next(err);
    }
  }

}