import gameService from '../services/gameService.js';
import reviewRepository from '../repositories/reviewRepository.js';
import { GameComReviewDto } from '../dtos/gameDto.js';

export class WebController {

  static async gamesView(req, res, next) {
    try {
      const games = gameService.getAll();

      const gamesComReview = games.map(game => {
        const review = reviewRepository.findByGameId(game.id);
        return new GameComReviewDto(game, review);
      });

      res.render('games', {
        titulo: 'Minha Coleção de Jogos',
        games: gamesComReview,
      });
    } catch (err) {
      next(err);
    }
  }

}
