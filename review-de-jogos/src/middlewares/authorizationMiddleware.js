export const autorizar = (...rolesPermitidos) => {
  return (req, res, next) => {

    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Não autenticado.',
      });
    }

    if (!rolesPermitidos.includes(usuario.role)) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado. Permissões insuficientes.',
      });
    }

    next();
  };
};