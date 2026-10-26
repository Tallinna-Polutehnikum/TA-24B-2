# Bradar Cinema Kinoprojekt

## Introduction
The main project - **Bradar Cinema** website. Based on the Apollo Kino. Made by Samir 'Miles Tails' Cibis, Aleksander 'ThePanshurup' Kartuzov and Daniel Helmrosin.

This document shows which stacks were used in this project, what already works, feature list and guide how to run a project below.

You can see update logs in the `update-log.md` file.

Below you can see guides how to install & run a project.

## Stacks used
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
- Backend seeds 6 built-in movies and 3 built-in banners on the main page.
- `GET /movies` returns movies from MySQL.
- Vue + PrimeVue frontend loads those movies from the backend and displays them as cards.
- Faker generated movies generates with one command in the terminal and displays as card on the main page.
- On movie cards, user can see movie name, genre, duration, rating, description, casting and movie trailer by clicking "Movie details" button. There is also the "Choose showtime" button which leads to the "Buy tickets" page.
- On the "Buy tickets" page, user chooses a movie, then chooses cinema, date, screening (time, hall number & language) and seat/-s in the hall. After choosing all, opens a checkout, where user can see all chosen data.
- In the developer mode (npm run dev) there are edit/add/delete buttons for movies and banners on the main page for admins usage. Also on the "Buy tickets" page, there is edit occupied seats button for seats in the current screening for admins.

## Feature list

### Done
- Movie list with movie cards
- Slidable movie banners on the top page
- Screening booking and seat picker
- Option to edit/add/delete movies & banners in the dev mode
- Option to edit occupied seats in the current screening in the dev mode
- Screenings scheludes
- Dark & Light themes

### Undone or unknown
- Checkout and ticket/-s payment
- Sending ticket/-s on e-mail or QR-code
- Bradar club benefits
- Movie lists for movie genres
- Different languages
- Account system and customization

------------------------------------------------------------------------

## How to install a project:

### 1. Database environment installation (MySQL 8.4 - Docker Compose)

Install 'Docker Desktop' app onto your computer.
When Docker engine is running the 'TA-24B-2' container should appear here.

### 2. Backend environment installation (Node.js)

Install Node.js (including npm) onto your computer.

### 3. Backend installation (MicroORM, NestJS)
```bash or VSC terminal
    cd backend
    npm ci
```

### 4. Frontend installation (Vue 3 + Vue, PrimeVue)
```bash or VSC terminal
    cd frontend
    npm ci
```

------------------------------------------------------------------------

## How to run a project in dev mode:

### 1. Database container
```bash or VSC terminal
    docker compose up -d --wait
```

### 2. Backend folder
```bash or VSC terminal
    cd backend
    $env:ALLOW_EDITING="true"
    npm run dev
```

### 3. Frontend folder
```bash or VSC terminal
    cd frontend
    npm run dev
```

### Launcher Startup on Windows:

To run developer mode, open `start.bat` file or write `.\start.bat` command and choose 'Developer Mode'

### Launcher Startup on Linux:

To run developer mode, open `start.sh` file and choose 'Developer Mode'

### Launcher Startup on MacOC:

To run developer mode, open `start.command` file and choose 'Developer Mode'

-------------------------------------------------------------------------

## How to run a project in build mode (regular user side):

### 1. Database container
```bash or VSC terminal
    docker compose up -d --wait
```

### 2. Backend folder
```bash in backend folder:
    cd ..\TA-24B-2\backend
    npm run build
    $env:NODE_ENV="production"
    npm start
```

### 3. Frontend folder
```bash in frontend folder:
    cd ..\TA-24B-2\frontend
    npm run build
    npm run preview
```

### Launcher Startup:

To run build mode, open `start.bat` file or write `.\start.bat` command and choose 'Build Mode' 

### Launcher Startup on Linux:

To run developer mode, open `start.sh` file and choose 'Build Mode'

### Launcher Startup on MacOC:

To run developer mode, open `start.command` file and choose 'Build Mode'

------------------------------------------------------------------------

## Attention!
1. Start Docker before running the backend or frontend manually. Use `docker compose up -d --wait` so MySQL is ready before the backend connects.
2. If you're using the launcher startup do not close frontend & backend terminals, which appearing after choosing mode!
3. For manual startup, install dependencies in both `backend` and `frontend` with `npm ci`. If dependencies later become damaged, rerun `npm ci` in the affected folder.

------------------------------------------------------------------------

## How to generate new faker movies:

The project has 6 built-in movies, but you can generate some faker movies on the movie list. To create or refresh the random movie set and generate any missing screenings for movies, open a new terminal, select backend folder `cd backend` and write `npm run movies:generate` command here.

In the developer mode, you can simply edit or delete faker movies. They work as same as built-in movies on the main page.