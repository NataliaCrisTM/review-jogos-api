import db from '../config/database.js';
import { ObjectId } from 'mongodb';

const collection = db.collection('games');

const gameRepository = {

  async findAll() {
    return await collection.find().toArray();
  },

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await collection.findOne({ _id: new ObjectId(id) });
  },

  async create(data) {
    const novoGame = {
      titulo: data.titulo,
      plataforma: data.plataforma,
      genero: data.genero,
      status: data.status,
      dataAdicionado: new Date().toISOString(),
    };

    const resultado = await collection.insertOne(novoGame);
    return { _id: resultado.insertedId, ...novoGame };
  },

  async update(id, data) {
    if (!ObjectId.isValid(id)) return null;

    const resultado = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: {
          titulo: data.titulo,
          plataforma: data.plataforma,
          genero: data.genero,
          status: data.status,
        } },
      { returnDocument: 'after' }
    );

    return resultado;
  },

  async delete(id) {
    if (!ObjectId.isValid(id)) return false;

    const resultado = await collection.deleteOne({ _id: new ObjectId(id) });
    return resultado.deletedCount === 1;
  },

};

export default gameRepository;