# How to run a project as developer:

## 1. Database folder
```bash or VSC terminal
    docker compose up -d
```

## 2. Backend folder
```bash or VSC terminal
    cd backend
    npm run dev
```

## 3. Frontend folder
```bash or VSC terminal
    cd frontend
    npm run dev
```


# How to run a build / regular user side:

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



# How to manage movies and generate them in one second:
The movies already in the project are kept unchanged. To create or refresh its random movie set, open a terminal in the `backend` folder and run in new terminal or powershell: `npm run movies:generate`

As a developer, service or as a admin, you can simply change, add or delete movie in visual editor in project's developer mode. 

To run developer mode is literally npm run dev (Guide #How to run project as developer) and then in main page you can find the Add Movie button and also if you want to edit the movie, below the movie's description there is a button Edit Movie, so there you can edit everything and delete the movie, if it is necessary for the company and the administrator. 


