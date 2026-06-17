import gameService from '../services/gameService.js';
import reviewRepository from '../repositories/reviewRepository.js';
import { GameComReviewDto } from '../dtos/gameDto.js';

export class WebController {

  static async gamesView(req, res, next) {
    try {
      const games = await gameService.getAll();

      const gamesComReview = await Promise.all(
      games.map(async game => {
        const reviews = await reviewRepository.findAllByGameId(game._id);
        return new GameComReviewDto(game, reviews[0] || null);
      })
    );

      res.render('games', {
        titulo: 'Minha Coleção de Jogos',
        games: gamesComReview,
      });
    } catch (err) {
      next(err);
    }
  }

}
