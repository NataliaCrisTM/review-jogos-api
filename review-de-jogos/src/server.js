import app from './app.js';

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🎮 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Página de jogos: http://localhost:${PORT}/games-view`);
  console.log(`🔌 API Games:   http://localhost:${PORT}/api/games`);
  console.log(`🔌 API Reviews: http://localhost:${PORT}/api/reviews`);
});
