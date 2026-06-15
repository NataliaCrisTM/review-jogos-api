import db from '../config/database.js';
import { ObjectId } from 'mongodb';

const collection = db.collection('reviews');

const reviewRepository = {

  async findAll() {
    return await collection.find().toArray();
  },

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await collection.findOne({ _id: new ObjectId(id) });
  },

  async findByGameId(gameId) {
    return await collection.findOne({ gameId });
  },

  async create(data) {
    const novaReview = {
      gameId: data.gameId,        // string — o _id do game, convertido
      nota: data.nota,
      comentario: data.comentario,
      horasJogadas: data.horasJogadas,
      dataCriacao: new Date().toISOString(),
    };

    const resultado = await collection.insertOne(novaReview);
    return { _id: resultado.insertedId, ...novaReview };
  },

  async update(id, data) {
    if (!ObjectId.isValid(id)) return null;

    return await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: {
          nota: data.nota,
          comentario: data.comentario,
          horasJogadas: data.horasJogadas,
        } },
      { returnDocument: 'after' }
    );
  },

  async delete(id) {
    if (!ObjectId.isValid(id)) return false;
    const resultado = await collection.deleteOne({ _id: new ObjectId(id) });
    return resultado.deletedCount === 1;
  },

  async deleteByGameId(gameId) {
    const resultado = await collection.deleteOne({ gameId });
    return resultado.deletedCount === 1;
  },

};

export default reviewRepository;