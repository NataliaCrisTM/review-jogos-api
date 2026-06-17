import reviewRepository from '../repositories/reviewRepository.js';
import gameRepository from '../repositories/gameRepository.js';

const lancarErro = (mensagem, status) => {
  const err = new Error(mensagem);
  err.statusCode = status;
  throw err;
};

const verificarPermissaoSobreReview = (review, usuarioAutenticado) => {
  const ehAdmin = usuarioAutenticado.role === 'admin';
  const ehDono = review.usuarioId === usuarioAutenticado.userId;
  if (!ehAdmin && !ehDono) {
    lancarErro('Você só pode editar ou excluir as suas próprias reviews.', 403);
  }
};

const reviewService = {

  async getAll() {
    return await reviewRepository.findAll();
  },

  async getById(id) {
    const review = await reviewRepository.findById(id);
    if (!review) lancarErro(`Review com id "${id}" não encontrada.`, 404);
    return review;
  },

  async getByGameId(gameId) {
    const game = await gameRepository.findById(gameId);
    if (!game) lancarErro(`Game com id "${gameId}" não encontrado.`, 404);

    return await reviewRepository.findAllByGameId(gameId);
  },

  async create(data, usuarioAutenticado) {
    const game = await gameRepository.findById(data.gameId);
    if (!game) lancarErro(`Game com id "${data.gameId}" não encontrado.`, 404);

  
    const jaAvaliou = await reviewRepository.findByGameIdAndUserId(data.gameId, usuarioAutenticado.userId);
    if (jaAvaliou) {
      lancarErro(`Você já avaliou o game "${game.titulo}".`, 409);
  }

  return await reviewRepository.create({ ...data, usuarioId: usuarioAutenticado.userId });
},

  async update(id, data, usuarioAutenticado) {
    const review = await reviewService.getById(id);
    verificarPermissaoSobreReview(review, usuarioAutenticado);

    const reviewAtualizada = await reviewRepository.update(id, data);
    if (!reviewAtualizada) lancarErro(`Falha ao atualizar a review com id "${id}".`, 500);
    return reviewAtualizada;
  },

  async delete(id, usuarioAutenticado) {
    const review = await reviewService.getById(id);
    verificarPermissaoSobreReview(review, usuarioAutenticado);

    const deletado = await reviewRepository.delete(id);
    if (!deletado) lancarErro(`Falha ao deletar a review com id "${id}".`, 500);
  },

};

export default reviewService;