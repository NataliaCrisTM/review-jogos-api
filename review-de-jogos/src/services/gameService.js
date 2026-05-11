import gameRepository from '../repositories/gameRepository.js';
import reviewRepository from '../repositories/reviewRepository.js';

const lancarErro = (mensagem, status) => {
  const err = new Error(mensagem);
  err.statusCode = status;
  throw err;
};

const gameService = {

  getAll() {
    return gameRepository.findAll();
  },

  getById(id) {
    const game = gameRepository.findById(id);
    if (!game) lancarErro(`Game com id "${id}" não encontrado.`, 404);
    return game;
  },

  async create(data) {
    return await gameRepository.create(data);
  },

  async update(id, data) {
    gameService.getById(id);
    const gameAtualizado = await gameRepository.update(id, data);
    if (!gameAtualizado) lancarErro(`Falha ao atualizar o game com id "${id}".`, 500);
    return gameAtualizado;
  },

  async delete(id) {
    gameService.getById(id);
    await reviewRepository.deleteByGameId(id);
    const deletado = await gameRepository.delete(id);
    if (!deletado) lancarErro(`Falha ao deletar o game com id "${id}".`, 500);
  },

};

export default gameService;
