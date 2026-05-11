export class GameDto {
  constructor(game) {
    this.id = game.id;
    this.titulo = game.titulo;
    this.plataforma = game.plataforma;
    this.genero = game.genero;
    this.status = game.status;
    this.dataAdicionado = game.dataAdicionado;
  }
}

export class GameComReviewDto {
  constructor(game, review = null) {
    this.id = game.id;
    this.titulo = game.titulo;
    this.plataforma = game.plataforma;
    this.genero = game.genero;
    this.status = game.status;
    this.dataAdicionado = game.dataAdicionado;
    this.review = review ? new ReviewResumoDto(review) : null;
  }
}

class ReviewResumoDto {
  constructor(review) {
    this.id = review.id;
    this.nota = review.nota;
    this.comentario = review.comentario;
    this.horasJogadas = review.horasJogadas;
    this.dataCriacao = review.dataCriacao;
  }
}
