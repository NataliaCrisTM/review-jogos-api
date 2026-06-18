# 🎮 Review de jogos API

Uma API para gerenciar sua coleção pessoal de jogos e reviews, construída com Node.js e Express. Inclui uma interface web interativa em /games-view que permite criar, editar e excluir jogos e reviews diretamente pelo navegador, com login via JWT, sem precisar de Postman ou qualquer outra ferramenta.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Arquitetura](#-arquitetura)
- [Como Usar](#-como-usar)
- [Autenticação e Permissões](#-autenticação-e-permissões)
- [Interface Web](#-interface-web)
- [Documentação da API (Swagger)](#-documentação-da-api-swagger)
- [Rotas da API](#-rotas-da-api)
- [Exemplos de Requisições](#-exemplos-de-requisições)
- [Regras de Negócio](#-regras-de-negócio)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Padrões de Resposta](#-padrões-de-resposta)

---

## 💡 Sobre o Projeto

A Review de jogos API permite catalogar jogos com informações como plataforma, gênero e status de progresso (`na fila`, `jogando`, `zerado`, `abandonado`). Cada jogo pode ter várias reviews associadas — uma por usuário que avaliou.

Há duas formas de uso:
- **API REST:** endpoints JSON para integração com outros sistemas ou ferramentas como Postman, documentados via Swagger
- **Interface Web:** página interativa com formulários, modais, cards e login, consumindo a própria API via `fetch()`

---

## 🏗 Arquitetura

O projeto segue uma arquitetura em camadas com fluxo unidirecional de dados:

Requisição → Rota → Middlewares (auth/autorização) → Validator → Controller → Service → Repository → MongoDB Atlas

Cada camada tem uma responsabilidade única:

- **Routes** — mapeiam URLs para controllers
- **Middlewares de auth** — `autenticar` (valida o JWT) e `autorizar` (checa a role) protegem rotas sensíveis antes mesmo do validator
- **Validators** — validam o payload antes de chegar ao controller
- **Controllers** — orquestram a requisição e chamam o service
- **Services** — contêm toda a lógica de negócio (incluindo regras de permissão sobre dono de review) e lançam erros com `statusCode`
- **Repositories** — único ponto de acesso ao banco de dados (driver nativo do MongoDB, sem Mongoose)
- **DTOs** — formatam o objeto antes de enviar ao cliente
- **ErrorMiddleware** — captura todos os erros em um único lugar

---

## 💻 Como Usar

Após iniciar o servidor, você tem acesso a:

| Interface | URL |
|---|---|
| API Games | `http://localhost:3000/api/games` |
| API Reviews | `http://localhost:3000/api/reviews` |
| API Auth | `http://localhost:3000/api/auth` |
| Documentação Swagger | `http://localhost:3000/api-docs` |
| Página Web | `http://localhost:3000/games-view` |

---

## 🔐 Autenticação e Permissões

A API usa autenticação via **JWT** (JSON Web Token). Para acessar rotas protegidas, envie o token no header:

Authorization: Bearer <token>

O token é obtido em `POST /api/auth/login` e expira conforme `JWT_EXPIRES_IN` (padrão: `1h`).

### Quem pode o quê

| Ação | Quem pode |
|---|---|
| Ler games/reviews | Qualquer um (rota pública) |
| Criar/editar/excluir game | Apenas usuários com role `admin` |
| Criar review | Qualquer usuário autenticado (`admin` ou `user`) |
| Editar/excluir review | Apenas o autor da review ou um `admin` |
| Registrar nova conta | Qualquer um — a role é sempre forçada para `user` no servidor; não é possível se autopromover a `admin` enviando `"role": "admin"` no corpo da requisição |

---

## 🖥 Interface Web

A página `/games-view` oferece CRUD completo de jogos e reviews sem sair do navegador, incluindo login.

### Funcionalidades

| Ação | Como funciona |
|---|---|
| **Login/Logout** | Botão "Entrar" no topo abre um modal; o token fica salvo no `localStorage` |
| **Visualizar coleção** | Cards com todas as informações do jogo e um carrossel para navegar entre as reviews |
| **Novo jogo** | Visível apenas para `admin`; abre modal com formulário |
| **Editar/Excluir jogo** | Botões visíveis apenas para `admin` |
| **Adicionar review** | Botão aparece no card quando o usuário logado ainda não avaliou aquele jogo |
| **Editar/Excluir review** | Botões visíveis apenas para o autor da review ativa no carrossel, ou para um `admin` |

### Como funciona por baixo

- O Pug renderiza a estrutura HTML (toolbar, grid vazio, modais, modal de login) no servidor — a grid em si é 100% montada no client
- Ao carregar a página, `main.js` faz `GET /api/games` e `GET /api/reviews` em paralelo
- O token salvo é decodificado no navegador (decode base64url, seguro para acentos) para saber o `id` e a `role` do usuário logado, e isso controla quais botões aparecem em cada card
- Criar, editar e excluir chamam os endpoints da API via `fetch()`, anexando o header `Authorization` quando há token salvo, e atualizam a tela sem recarregar a página
- Validações acontecem no front antes de chamar a API, com mensagens de erro inline em cada campo

---

## 📖 Documentação da API (Swagger)

A API conta com documentação interativa via **OpenAPI/Swagger**, disponível em:

http://localhost:3000/api-docs

Lá é possível ver todos os endpoints, seus parâmetros, exemplos de corpo de requisição/resposta e testar chamadas reais direto pela interface ("Try it out"), sem precisar do Postman.

Para testar rotas protegidas: chame `POST /api/auth/login` pela própria interface, copie o `token` retornado, clique em **Authorize** (canto superior direito) e cole o token (sem o prefixo `Bearer`). A partir daí, toda chamada feita por ali já envia o header de autenticação automaticamente.

---

## 📡 Rotas da API

### 🔑 Auth — `/api/auth`

| Método | Rota | Descrição | Status |
|---|---|---|---|
| `POST` | `/api/auth/register` | Cria uma nova conta (`role` sempre `user`) | `201` |
| `POST` | `/api/auth/login` | Autentica e retorna um token JWT | `200` |

### 🕹 Games — `/api/games`

| Método | Rota | Descrição | Auth | Status |
|---|---|---|---|---|
| `GET` | `/api/games` | Lista todos os jogos | Pública | `200` |
| `GET` | `/api/games/:id` | Busca um jogo por ID | Pública | `200` |
| `POST` | `/api/games` | Cria um novo jogo | `admin` | `201` |
| `PUT` | `/api/games/:id` | Atualiza um jogo completo | `admin` | `200` |
| `DELETE` | `/api/games/:id` | Remove o jogo e todas as suas reviews | `admin` | `204` |

### ⭐ Reviews — `/api/reviews`

| Método | Rota | Descrição | Auth | Status |
|---|---|---|---|---|
| `GET` | `/api/reviews` | Lista todas as reviews | Pública | `200` |
| `GET` | `/api/reviews/:id` | Busca uma review por ID | Pública | `200` |
| `GET` | `/api/reviews/game/:gameId` | Lista as reviews de um jogo (uma por usuário) | Pública | `200` |
| `POST` | `/api/reviews` | Cria uma review | `admin` ou `user` | `201` |
| `PUT` | `/api/reviews/:id` | Atualiza uma review | Autor ou `admin` | `200` |
| `DELETE` | `/api/reviews/:id` | Remove uma review | Autor ou `admin` | `204` |

### 🌐 Web

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/games-view` | Exibe a interface interativa da coleção |

---

## 📝 Exemplos de Requisições

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "login": "admin",
  "senha": "admin321"
}
```

**Resposta `200`:**
```json
{
  "sucesso": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Criar um jogo

```http
POST /api/games
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "titulo": "The Witcher 3",
  "plataforma": "PC",
  "genero": "RPG",
  "status": "zerado"
}
```

**Resposta `201`:**
```json
{
  "id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "titulo": "The Witcher 3",
  "plataforma": "PC",
  "genero": "RPG",
  "status": "zerado",
  "dataAdicionado": "2026-01-15T10:30:00.000Z"
}
```

---

### Criar uma review

```http
POST /api/reviews
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "gameId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "nota": 9.5,
  "comentario": "Obra-prima absoluta. História envolvente e mundo imenso.",
  "horasJogadas": 120
}
```

**Resposta `201`:**
```json
{
  "id": "64f1a2b3c4d5e6f7a8b9c0d2",
  "gameId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "usuarioId": "64f1a2b3c4d5e6f7a8b9c0aa",
  "nota": 9.5,
  "comentario": "Obra-prima absoluta. História envolvente e mundo imenso.",
  "horasJogadas": 120,
  "dataCriacao": "2026-01-15T11:00:00.000Z"
}
```

---

### Atualizar um jogo

```http
PUT /api/games/64f1a2b3c4d5e6f7a8b9c0d1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "titulo": "The Witcher 3: Wild Hunt",
  "plataforma": "PC",
  "genero": "RPG",
  "status": "zerado"
}
```

---

### Erro de validação — Resposta `400`

```json
{
  "sucesso": false,
  "mensagem": "Erro de validação.",
  "erros": [
    { "campo": "status", "mensagem": "O status deve ser um dos seguintes: na fila, jogando, zerado, abandonado." },
    { "campo": "titulo", "mensagem": "O título deve ter no mínimo 2 caracteres." }
  ]
}
```

---

### Erro de permissão — Resposta `403`

```json
{
  "sucesso": false,
  "mensagem": "Você só pode editar ou excluir as suas próprias reviews."
}
```

---

## 📐 Regras de Negócio

- **Review única por jogo, por usuário** — cada usuário pode avaliar um mesmo jogo apenas uma vez, mas um jogo pode ter várias reviews (uma de cada usuário que o avaliou). Uma segunda tentativa do mesmo usuário retorna `409 Conflict`.
- **Cascata ao deletar** — ao remover um game, todas as reviews associadas a ele são deletadas automaticamente.
- **Permissão sobre review** — apenas o autor da review ou um usuário `admin` pode editá-la ou excluí-la.
- **Permissão sobre game** — apenas usuários `admin` podem criar, editar ou excluir games.
- **Role forçada no registro** — ao criar conta via `POST /api/auth/register`, a role é sempre `user`, independente do que for enviado no corpo da requisição.
- **gameId imutável** — o campo `gameId` de uma review não pode ser alterado via `PUT`.
- **Campos gerados automaticamente** — `id`, `usuarioId`, `dataAdicionado` e `dataCriacao` são gerados pelo servidor e ignorados caso enviados pelo cliente.

### Valores válidos para `status`

| Valor | Descrição |
|---|---|
| `na fila` | Jogo adquirido, ainda não iniciado |
| `jogando` | Em andamento |
| `zerado` | Concluído |
| `abandonado` | Largado |

### Validações dos campos

**Game:**
- `titulo` — obrigatório, mínimo 2 caracteres
- `plataforma` — obrigatório (ex: `PC`, `PS5`, `Xbox`, `Nintendo Switch`)
- `genero` — obrigatório (ex: `RPG`, `FPS`, `Aventura`)
- `status` — obrigatório, um dos 4 valores acima

**Review:**
- `gameId` — ID válido (ObjectId do MongoDB) de um game existente
- `nota` — número entre `0` e `10`
- `comentario` — obrigatório, mínimo 10 caracteres
- `horasJogadas` — número maior ou igual a `0`

**Auth:**
- `login` — obrigatório, único no sistema
- `senha` — obrigatória, armazenada com hash via `bcrypt`
- `nome` — obrigatório (apenas no registro)

---

## 📁 Estrutura de Pastas

/

├── public/

│   ├── css/

│   │   ├── style.css           # Estilos base da página web

│   │   └── modal.css           # Estilos dos modais, botões e formulários

│   └── js/

│       └── main.js             # Lógica CRUD + autenticação da interface via fetch()

├── src/

│   ├── server.js               # Ponto de entrada — app.listen()

│   ├── app.js                  # Configuração do Express e montagem das rotas

│   ├── config/

│   │   ├── database.js         # Conexão com o MongoDB Atlas

│   │   └── swagger.js          # Configuração do swagger-jsdoc (schemas, security scheme)

│   ├── controllers/

│   │   ├── authController.js   # Registro e login

│   │   ├── gameController.js

│   │   ├── reviewController.js

│   │   └── webController.js

│   ├── services/

│   │   ├── gameService.js      # Lógica de negócio dos games

│   │   └── reviewService.js    # Lógica de negócio das reviews + permissões de dono

│   ├── repositories/

│   │   ├── gameRepository.js   # Acesso ao banco — games

│   │   ├── reviewRepository.js # Acesso ao banco — reviews

│   │   └── userRepository.js   # Acesso ao banco — usuários

│   ├── routes/

│   │   ├── authRoutes.js

│   │   ├── gameRoutes.js

│   │   ├── reviewRoutes.js

│   │   └── webRoutes.js

│   ├── middlewares/

│   │   ├── errorMiddleware.js          # Tratamento centralizado de erros

│   │   ├── authMiddleware.js           # Valida o JWT (autenticar)

│   │   └── authorizationMiddleware.js  # Valida a role (autorizar)

│   ├── validators/

│   │   ├── authValidator.js

│   │   ├── gameValidator.js

│   │   └── reviewValidator.js

│   ├── models/

│   │   ├── gameModel.js

│   │   ├── reviewModel.js

│   │   └── userModel.js

│   ├── dtos/

│   │   ├── gameDto.js          # Formata a saída dos games

│   │   └── reviewDto.js        # Formata a saída das reviews

│   └── views/

│       ├── layouts/

│       │   └── main.pug        # Layout base HTML

│       └── games.pug           # Estrutura da interface interativa + modal de login

├── seed.js                     # Script para popular o banco com dados de teste

├── generate-hash.js            # Utilitário para gerar hashes bcrypt manualmente

├── .env                        # MONGO_URI e JWT_SECRET (não versionado)

└── package.json

---

## 📦 Padrões de Resposta

Todas as respostas de erro seguem o formato:

```json
{
  "sucesso": false,
  "mensagem": "Descrição do erro."
}
```

| Código | Situação |
|---|---|
| `200` | Sucesso em leitura ou atualização |
| `201` | Recurso criado com sucesso |
| `204` | Recurso deletado (sem corpo) |
| `400` | Erro de validação |
| `401` | Não autenticado (token ausente, inválido ou expirado) |
| `403` | Sem permissão para realizar a ação |
| `404` | Recurso não encontrado |
| `409` | Conflito (ex: login já em uso, review duplicada do mesmo usuário) |
| `500` | Erro interno do servidor |

---