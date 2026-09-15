# Apollo Kino — first milestone

This is the first small working part of the school project.

## Stack
- Node.js
- NestJS
- MikroORM
- MySQL 8.4
- Vue 3 + Vite
- PrimeVue

## What already works
- NestJS backend starts on port 3000.
- MySQL runs with Docker Compose.
- MikroORM connects to MySQL and creates/uses the `movie` table.
- Backend seeds five demo movies on first start.
- `GET /movies` returns movies from MySQL.
- Vue + PrimeVue frontend loads those movies from the backend and displays them as cards.

## Start

### 1. Database
```bash
docker compose up -d
```

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend
In another terminal:
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

The first milestone intentionally does not contain authentication, seat selection or payment yet. Those are the next modules and can be added without replacing this structure.
