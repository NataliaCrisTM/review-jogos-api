/**
 * Representa a entidade User tal como ela existe no banco de dados.
 * IMPORTANTE: o campo `senha` deve SEMPRE chegar aqui já hasheado
 * com bcrypt — este model não faz o hashing, apenas guarda o formato.
 */
export class user {
  constructor({ login, senha, nome, role = 'user' }) {
    this.login = login;
    this.senha = senha;
    this.nome = nome;
    this.role = role;
  }
}
