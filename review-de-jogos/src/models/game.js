/**
 * Representa a entidade Game tal como ela existe no banco de dados.
 * Centraliza o "formato" do documento, evitando que cada camada monte
 * o objeto à sua maneira.
 */
export class game {
  constructor({ titulo, plataforma, genero, status }) {
    this.titulo = titulo;
    this.plataforma = plataforma;
    this.genero = genero;
    this.status = status;
    this.dataAdicionado = new Date().toISOString();
  }
}
