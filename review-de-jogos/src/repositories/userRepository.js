import db from '../config/database.js';

const collection = db.collection('users');

const userRepository = {

  async findByLogin(login) {
    return await collection.findOne({ login });
  },

};

export default userRepository;