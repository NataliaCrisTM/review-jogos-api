export class ReviewDto {
  constructor(review) {
    this.id = review._id.toString();
    this.gameId = review.gameId;
    this.usuarioId = review.usuarioId;
    this.nota = review.nota;
    this.comentario = review.comentario;
    this.horasJogadas = review.horasJogadas;
    this.dataCriacao = review.dataCriacao;
  }
}
