# Bradar Cinema Project

## Introduction
The main project - "Bradar Cinema" website. Based on the Apollo Kino. Made by Samir 'Miles Tails' Cibis, Aleksander 'ThePanshurup' Kartuzov and Daniel Helmrosin.

This document shows which stackes are used for the project and features which will be added to the project.

You can view the guide how to run a project below or separatly in the `guide.md`.

You can see the update logs in the `update-log.md`.

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
- Backend seeds five demo movies on first start.
- `GET /movies` returns movies from MySQL.
- Vue + PrimeVue frontend loads those movies from the backend and displays them as cards.

## Feature list
- Movie list
- Seat picker
- Checkout
- movie detail view
- link to your ticket
- Club benefits
- Dark & Light themes
- Ads (+ No ads subscription) -- later or unnecessary
- Account system and customization --later or unnecessary // extreme mode
- Sales and account bonuses --later or unnecessarys
- Different languages --later or unnecessary // hard mode

------------------------------------------------------------------------

## How to run a project as developer (Manual Startup):

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

## How to run a project as developer (Launcher Startup):
To run developer mode, open `start.bat` file and choose 'Developer Mode' 

------------------------------------------------------------------------

## How to run a build / regular user side (Manual Startup):

### 1. Backend folder
```bash in backend folder:
    cd ..\kinoproject\backend
    npm run build
    $env:NODE_ENV="production"
    npm start
```

### 2. Frontend folder
```bash in frontend folder:
    cd ..\kinoproject\frontend
    npm run build
    npm run preview
```

## How to run a build / regular user side (Launcher Startup):
To run build mode, open `start.bat` file and choose 'Build Mode' 

------------------------------------------------------------------------

## Attention!
1. If you're using the manual startup open the Docker Desktop app before!
2. If you're using the launcher startup DON'T close frontend & backend terminals which appearing after choosing mode!
3. If the frontend or backend node.js structure doesn't exist or work, you can recover it writing `npm install` command in the terminal

------------------------------------------------------------------------

## How to manage movies and generate them in one second:
The movies already in the project are kept unchanged. To create or refresh the random movie set and generate any missing screenings for movies added in the editor, open a terminal in the backend folder and run in new terminal or powershell: `npm run movies:generate`.

As a developer, service or as a admin, you can simply change, add or delete movie in visual editor in project's developer mode. 

To run developer mode is literally npm run dev (Guide #How to run project as developer) and then in main page you can find the Add Movie button and also if you want to edit the movie, below the movie's description there is a button Edit Movie, so there you can edit everything and delete the movie, if it is necessary for the company and the administrator.