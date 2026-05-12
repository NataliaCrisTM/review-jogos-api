// ═══════════════════════════════════════════════════════════════════════════
//  Estado global
// ═══════════════════════════════════════════════════════════════════════════
const state = {
  games: [],
  reviews: [],
  editandoGameId: null,   // null = criando, string = editando
  editandoReviewId: null,
  reviewGameId: null,     // gameId para a review que está sendo criada/editada
  confirmCallback: null,  // função a chamar ao confirmar delete
};

// ═══════════════════════════════════════════════════════════════════════════
//  Bootstrap
// ═══════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  carregarTudo();

  // Preview ao vivo da nota
  document.getElementById('input-nota').addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    document.getElementById('nota-preview').textContent =
      isNaN(v) ? '—' : `${v} / 10`;
  });

  // Contador de caracteres do comentário
  document.getElementById('input-comentario').addEventListener('input', e => {
    document.getElementById('comentario-hint').textContent =
      `${e.target.value.length} / 500`;
  });

  // Fechar modais com ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharTodosModais();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  Fetch helpers
// ═══════════════════════════════════════════════════════════════════════════
async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  // 204 No Content não tem body
  if (res.status === 204) return null;
  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════
//  Carregar dados
// ═══════════════════════════════════════════════════════════════════════════
async function carregarTudo() {
  mostrarLoading(true);
  try {
    const [games, reviews] = await Promise.all([
      api('GET', '/api/games'),
      api('GET', '/api/reviews'),
    ]);
    state.games = games;
    state.reviews = reviews;
    renderizarGrid();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  } finally {
    mostrarLoading(false);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Renderização
// ═══════════════════════════════════════════════════════════════════════════
function renderizarGrid() {
  const grid = document.getElementById('grid-games');
  const empty = document.getElementById('empty-state');
  const counter = document.getElementById('game-count');

  counter.textContent = state.games.length;

  if (state.games.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = state.games.map(game => {
    const review = state.reviews.find(r => r.gameId === game.id) || null;
    return criarCardHTML(game, review);
  }).join('');
}

function criarCardHTML(game, review) {
  const statusClass = game.status.replace(' ', '-');
  const dataFormatada = new Date(game.dataAdicionado).toLocaleDateString('pt-BR');

  const reviewHTML = review
    ? `
      <div class="review">
        <div class="review__header">
          <span class="review__label">⭐ Review</span>
          <span class="review__nota">Nota: <strong>${review.nota}</strong>/10</span>
        </div>
        <p class="review__comentario">${escapeHtml(review.comentario)}</p>
        <div class="review__meta">
          <span>🕐 ${review.horasJogadas}h jogadas</span>
          <span>📅 ${new Date(review.dataCriacao).toLocaleDateString('pt-BR')}</span>
        </div>
        <div class="review__actions">
          <button class="btn btn--xs btn--ghost" onclick="abrirModalEditarReview('${review.id}')">✏️ Editar</button>
          <button class="btn btn--xs btn--danger-ghost" onclick="confirmarDelete('review','${review.id}','${escapeHtml(game.titulo)}')">🗑️ Excluir</button>
        </div>
      </div>`
    : `
      <div class="no-review">
        <span class="no-review__icon">📝</span>
        <p class="no-review__text">Sem review ainda.</p>
        <button class="btn btn--xs btn--outline" onclick="abrirModalNovaReview('${game.id}','${escapeHtml(game.titulo)}')">+ Adicionar review</button>
      </div>`;

  return `
    <article class="card" id="card-${game.id}">
      <header class="card__header">
        <div class="card__badges">
          <span class="badge badge--platform">${escapeHtml(game.plataforma)}</span>
          <span class="badge badge--genre">${escapeHtml(game.genero)}</span>
        </div>
        <span class="card__status card__status--${statusClass}">${game.status}</span>
      </header>

      <div class="card__body">
        <h2 class="card__title">${escapeHtml(game.titulo)}</h2>
        <p class="card__date">Adicionado em ${dataFormatada}</p>
      </div>

      <div class="card__game-actions">
        <button class="btn btn--xs btn--ghost" onclick="abrirModalEditarGame('${game.id}')">✏️ Editar</button>
        <button class="btn btn--xs btn--danger-ghost" onclick="confirmarDelete('game','${game.id}','${escapeHtml(game.titulo)}')">🗑️ Excluir</button>
      </div>

      <footer class="card__footer">
        ${reviewHTML}
      </footer>
    </article>`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Modal — Game
// ═══════════════════════════════════════════════════════════════════════════
function abrirModalGame() {
  state.editandoGameId = null;
  document.getElementById('modal-game-titulo').textContent = 'Novo Jogo';
  document.getElementById('btn-salvar-game').textContent = 'Salvar';
  limparFormGame();
  abrirModal('modal-game');
}

function abrirModalEditarGame(id) {
  const game = state.games.find(g => g.id === id);
  if (!game) return;

  state.editandoGameId = id;
  document.getElementById('modal-game-titulo').textContent = 'Editar Jogo';
  document.getElementById('btn-salvar-game').textContent = 'Atualizar';
  limparFormGame();

  document.getElementById('input-titulo').value = game.titulo;
  document.getElementById('input-plataforma').value = game.plataforma;
  document.getElementById('input-genero').value = game.genero;
  document.getElementById('input-status').value = game.status;

  abrirModal('modal-game');
}

async function salvarGame() {
  limparErrosGame();

  const titulo = document.getElementById('input-titulo').value.trim();
  const plataforma = document.getElementById('input-plataforma').value.trim();
  const genero = document.getElementById('input-genero').value.trim();
  const status = document.getElementById('input-status').value;

  let valido = true;
  if (titulo.length < 2) { mostrarErro('erro-titulo', 'Mínimo 2 caracteres.'); valido = false; }
  if (!plataforma)        { mostrarErro('erro-plataforma', 'Plataforma obrigatória.'); valido = false; }
  if (!genero)            { mostrarErro('erro-genero', 'Gênero obrigatório.'); valido = false; }
  if (!valido) return;

  const btn = document.getElementById('btn-salvar-game');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    const body = { titulo, plataforma, genero, status };

    if (state.editandoGameId) {
      const res = await api('PUT', `/api/games/${state.editandoGameId}`, body);
      if (res.sucesso === false) { mostrarErro('erro-game-global', res.mensagem); return; }
      const idx = state.games.findIndex(g => g.id === state.editandoGameId);
      if (idx !== -1) state.games[idx] = res;
    } else {
      const res = await api('POST', '/api/games', body);
      if (res.sucesso === false) { mostrarErro('erro-game-global', res.mensagem); return; }
      state.games.push(res);
    }

    fecharModal('modal-game');
    renderizarGrid();
  } catch (err) {
    mostrarErro('erro-game-global', 'Erro de conexão. Tente novamente.');
  } finally {
    btn.disabled = false;
    btn.textContent = state.editandoGameId ? 'Atualizar' : 'Salvar';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Modal — Review
// ═══════════════════════════════════════════════════════════════════════════
function abrirModalNovaReview(gameId, gameTitulo) {
  state.editandoReviewId = null;
  state.reviewGameId = gameId;
  document.getElementById('modal-review-titulo').textContent = 'Nova Review';
  document.getElementById('btn-salvar-review').textContent = 'Salvar';
  document.getElementById('review-game-nome').textContent = gameTitulo;
  limparFormReview();
  abrirModal('modal-review');
}

function abrirModalEditarReview(reviewId) {
  const review = state.reviews.find(r => r.id === reviewId);
  if (!review) return;
  const game = state.games.find(g => g.id === review.gameId);

  state.editandoReviewId = reviewId;
  state.reviewGameId = review.gameId;
  document.getElementById('modal-review-titulo').textContent = 'Editar Review';
  document.getElementById('btn-salvar-review').textContent = 'Atualizar';
  document.getElementById('review-game-nome').textContent = game ? game.titulo : '—';
  limparFormReview();

  document.getElementById('input-nota').value = review.nota;
  document.getElementById('nota-preview').textContent = `${review.nota} / 10`;
  document.getElementById('input-comentario').value = review.comentario;
  document.getElementById('comentario-hint').textContent = `${review.comentario.length} / 500`;
  document.getElementById('input-horas').value = review.horasJogadas;

  abrirModal('modal-review');
}

async function salvarReview() {
  limparErrosReview();

  const nota = parseFloat(document.getElementById('input-nota').value);
  const comentario = document.getElementById('input-comentario').value.trim();
  const horasJogadas = parseFloat(document.getElementById('input-horas').value);

  let valido = true;
  if (isNaN(nota) || nota < 0 || nota > 10) { mostrarErro('erro-nota', 'Nota entre 0 e 10.'); valido = false; }
  if (comentario.length < 10)               { mostrarErro('erro-comentario', 'Mínimo 10 caracteres.'); valido = false; }
  if (isNaN(horasJogadas) || horasJogadas < 0) { mostrarErro('erro-horas', 'Informe as horas jogadas.'); valido = false; }
  if (!valido) return;

  const btn = document.getElementById('btn-salvar-review');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    let res;
    if (state.editandoReviewId) {
      res = await api('PUT', `/api/reviews/${state.editandoReviewId}`, { nota, comentario, horasJogadas });
      if (res.sucesso === false) { mostrarErro('erro-review-global', res.mensagem); return; }
      const idx = state.reviews.findIndex(r => r.id === state.editandoReviewId);
      if (idx !== -1) state.reviews[idx] = res;
    } else {
      res = await api('POST', '/api/reviews', { gameId: state.reviewGameId, nota, comentario, horasJogadas });
      if (res.sucesso === false) { mostrarErro('erro-review-global', res.mensagem); return; }
      state.reviews.push(res);
    }

    fecharModal('modal-review');
    renderizarGrid();
  } catch (err) {
    mostrarErro('erro-review-global', 'Erro de conexão. Tente novamente.');
  } finally {
    btn.disabled = false;
    btn.textContent = state.editandoReviewId ? 'Atualizar' : 'Salvar';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Confirmação de delete
// ═══════════════════════════════════════════════════════════════════════════
function confirmarDelete(tipo, id, nome) {
  const msg = tipo === 'game'
    ? `Excluir o jogo "${nome}"? A review associada também será removida.`
    : `Excluir a review de "${nome}"?`;

  document.getElementById('confirm-msg').textContent = msg;

  state.confirmCallback = async () => {
    const btnConfirm = document.getElementById('btn-confirm-delete');
    btnConfirm.disabled = true;
    btnConfirm.textContent = 'Excluindo...';

    try {
      await api('DELETE', tipo === 'game' ? `/api/games/${id}` : `/api/reviews/${id}`);

      if (tipo === 'game') {
        state.games = state.games.filter(g => g.id !== id);
        state.reviews = state.reviews.filter(r => r.gameId !== id);
      } else {
        state.reviews = state.reviews.filter(r => r.id !== id);
      }

      fecharModal('modal-confirm');
      renderizarGrid();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    } finally {
      btnConfirm.disabled = false;
      btnConfirm.textContent = 'Confirmar';
    }
  };

  document.getElementById('btn-confirm-delete').onclick = state.confirmCallback;
  abrirModal('modal-confirm');
}

// ═══════════════════════════════════════════════════════════════════════════
//  Utilitários de modal
// ═══════════════════════════════════════════════════════════════════════════
function abrirModal(id) {
  document.getElementById(id).classList.add('modal-overlay--active');
  document.body.style.overflow = 'hidden';
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('modal-overlay--active');
  document.body.style.overflow = '';
}

function fecharTodosModais() {
  document.querySelectorAll('.modal-overlay--active').forEach(m => {
    m.classList.remove('modal-overlay--active');
  });
  document.body.style.overflow = '';
}

function fecharSeOverlay(event, id) {
  if (event.target.id === id) fecharModal(id);
}

// ═══════════════════════════════════════════════════════════════════════════
//  Utilitários de formulário
// ═══════════════════════════════════════════════════════════════════════════
function limparFormGame() {
  ['input-titulo', 'input-plataforma', 'input-genero'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('input-status').value = 'na fila';
  limparErrosGame();
}

function limparFormReview() {
  ['input-nota', 'input-comentario', 'input-horas'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('nota-preview').textContent = '—';
  document.getElementById('comentario-hint').textContent = '0 / 500';
  limparErrosReview();
}

function limparErrosGame() {
  ['erro-titulo', 'erro-plataforma', 'erro-genero', 'erro-game-global'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

function limparErrosReview() {
  ['erro-nota', 'erro-comentario', 'erro-horas', 'erro-review-global'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

function mostrarErro(id, msg) {
  document.getElementById(id).textContent = msg;
}

function mostrarLoading(visivel) {
  document.getElementById('loading-state').style.display = visivel ? 'flex' : 'none';
  document.getElementById('grid-games').style.display = visivel ? 'none' : 'grid';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}