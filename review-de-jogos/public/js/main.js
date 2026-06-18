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
  atualizarAuthUI();
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
//  Autenticação
// ═══════════════════════════════════════════════════════════════════════════
function decodeBase64Url(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  return base64;
}

function getUsuarioLogado() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payloadBase64 = decodeBase64Url(token.split('.')[1]);
    // decodeURIComponent + escape garante que acentos (UTF-8) sejam lidos corretamente
    const jsonPayload = decodeURIComponent(
      atob(payloadBase64)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erro ao decodificar token do usuário:', e);
    return null;
  }
}

function atualizarAuthUI() {
  const usuario = getUsuarioLogado();
  const area = document.getElementById('auth-status');
  if (usuario) {
    area.innerHTML = `
      <span class="auth-status__nome">${escapeHtml(usuario.nome)} <em>(${usuario.role})</em></span>
      <button class="btn btn--xs btn--ghost" onclick="fazerLogout()">Sair</button>`;
  } else {
    area.innerHTML = `<button class="btn btn--xs btn--outline" onclick="abrirModalLogin()">Entrar</button>`;
  }
}

function abrirModalLogin() {
  document.getElementById('input-login').value = '';
  document.getElementById('input-senha').value = '';
  document.getElementById('erro-login-global').textContent = '';
  abrirModal('modal-login');
}

async function fazerLogin() {
  const login = document.getElementById('input-login').value.trim();
  const senha = document.getElementById('input-senha').value;
  const erro = document.getElementById('erro-login-global');
  erro.textContent = '';

  if (!login || !senha) {
    erro.textContent = 'Informe login e senha.';
    return;
  }

  const btn = document.getElementById('btn-fazer-login');
  btn.disabled = true;
  btn.textContent = 'Entrando...';

  try {
    const res = await api('POST', '/api/auth/login', { login, senha });
    localStorage.setItem('token', res.token);
    fecharModal('modal-login');
    atualizarAuthUI();
    renderizarGrid();
  } catch (err) {
    erro.textContent = err.message || 'Login ou senha inválidos.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

function fazerLogout() {
  localStorage.removeItem('token');
  atualizarAuthUI();
  renderizarGrid();
}
// ═══════════════════════════════════════════════════════════════════════════
//  Fetch helpers
// ═══════════════════════════════════════════════════════════════════════════
async function api(method, path, body) {
  // Busca o token salvo no navegador
  const token = localStorage.getItem('token');

  const opts = {
    method,
    headers: { 
      'Content-Type': 'application/json' 
    },
  };

  // Se houver um token salvo, anexa no cabeçalho requisitado pelo authMiddleware.js
  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) opts.body = JSON.stringify(body);
  
  const res = await fetch(path, opts);
  
  // 204 No Content não tem body
  if (res.status === 204) return null;

  // Trata respostas de erro do servidor (como 401 ou 403) que retornam JSON estruturado
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.mensagem || `Erro na requisição: ${res.status}`);
  }

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
const carrosselReview = {};

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

  
  const usuarioLogado = getUsuarioLogado();

  grid.innerHTML = state.games.map(game => {
    // Busca TODAS as reviews associadas a este jogo específico
    const gId = game.id || game._id;
    const reviewsDoJogo = state.reviews.filter(r => r.gameId === gId);
    
    // Inicializa o controle do carrossel se ele ainda não existir para este jogo
    if (carrosselReview[gId] === undefined) {
      carrosselReview[gId] = 0;
    }

    return criarCardHTML(game, reviewsDoJogo, usuarioLogado);
  }).join('');
}

