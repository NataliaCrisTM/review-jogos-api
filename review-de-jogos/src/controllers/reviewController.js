import reviewService from '../services/reviewService.js';
import { ReviewDto } from '../dtos/reviewDto.js';

export class ReviewController {

  static async getAll(req, res, next) {
    try {
      const reviews = reviewService.getAll();
      res.status(200).json(reviews.map(r => new ReviewDto(r)));
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const review = reviewService.getById(req.params.id);
      res.status(200).json(new ReviewDto(review));
    } catch (err) {
      next(err);
    }
  }

  static async getByGameId(req, res, next) {
    try {
      const review = reviewService.getByGameId(req.params.gameId);
      res.status(200).json(new ReviewDto(review));
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { gameId, nota, comentario, horasJogadas } = req.body;
      const review = await reviewService.create({ gameId, nota, comentario, horasJogadas });
      res.status(201).json(new ReviewDto(review));
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { nota, comentario, horasJogadas } = req.body;
      const review = await reviewService.update(req.params.id, { nota, comentario, horasJogadas });
      res.status(200).json(new ReviewDto(review));
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await reviewService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

}
