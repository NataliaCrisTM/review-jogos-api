import gameService from '../services/gameService.js';
import { GameDto } from '../dtos/gameDto.js';

export class GameController {

  static async getAll(req, res, next) {
    try {
      const games = gameService.getAll();
      res.status(200).json(games.map(g => new GameDto(g)));
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const game = gameService.getById(req.params.id);
      res.status(200).json(new GameDto(game));
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { titulo, plataforma, genero, status } = req.body;
      const game = await gameService.create({ titulo, plataforma, genero, status });
      res.status(201).json(new GameDto(game));
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { titulo, plataforma, genero, status } = req.body;
      const game = await gameService.update(req.params.id, { titulo, plataforma, genero, status });
      res.status(200).json(new GameDto(game));
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await gameService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

}