function criarCardHTML(game, reviews, usuarioLogado) {
  const gId = game.id || game._id;
  const statusClass = game.status.replace(' ', '-');
  const dataFormatada = new Date(game.dataAdicionado || game.createdAt).toLocaleDateString('pt-BR');

  // Validação corrigida e blindada contra undefined:
  const isAdmin = usuarioLogado?.role === 'admin';
  const currentUserId = usuarioLogado
    ? (usuarioLogado.userId || usuarioLogado.id || usuarioLogado._id || usuarioLogado.sub)
    : null;

  // Pega o ID do usuário da review (testando as nomenclaturas mais comuns de Models)
  function getReviewOwnerId(r) {
    return r.usuarioId || r.userId || (r.usuario && (r.usuario.id || r.usuario._id)) || (r.user && (r.user.id || r.user._id)) || r.usuario || r.user;
  }

  // Validação corrigida e blindada contra undefined:
  const jaFezReview = reviews.some(r => {
    if (!currentUserId) return false;
    const reviewUserId = getReviewOwnerId(r);
    if (!reviewUserId) return false;
    return reviewUserId.toString() === currentUserId.toString();
  });

  // 1. Define a Ação de Review (Garante que o botão renderize como bloco limpo)
  let acaoReviewHTML = '';
  if (jaFezReview) {
    acaoReviewHTML = `<span class="review__status-ok">✓ Você já avaliou</span>`;
  } else {
    acaoReviewHTML = `<button class="btn btn--xs btn--outline" onclick="abrirModalNovaReview('${gId}','${escapeHtml(game.titulo)}')">+ Adicionar review</button>`;
  }

  // 2. Monta o corpo do rodapé de reviews
  let footerHTML = '';

  if (reviews.length === 0) {
    footerHTML = `
      <div class="no-review">
        <span class="no-review__icon">📝</span>
        <p class="no-review__text">Sem review ainda.</p>
      </div>`;
  } else {
    let indexAtivo = carrosselReview[gId];
    if (indexAtivo >= reviews.length) indexAtivo = 0;
    
    const reviewAtiva = reviews[indexAtivo];
    const dataReview = new Date(reviewAtiva.dataCriacao || reviewAtiva.createdAt).toLocaleDateString('pt-BR');

    
    const reviewAtivaOwnerId = getReviewOwnerId(reviewAtiva);
    const isOwnerDaReviewAtiva = !!currentUserId && !!reviewAtivaOwnerId
      && reviewAtivaOwnerId.toString() === currentUserId.toString();

    let acoesReviewHTML = '';
    if (isAdmin || isOwnerDaReviewAtiva) {
      acoesReviewHTML = `
        <button class="btn btn--xs btn--ghost" onclick="abrirModalEditarReview('${reviewAtiva.id || reviewAtiva._id}')">✏️ Editar</button>
        <button class="btn btn--xs btn--danger-ghost" onclick="confirmarDelete('review','${reviewAtiva.id || reviewAtiva._id}','${escapeHtml(game.titulo)}')">🗑️ Excluir</button>`;
    }

    let seletorCarrossel = '';
    if (reviews.length > 1) {
      seletorCarrossel = `
      <div class="review__carrossel">
        <button class="btn btn--xs btn--ghost review__carrossel-btn" onclick="mudarReviewAtiva('${gId}', -1, ${reviews.length})">◀</button>
        <span class="review__carrossel-count">${indexAtivo + 1}/${reviews.length}</span>
        <button class="btn btn--xs btn--ghost review__carrossel-btn" onclick="mudarReviewAtiva('${gId}', 1, ${reviews.length})">▶</button>
      </div>`;
    }

    footerHTML = `
      <div class="review">
        <div class="review__header">
          <div class="review__header-left">
            <span class="review__label">⭐ Review</span>
            ${seletorCarrossel}
          </div>
          <span class="review__nota">Nota: <strong>${reviewAtiva.nota}</strong>/10</span>
        </div>
        <p class="review__comentario">${escapeHtml(reviewAtiva.comentario)}</p>
        <div class="review__meta">
          <span>🕐 ${reviewAtiva.horasJogadas}h jogadas</span>
          <span>📅 ${dataReview}</span>
        </div>
        <div class="review__actions">
          ${acoesReviewHTML}
        </div>
      </div>`;
  }

  // Retorno estruturado aplicando propriedades flex diretas para evitar quebras de CSS do tema original
  return `
    <article class="card" id="card-${gId}">
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
        <div class="card__game-actions-left">
          ${isAdmin ? `
          <button class="btn btn--xs btn--ghost" onclick="abrirModalEditarGame('${gId}')">✏️ Editar</button>
          <button class="btn btn--xs btn--danger-ghost" onclick="confirmarDelete('game','${gId}','${escapeHtml(game.titulo)}')">🗑️ Excluir</button>` : ''}
        </div>
        <div class="card__game-actions-right">
          ${acaoReviewHTML}
        </div>
      </div>

      <footer class="card__footer">
        ${footerHTML}
      </footer>
    </article>`;

}    
// Função para mudar a review visível ao clicar nas setinhas do card
function mudarReviewAtiva(gameId, direcao, totalReviews) {
  let novoIndex = carrosselReview[gameId] + direcao;
  
  if (novoIndex < 0) {
    novoIndex = totalReviews - 1; // Vai para a última se retroceder além da primeira
  } else if (novoIndex >= totalReviews) {
    novoIndex = 0; // Volta para a primeira se avançar além da última
  }
  
  carrosselReview[gameId] = novoIndex;
  renderizarGrid();
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
      const idx = state.games.findIndex(g => g.id === state.editandoGameId);
      if (idx !== -1) state.games[idx] = res;
    } else {
      const res = await api('POST', '/api/games', body);
      state.games.push(res);
    }

    fecharModal('modal-game');
    renderizarGrid();
  } catch (err) {
    // Exibe o erro real (Ex: "Acesso negado. Permissões insuficientes.")
    mostrarErro('erro-game-global', err.message || 'Erro de conexão. Tente novamente.');
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
      const idx = state.reviews.findIndex(r => r.id === state.editandoReviewId);
      if (idx !== -1) state.reviews[idx] = res;
    } else {
      res = await api('POST', '/api/reviews', { gameId: state.reviewGameId, nota, comentario, horasJogadas });
      state.reviews.push(res);
    }

    fecharModal('modal-review');
    renderizarGrid();
  } catch (err) {
    // Exibe o erro real no formulário de review
    mostrarErro('erro-review-global', err.message || 'Erro de conexão. Tente novamente.');
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
  const msgContainer = document.getElementById('confirm-msg'); // Alvo para exibir o erro se falhar
  const textoOriginal = msgContainer.textContent;

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
    // EXIBE O ERRO NA TELA: Transforma o texto do modal temporariamente no erro retornado pelo back
    msgContainer.innerHTML = `<span class="modal__error-msg">⚠️ ${err.message || 'Erro ao excluir. Permissões insuficientes.'}</span>`;
    
    // Restaura o texto original após 3.5 segundos para não quebrar o modal
    setTimeout(() => {
      msgContainer.textContent = textoOriginal;
    }, 3500);
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
