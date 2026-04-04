# Recipes API

[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24+-339933?logo=node.js)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-000000?logo=fastify)](https://fastify.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47a248?logo=mongodb)](https://www.mongodb.com/)

A RESTful API for managing recipes, built with Fastify, MongoDB, and TypeScript. Features JWT authentication, rate limiting, security headers, and Swagger documentation.

## Features

- **JWT Authentication** — Register, login with bcrypt password hashing
- **Rate Limiting** — IP-based, configurable per-route limits
- **Security Headers** — HSTS, X-Frame-Options, X-Content-Type-Options via Helmet
- **Swagger UI** — Interactive API documentation at `/docs`
- **Favorites System** — Users can favorite recipes
- **Comments** — Add comments to recipes
- **Pagination** — All list endpoints support pagination
- **Docker Compose** — MongoDB + Mongo Express for local development

## Tech Stack

| Category       | Technology             |
| -------------- | ---------------------- |
| Runtime        | Node.js (ESM, ES2024)  |
| Framework      | Fastify 5.x            |
| Database       | MongoDB 8 + Mongoose 9 |
| Validation     | Zod 4                  |
| Authentication | JWT + bcrypt           |
| API Docs       | Swagger/OpenAPI        |
| Linting        | Biome 2.x              |
| Package Mgr    | pnpm (workspaces)      |

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 10+
- Docker & Docker Compose (for MongoDB)

### Installation

```bash
# Clone the repository
git clone https://github.com/t-oma/recipes-mfvn.git
cd recipes-mfvn

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start MongoDB with Docker Compose
docker compose up -d

# Start the development server
pnpm dev:backend
```

The API will be available at `http://localhost:3000`.
Interactive documentation available at [`/docs`](http://localhost:3000/docs).

## Environment Variables

| Variable                   | Type   | Default       | Required | Description                          |
| -------------------------- | ------ | ------------- | -------- | ------------------------------------ |
| `NODE_ENV`                 | string | `development` | No       | Environment (development/production) |
| `PORT`                     | number | `3000`        | No       | Server port                          |
| `HOST`                     | string | `0.0.0.0`     | No       | Server host                          |
| `MONGO_URI`                | string | —             | Yes      | MongoDB connection string            |
| `JWT_SECRET`               | string | —             | Yes      | JWT signing secret                   |
| `JWT_EXPIRES_IN`           | string | `7d`          | No       | JWT expiration time                  |
| `RATE_LIMIT_AUTH_MAX`      | number | `5`           | No       | Max auth requests per window         |
| `RATE_LIMIT_AUTH_WINDOW`   | string | `3 minutes`   | No       | Auth rate limit window               |
| `RATE_LIMIT_GLOBAL_MAX`    | number | `100`         | No       | Max global requests per window       |
| `RATE_LIMIT_GLOBAL_WINDOW` | string | `1 minute`    | No       | Global rate limit window             |

## Development

### Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `pnpm dev:backend`   | Start dev server with hot reload |
| `pnpm build:backend` | Build for production             |
| `pnpm lint`          | Typecheck + Biome lint           |
| `pnpm check`         | Biome lint (read-only)           |
| `pnpm check:fix`     | Biome lint with auto-fix         |
| `pnpm format`        | Format code with Biome           |

## Docker

The `compose.yaml` includes:

| Service         | Image         | Port  | Purpose            |
| --------------- | ------------- | ----- | ------------------ |
| `mongodb`       | mongo:8       | 27017 | MongoDB database   |
| `mongo-express` | mongo-express | 8081  | Web UI for MongoDB |

### Usage

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Remove volumes (clean slate)
docker compose down -v
```

Mongo Express will be available at `http://localhost:8081`.
