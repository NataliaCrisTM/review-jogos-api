import gameService from '../services/gameService.js';
import reviewRepository from '../repositories/reviewRepository.js';


export class WebController {

  static gamesView(req, res, next) {
    try {
      res.render('games', {
        titulo: 'Minha Coleção de Jogos',
      });
    } catch (err) {
      next(err);
    }
  }

}