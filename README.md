# Bradar Cinema Project

## Introdution
The main project - "Bradar Cinema" website. Based on the Apollo Kino. Made by Samir 'Miles Tails' Cibis, Aleksander 'ThePanshurup' Kartuzov and Daniel Helmrosin.

This document shows which stackes are used for the project and features which will be added to the project.

You can view the guide how to run a project below or separatly in the `guide.md`.

You can see the update logs in the `update-log.md`.

## Stacks used:
- Node.js
- NestJS
- MikroORM
- MySQL 8.4
- Vue 3 + Vite
- PrimeVue

## What already works:
- NestJS backend starts on port 3000.
- MySQL runs with Docker Compose.
- MikroORM connects to MySQL and creates/uses the `movie` table.
- Backend seeds five demo movies on first start.
- `GET /movies` returns movies from MySQL.
- Vue + PrimeVue frontend loads those movies from the backend and displays them as cards.


## Feature list:
- Movie list
- Seat picker
- movie detail view
- link to your ticket
- Club benefits
- Dark & Light themes
- Ads (+ No ads subscription) -- later or unnecessary
- Account system and customization --later or unnecessary // extreme mode
- Sales and account bonuses --later or unnecessarys
- Different languages --later or unnecessary // hard mode

## How to run a project:

### 1. Database folder
```bash or VSC terminal
    docker compose up -d
```

### 2. Backend folder
```bash or VSC terminal
    cd backend
    npm run dev
```

### 3. Frontend folder
```bash or VSC terminal
    cd frontend
    npm run dev
```

### Attention!
1. Open the Docker Desktop app before the project initialization
2. Activate every folder in different terminals (Recommended)
3. If the frontend or backend node.js structure doesn't exist, you can recover it writing `npm install` command in the terminal

Sigma