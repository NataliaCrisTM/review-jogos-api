# 🎮 Game Collection API

Uma API RESTful para gerenciar sua coleção pessoal de jogos e reviews, construída com Node.js e Express. Inclui interface web renderizada no servidor para visualizar sua biblioteca.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Rotas da API](#-rotas-da-api)
- [Exemplos de Requisições](#-exemplos-de-requisições)
- [Regras de Negócio](#-regras-de-negócio)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Padrões de Resposta](#-padrões-de-resposta)

---

## 💡 Sobre o Projeto

O Game Collection API permite catalogar jogos com informações como plataforma, gênero e status de progresso (`na fila`, `jogando`, `zerado`, `abandonado`). Cada jogo pode ter **uma review** associada, com nota, comentário e horas jogadas.

Além dos endpoints JSON, o projeto conta com uma página web em `/games-view` que exibe a coleção completa com suas reviews em cards estilizados.

---


## 🏗 Arquitetura

O projeto segue uma arquitetura em camadas com fluxo unidirecional de dados:

```
Requisição → Rota → Validator → Controller → Service → Repository → lowdb (db.json)
```

Cada camada tem uma responsabilidade única:

- **Routes** — mapeiam URLs para controllers
- **Validators** — validam o payload antes de chegar ao controller
- **Controllers** — orquestram a requisição e chamam o service
- **Services** — contêm toda a lógica de negócio e lançam erros com `statusCode`
- **Repositories** — único ponto de acesso ao banco de dados
- **DTOs** — formatam o objeto antes de enviar ao cliente
- **ErrorMiddleware** — captura todos os erros em um único lugar

---

## ✅ Pré-requisitos

- **Node.js** v18 ou superior
- **npm** v8 ou superior

---

## 🚀 Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/game-collection-api.git

# 2. Entre na pasta
cd game-collection-api

# 3. Instale as dependências
npm install

# 4. Inicie o servidor
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

> O arquivo `db.json` é criado automaticamente na raiz do projeto na primeira execução.

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia com `--watch` (reinicia ao salvar) |
| `npm start` | Inicia em modo produção |

---

## 💻 Como Usar

Após iniciar o servidor, você tem acesso a:

| Interface | URL |
|---|---|
| API Games | `http://localhost:3000/api/games` |
| API Reviews | `http://localhost:3000/api/reviews` |
| Página Web | `http://localhost:3000/games-view` |

Use o [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/) ou `curl` para interagir com a API.

---

## 📡 Rotas da API

### 🕹 Games — `/api/games`

| Método | Rota | Descrição | Status |
|---|---|---|---|
| `GET` | `/api/games` | Lista todos os jogos | `200` |
| `GET` | `/api/games/:id` | Busca um jogo por ID | `200` |
| `POST` | `/api/games` | Cria um novo jogo | `201` |
| `PUT` | `/api/games/:id` | Atualiza um jogo completo | `200` |
| `DELETE` | `/api/games/:id` | Remove o jogo e sua review | `204` |

### ⭐ Reviews — `/api/reviews`

| Método | Rota | Descrição | Status |
|---|---|---|---|
| `GET` | `/api/reviews` | Lista todas as reviews | `200` |
| `GET` | `/api/reviews/:id` | Busca uma review por ID | `200` |
| `GET` | `/api/reviews/game/:gameId` | Busca a review de um jogo | `200` |
| `POST` | `/api/reviews` | Cria uma review | `201` |
| `PUT` | `/api/reviews/:id` | Atualiza uma review | `200` |
| `DELETE` | `/api/reviews/:id` | Remove uma review | `204` |

### 🌐 Web

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/games-view` | Exibe a coleção em HTML |

---

## 📝 Exemplos de Requisições

### Criar um jogo

```http
POST /api/games
Content-Type: application/json

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
  "id": "a3f1c2d4-...",
  "titulo": "The Witcher 3",
  "plataforma": "PC",
  "genero": "RPG",
  "status": "zerado",
  "dataAdicionado": "2025-01-15T10:30:00.000Z"
}
```

---

### Criar uma review

```http
POST /api/reviews
Content-Type: application/json

{
  "gameId": "a3f1c2d4-...",
  "nota": 9.5,
  "comentario": "Obra-prima absoluta. História envolvente e mundo imenso.",
  "horasJogadas": 120
}
```

**Resposta `201`:**
```json
{
  "id": "b7e2d1f5-...",
  "gameId": "a3f1c2d4-...",
  "nota": 9.5,
  "comentario": "Obra-prima absoluta. História envolvente e mundo imenso.",
  "horasJogadas": 120,
  "dataCriacao": "2025-01-15T11:00:00.000Z"
}
```

---

### Atualizar um jogo

```http
PUT /api/games/a3f1c2d4-...
Content-Type: application/json

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

## 📐 Regras de Negócio

- **Review única por jogo** — cada game pode ter no máximo uma review. Uma segunda tentativa retorna `409 Conflict`.
- **Cascata ao deletar** — ao remover um game, sua review é deletada automaticamente.
- **gameId imutável** — o campo `gameId` de uma review não pode ser alterado via `PUT`.
- **Campos gerados automaticamente** — `id`, `dataAdicionado` e `dataCriacao` são gerados pelo servidor e ignorados caso enviados pelo cliente.

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
- `gameId` — UUID válido de um game existente
- `nota` — número entre `0` e `10`
- `comentario` — obrigatório, mínimo 10 caracteres
- `horasJogadas` — número maior ou igual a `0`

---

## 📁 Estrutura de Pastas

```
/
├── public/
│   └── css/
│       └── style.css           # Estilos da página web
├── src/
│   ├── server.js               # Ponto de entrada — app.listen()
│   ├── app.js                  # Configuração do Express
│   ├── config/
│   │   └── database.js         # Instância única do lowdb
│   ├── controllers/
│   │   ├── gameController.js
│   │   ├── reviewController.js
│   │   └── webController.js
│   ├── services/
│   │   ├── gameService.js      # Lógica de negócio dos games
│   │   └── reviewService.js    # Lógica de negócio das reviews
│   ├── repositories/
│   │   ├── gameRepository.js   # Acesso ao banco — games
│   │   └── reviewRepository.js # Acesso ao banco — reviews
│   ├── routes/
│   │   ├── gameRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── webRoutes.js
│   ├── middlewares/
│   │   ├── errorMiddleware.js  # Tratamento centralizado de erros
│   │   ├── gameValidator.js
│   │   └── reviewValidator.js
│   ├── dtos/
│   │   ├── gameDto.js          # Formata a saída dos games
│   │   └── reviewDto.js        # Formata a saída das reviews
│   └── views/
│       ├── layouts/
│       │   └── main.pug        # Layout base HTML
│       └── games.pug           # Página da coleção
├── db.json                     # Banco de dados (gerado automaticamente)
└── package.json
```

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
| `404` | Recurso não encontrado |
| `409` | Conflito (ex: review duplicada) |
| `500` | Erro interno do servidor |

---

<div align="center">
  <sub>Feito com ☕ e Node.js</sub>
</div>
