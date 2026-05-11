import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const reviewRepository = {

  findAll() {
    return db.data.reviews;
  },

  findById(id) {
    return db.data.reviews.find(review => review.id === id) ?? null;
  },

  findByGameId(gameId) {
    return db.data.reviews.find(review => review.gameId === gameId) ?? null;
  },

  async create(data) {
    const novaReview = {
      id: uuidv4(),
      gameId: data.gameId,
      nota: data.nota,
      comentario: data.comentario,
      horasJogadas: data.horasJogadas,
      dataCriacao: new Date().toISOString(),
    };

    db.data.reviews.push(novaReview);
    await db.write();
    return novaReview;
  },

  async update(id, data) {
    const index = db.data.reviews.findIndex(review => review.id === id);
    if (index === -1) return null;

    db.data.reviews[index] = {
      ...db.data.reviews[index],
      nota: data.nota,
      comentario: data.comentario,
      horasJogadas: data.horasJogadas,
    };

    await db.write();
    return db.data.reviews[index];
  },

  async delete(id) {
    const index = db.data.reviews.findIndex(review => review.id === id);
    if (index === -1) return false;

    db.data.reviews.splice(index, 1);
    await db.write();
    return true;
  },

  async deleteByGameId(gameId) {
    const index = db.data.reviews.findIndex(review => review.gameId === gameId);
    if (index === -1) return false;

    db.data.reviews.splice(index, 1);
    await db.write();
    return true;
  },

};

export default reviewRepository;
