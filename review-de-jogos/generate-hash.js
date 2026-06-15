import bcrypt from 'bcrypt';

const saltRounds = 10;

const senhas = [
  { usuario: 'jogador1', senha: 'senha123' },
  { usuario: 'admin',    senha: 'admin321' },
];

for (const item of senhas) {
  const hash = await bcrypt.hash(item.senha, saltRounds);
  console.log(`\nUsuário: ${item.usuario}`);
  console.log(`Hash: ${hash}`);
}

/*
Usuário: jogador1
Hash: $2b$10$NmdiYk0BwItJXYeIZITQv.hXN2VwzzBuTrw4hTboR6S3HFtUn9mBq

Usuário: admin
Hash: $2b$10$eTnoCPtFp1SX3JOSjVpAZOm/R/T9ziZVP/Peu8cFYseGkT./rUh7S

*/