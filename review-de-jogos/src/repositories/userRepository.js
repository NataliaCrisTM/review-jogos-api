import db from '../config/database.js';

const userRepository = {

  findByLogin(login) {
    return db.data.users.find(u => u.login === login) ?? null;
  },

};

export default userRepository;