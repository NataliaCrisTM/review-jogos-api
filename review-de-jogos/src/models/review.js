/**
 * Representa a entidade Review tal como ela existe no banco de dados.
 * O campo `usuarioId` guarda quem criou a review, usado para
 * permitir que usuários comuns editem/excluam apenas as próprias reviews.
 */
export class review {
  constructor({ gameId, nota, comentario, horasJogadas, usuarioId }) {
    this.gameId = gameId;
    this.nota = nota;
    this.comentario = comentario;
    this.horasJogadas = horasJogadas;
    this.usuarioId = usuarioId;
    this.dataCriacao = new Date().toISOString();
  }
}
