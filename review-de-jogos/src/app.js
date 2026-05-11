import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import gameRoutes from './routes/gameRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import webRoutes from './routes/webRoutes.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ─── Arquivos estáticos ────────────────────────────────────────────────────────
app.use(express.static(join(__dirname, '../public')));

// ─── Parsers ──────────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Template engine ──────────────────────────────────────────────────────────
app.set('view engine', 'pug');
app.set('views', join(__dirname, './views'));

// ─── Middleware de log ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Rotas da API ─────────────────────────────────────────────────────────────
app.use('/api/games', gameRoutes);
app.use('/api/reviews', reviewRoutes);

// ─── Rotas Web ────────────────────────────────────────────────────────────────
app.use('/', webRoutes);

// ─── Rota 404 ─────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ sucesso: false, mensagem: 'Rota não encontrada.' });
});

// ─── Middleware de erro centralizado ─────────────────────────────────────────
app.use(errorMiddleware);

export default app;
