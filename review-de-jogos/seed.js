import db from './src/config/database.js';

await db.collection('users').insertMany([
  {
    login: 'jogador1',
    senha: '$2b$10$NmdiYk0BwItJXYeIZITQv.hXN2VwzzBuTrw4hTboR6S3HFtUn9mBq',
    nome: 'Jogador Um',
    role: 'user',
  },
  {
    login: 'admin',
    senha: '$2b$10$eTnoCPtFp1SX3JOSjVpAZOm/R/T9ziZVP/Peu8cFYseGkT./rUh7S',
    nome: 'Administrador',
    role: 'admin',
  },
]);

console.log('Usuários inseridos com sucesso!');
process.exit(0);