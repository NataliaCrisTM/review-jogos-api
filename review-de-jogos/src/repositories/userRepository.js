import db from '../config/database.js';
import { user } from '../models/user.js';

const collection = db.collection('users');

const userRepository = {

  async findByLogin(login) {
    return await collection.findOne({ login });
  },

  async existsByLogin(login) {
    const usuario = await collection.findOne({ login });
    return !!usuario;
  },

  async create(data) {
    const novoUsuario = new user(data);
    const resultado = await collection.insertOne(novoUsuario);
    return { _id: resultado.insertedId, ...novoUsuario };
  },

};

export default userRepository;