export class GameDto {
  constructor(game) {
    this.id = game._id.toString();
    this.titulo = game.titulo;
    this.plataforma = game.plataforma;
    this.genero = game.genero;
    this.status = game.status;
    this.dataAdicionado = game.dataAdicionado;
  }
}


