export class ReviewDto {
  constructor(review) {
    this.id = review.id;
    this.gameId = review.gameId;
    this.nota = review.nota;
    this.comentario = review.comentario;
    this.horasJogadas = review.horasJogadas;
    this.dataCriacao = review.dataCriacao;
  }
}
