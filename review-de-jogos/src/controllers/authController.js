import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';

const CHAVE_SECRETA = 'minha_chave_super_secreta_jwt';
const EXPIRACAO    = '1h';

export class AuthController {

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
      const usuario = userRepository.findByLogin(login);

      // 3. Verifica se existe e se a senha bate
      const senhaValida = usuario
        ? await bcrypt.compare(senha, usuario.senha)
        : false;

      if (!senhaValida) {
        return res.status(401).json({
          sucesso: false,
          mensagem: 'Login ou senha inválidos.',
        });
      }

      // 4. Gera o token com o payload (dados do usuário)
      const payload = {
        userId: usuario.id,
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