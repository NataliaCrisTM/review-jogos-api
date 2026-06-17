import jwt from 'jsonwebtoken';

import 'dotenv/config';
const CHAVE_SECRETA = process.env.JWT_SECRET;

export const autenticar = (req, res, next) => {

  // 1. Lê o header "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token não fornecido.',
    });
  }

  // 2. Separa "Bearer" do token em si
  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Formato do token inválido. Use: Bearer <token>',
    });
  }

  const token = partes[1];

  // 3. Verifica assinatura e expiração
  try {
    const payload = jwt.verify(token, CHAVE_SECRETA);

    // 4. Anexa os dados do usuário na requisição
    //    (disponível como req.usuario nos controllers)
    req.usuario = payload;

    next(); // tudo certo → passa para o controller
  } catch (err) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token inválido ou expirado.',
    });
  }

};