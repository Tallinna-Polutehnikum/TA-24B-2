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
3. If the frontend or backend node.js structure doesn't exist or work, you can recover it writing `npm install` command in the terminal
4. To turn off the project, write `docker compose down` command in the terminal

## Manage Faker movies
The movies already in the project are kept unchanged. To create or refresh its random movie set, open a terminal in `backend` and run in new terminal or powershell: `npm run movies:generate`

The command prints the generated titles and poster URLs. Posters and banners are random Picsum images, so an internet connection is required; they are not official movie artwork. Refresh the frontend page to see the updated list. Get a movie's `id` from `GET http://localhost:3000/movies`.

The generation command creates or updates a rating and three creator credits for each active movie, exactly four cinema buildings, and two screenings per active movie. Backend startup creates the SQL tables but does not generate this data.

To view the generated records in MySQL, connect to `apollo_kino` and run:
```sql
SELECT * FROM movie_rating;
SELECT * FROM creator;
SELECT * FROM movie_creator;
SELECT * FROM cinema_building;
SELECT * FROM screening;
```

To see films together with their ratings, creators, buildings, and screening times:
```sql
SELECT m.title, r.score, c.name AS creator, mc.role,
       b.name AS cinema, s.starts_at
FROM movie AS m
LEFT JOIN movie_rating AS r ON r.movie_id = m.id
LEFT JOIN movie_creator AS mc ON mc.movie_id = m.id
LEFT JOIN creator AS c ON c.id = mc.creator_id
LEFT JOIN screening AS s ON s.movie_id = m.id
LEFT JOIN cinema_building AS b ON b.id = s.building_id
ORDER BY m.id, s.starts_at;
```

Only Faker-generated movies can be changed or removed through these routes. The automatic Faker set is replaced only when you run `npm run movies:generate` or call `POST /movies/regenerate`. Movies added with `POST /movies` are kept separately.

Sigma