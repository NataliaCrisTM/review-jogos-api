import reviewRepository from '../repositories/reviewRepository.js';
import gameRepository from '../repositories/gameRepository.js';

const lancarErro = (mensagem, status) => {
  const err = new Error(mensagem);
  err.statusCode = status;
  throw err;
};

const reviewService = {

  getAll() {
    return reviewRepository.findAll();
  },

  getById(id) {
    const review = reviewRepository.findById(id);
    if (!review) lancarErro(`Review com id "${id}" não encontrada.`, 404);
    return review;
  },

  getByGameId(gameId) {
    const game = gameRepository.findById(gameId);
    if (!game) lancarErro(`Game com id "${gameId}" não encontrado.`, 404);

    const review = reviewRepository.findByGameId(gameId);
    if (!review) lancarErro(`Nenhuma review encontrada para o game "${game.titulo}".`, 404);
    return review;
  },

  async create(data) {
    const game = gameRepository.findById(data.gameId);
    if (!game) lancarErro(`Game com id "${data.gameId}" não encontrado.`, 404);

    const reviewExistente = reviewRepository.findByGameId(data.gameId);
    if (reviewExistente) {
      lancarErro(
        `O game "${game.titulo}" já possui uma review. Cada game pode ter no máximo uma review.`,
        409
      );
    }

    return await reviewRepository.create(data);
  },

  async update(id, data) {
    reviewService.getById(id);
    const reviewAtualizada = await reviewRepository.update(id, data);
    if (!reviewAtualizada) lancarErro(`Falha ao atualizar a review com id "${id}".`, 500);
    return reviewAtualizada;
  },

  async delete(id) {
    reviewService.getById(id);
    const deletado = await reviewRepository.delete(id);
    if (!deletado) lancarErro(`Falha ao deletar a review com id "${id}".`, 500);
  },

};

export default reviewService;
