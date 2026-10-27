# Bradar Cinema Kinoprojekt

## Introduction
This project is the **Bradar Cinema** website, inspired by Apollo Kino. It was created by Samir 'Miles' Cibis, Aleksander 'ThePanshurup' Kartuzov and Daniel Helmrosin.

This document describes which stacks were used in this project, what already works, feature list and guides how to install and run a project below.

You can see update logs in the `update-log.md` file.

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
- MikroORM connects to MySQL and creates and uses the `movie` table.
- The backend seeds six built-in movies and three built-in banners for the main page.
- `GET /movies` returns movies from MySQL.
- The Vue and PrimeVue frontend loads movies from the backend and displays them as cards.
- Faker-generated movies can be created with a single terminal command and are displayed on the main page.
- Movie cards show each movie's title, genre, duration, rating, description, and cast. Click **Movie details** to view the trailer. The **Choose showtime** button opens the **Buy tickets** page.
- On the **Buy tickets** page, users choose a movie, cinema, date, screening (time, hall, and language) and seat/-s. The checkout displays the selected details.
- In developer mode (`npm run dev`), administrators can add, edit, and delete movies and banners on the main page. They can also edit occupied seats for a screening on the **Buy tickets** page.

## Feature list

### Done
- Movie list with movie cards
- Slideshow banners on the home page
- Screening selection and seat picker
- Options to add, edit and delete movies and banners in developer mode
- Option to edit occupied seats for a screening in developer mode
- Screening schedules
- Dark and light themes

### Undone or planned
- Checkout and ticket payments
- Sending tickets by email or as QR codes
- Bradar club benefits
- Movie lists by genre
- Different languages
- User accounts and customization

------------------------------------------------------------------------

## How to install the project

### 1. Set up the database (MySQL 8.4 with Docker Compose)

Install Docker Desktop on your computer.
Once the Docker engine is running, the `TA-24B-2` container should appear.

### 2. Install Node.js

Install Node.js, which includes npm.

### 3. Install backend dependencies (MikroORM and NestJS)
```bash or VSC terminal
    cd backend
    npm ci
```

### 4. Install frontend dependencies (Vue 3 and PrimeVue)
```bash or VSC terminal
    cd frontend
    npm ci
```

------------------------------------------------------------------------

## How to run the project in developer mode

### 1. Start the database
```bash or VSC terminal
    docker compose up -d --wait
```

### 2. Start the backend
```bash or VSC terminal
    cd backend
    $env:ALLOW_EDITING="true"
    npm run dev
```

### 3. Start the frontend
```bash or VSC terminal
    cd frontend
    npm run dev
```

### Launcher Startup on Windows

To start developer mode, open `start.bat` or run `.\start.bat`, then choose **Developer Mode**.

### Launcher Startup on Linux

To start developer mode, open `start.sh` and choose **Developer Mode**.

### Launcher Startup on macOS

To start developer mode, open `start.command` and choose **Developer Mode**.

-------------------------------------------------------------------------

## How to run the project in build mode (for regular users)

### 1. Start the database
```bash or VSC terminal
    docker compose up -d --wait
```

### 2. Build and start the backend
```bash in backend folder:
    cd ..\TA-24B-2\backend
    npm run build
    $env:NODE_ENV="production"
    npm start
```

### 3. Build and preview the frontend
```bash in frontend folder:
    cd ..\TA-24B-2\frontend
    npm run build
    npm run preview
```

### Launcher Startup on Windows

To start build mode, open `start.bat` or run `.\start.bat`, then choose **Build Mode**.

### Launcher Startup on Linux

To start build mode, open `start.sh` and choose **Build Mode**.

### Launcher Startup on macOS

To start build mode, open `start.command` and choose **Build Mode**.

------------------------------------------------------------------------

## Attention!
1. Start Docker before running the backend or frontend manually. Run `docker compose up -d --wait` to make sure MySQL is ready before the backend connects.
2. If you use a launcher, keep the backend and frontend terminal windows open after choosing a mode.
3. For manual startup, install dependencies in both `backend` and `frontend` with `npm ci`. If the dependencies become corrupted, rerun `npm ci` in the affected folder.

------------------------------------------------------------------------

## How to generate Faker movies

The project includes six built-in movies, and you can also generate Faker movies for the movie list. To create or refresh the generated movies and add any missing screenings, open a terminal, navigate to the backend folder with `cd backend` and run `npm run movies:generate`.

In the developer mode, you can simply edit or delete faker movies. They work as same as built-in movies on the main page.