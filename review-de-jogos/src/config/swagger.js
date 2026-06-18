import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Coleção de Jogos com Reviews',
      version: '1.0.0',
      description: 'Documentação gerada com Swagger/OpenAPI — Aula 17.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Ambiente local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Game: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            titulo: { type: 'string', example: 'Hollow Knight' },
            plataforma: { type: 'string', example: 'PC' },
            genero: { type: 'string', example: 'Metroidvania' },
            status: { type: 'string', enum: ['na fila', 'jogando', 'zerado', 'abandonado'] },
            dataAdicionado: { type: 'string', format: 'date-time' },
          },
        },
        GameInput: {
          type: 'object',
          required: ['titulo', 'plataforma', 'genero', 'status'],
          properties: {
            titulo: { type: 'string', example: 'Hollow Knight' },
            plataforma: { type: 'string', example: 'PC' },
            genero: { type: 'string', example: 'Metroidvania' },
            status: { type: 'string', enum: ['na fila', 'jogando', 'zerado', 'abandonado'] },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2' },
            gameId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            usuarioId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0aa' },
            nota: { type: 'number', example: 9 },
            comentario: { type: 'string', example: 'Jogo excelente, trilha sonora incrível.' },
            horasJogadas: { type: 'number', example: 35 },
            dataCriacao: { type: 'string', format: 'date-time' },
          },
        },
        ReviewInput: {
          type: 'object',
          required: ['gameId', 'nota', 'comentario', 'horasJogadas'],
          properties: {
            gameId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            nota: { type: 'number', minimum: 0, maximum: 10, example: 9 },
            comentario: { type: 'string', minLength: 10, example: 'Jogo excelente, trilha sonora incrível.' },
            horasJogadas: { type: 'number', minimum: 0, example: 35 },
          },
        },
        ReviewUpdateInput: {
          type: 'object',
          required: ['nota', 'comentario', 'horasJogadas'],
          properties: {
            nota: { type: 'number', minimum: 0, maximum: 10, example: 8 },
            comentario: { type: 'string', minLength: 10, example: 'Revi minha nota depois da segunda zerada.' },
            horasJogadas: { type: 'number', minimum: 0, example: 42 },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['login', 'senha'],
          properties: {
            login: { type: 'string', example: 'admin' },
            senha: { type: 'string', format: 'password', example: 'admin321' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            sucesso: { type: 'boolean', example: true },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['login', 'senha', 'nome'],
          properties: {
            login: { type: 'string', example: 'jogador2' },
            senha: { type: 'string', format: 'password', example: 'senha123' },
            nome: { type: 'string', example: 'Jogador Dois' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            sucesso: { type: 'boolean', example: false },
            mensagem: { type: 'string', example: 'Mensagem de erro.' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export default swaggerJSDoc(options);