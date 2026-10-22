# How to run a project as developer (Manual Startup):

## 1. Database folder
```bash or VSC terminal
    docker compose up -d
```

## 2. Backend folder
```bash or VSC terminal
    cd backend
    $env:ALLOW_EDITING="true"
    npm run dev
```

## 3. Frontend folder
```bash or VSC terminal
    cd frontend
    npm run dev
```

# How to run a project as developer (Launcher Startup):
To run developer mode, open `start.bat` file or write `.\start.bat` command and choose 'Developer Mode' 

------------------------------------------------------------------------

# How to run a build / regular user side (Manual Startup):

## 1. Backend folder
```bash in backend folder:
    cd ..\kinoproject\backend
    npm run build
    $env:NODE_ENV="production"
    npm start
```

## 2. Frontend folder
```bash in frontend folder:
    cd ..\kinoproject\frontend
    npm run build
    npm run preview
```

# How to run a build / regular user side (Launcher Startup):
To run build mode, open `start.bat` file or write `.\start.bat` command and choose 'Build Mode' 

------------------------------------------------------------------------

## Attention!
1. If you're using the manual startup open the Docker Desktop app before and run backend / frontend folders separatly in terminals!
2. If you're using the launcher startup DON'T close frontend & backend terminals which appearing after choosing mode!
3. If the frontend or backend node.js structure doesn't exist or work, you can recover it writing `npm install` command in the terminal

------------------------------------------------------------------------

# How to manage movies and generate them in one second:
The movies already in the project are kept unchanged. To create or refresh the random movie set and generate any missing screenings for movies added in the editor, open a terminal in the backend folder and run in new terminal or powershell: `npm run movies:generate`.

As a developer, service or as a admin, you can simply change, add or delete movie in visual editor in project's developer mode. 

To run developer mode is literally npm run dev (Guide #How to run project as developer) and then in main page you can find the Add Movie button and also if you want to edit the movie, below the movie's description there is a button Edit Movie, so there you can edit everything and delete the movie, if it is necessary for the company and the administrator.