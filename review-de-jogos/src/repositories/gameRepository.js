import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const gameRepository = {

  findAll() {
    return db.data.games;
  },

  findById(id) {
    return db.data.games.find(game => game.id === id) ?? null;
  },

  async create(data) {
    const novoGame = {
      id: uuidv4(),
      titulo: data.titulo,
      plataforma: data.plataforma,
      genero: data.genero,
      status: data.status,
      dataAdicionado: new Date().toISOString(),
    };

    db.data.games.push(novoGame);
    await db.write();
    return novoGame;
  },

  async update(id, data) {
    const index = db.data.games.findIndex(game => game.id === id);
    if (index === -1) return null;

    db.data.games[index] = {
      ...db.data.games[index],
      titulo: data.titulo,
      plataforma: data.plataforma,
      genero: data.genero,
      status: data.status,
    };

    await db.write();
    return db.data.games[index];
  },

  async delete(id) {
    const index = db.data.games.findIndex(game => game.id === id);
    if (index === -1) return false;

    db.data.games.splice(index, 1);
    await db.write();
    return true;
  },

};

export default gameRepository;
