export const errorMiddleware = (err, req, res, next) => {
  console.error('ERRO DETECTADO');
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.error('Mensagem:', err.message);
  console.error('Stack:', err.stack);
  console.error('──────────────────────────────────────────────────');

  const status = err.statusCode || 500;
  const mensagem = err.statusCode
    ? err.message
    : 'Ocorreu um erro interno no servidor.';

  res.status(status).json({ sucesso: false, mensagem });
};
