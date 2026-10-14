@echo off

docker compose up -d

start "backend" cmd /k "cd /d backend && npm run dev"
start "frontend" cmd /k "cd /d frontend && npm run dev"
cls
echo Starting the application... (c) Samir Cibis, Aleksander Kartuzov and Daniel Helmrosin. All rights reserved.
sleep 5
echo http://localhost:5173/
exit
