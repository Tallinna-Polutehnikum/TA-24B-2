# How to run a project:

## 1. Database folder
```bash or VSC terminal
    docker compose up -d
```

## 2. Backend folder
```bash or VSC terminal
    cd backend
    npm run dev
```

### Manage Faker movies
The movies already in the project are kept unchanged. Faker creates its initial movies on startup; later edits persist across restarts. Get a movie's `id` from `GET http://localhost:3000/movies`.

| Action | Request | JSON body |
| --- | --- | --- |
| Add a Faker movie | `POST /movies` | `{}` or `{"title":"My Movie"}` |
| Change a movie, including its title | `PATCH /movies/:id` | `{"title":"New Title"}` |
| Remove a Faker movie | `DELETE /movies/:id` | none |
| Regenerate the configured Faker set | `POST /movies/regenerate` | none |

Only Faker-generated movies can be changed or removed through these routes. Regenerating intentionally replaces the configured Faker set, including edited titles. Movies added with `POST /movies` are kept separately and are not replaced by regeneration.

Set the size and repeatable seed for the generated set in `backend/.env`:
```env
MOVIE_COUNT=12
MOVIE_SEED=43
```
After changing `MOVIE_SEED`, call `POST /movies/regenerate` to create the new set. These write routes have no authentication, so keep the backend local and do not expose it to the internet.

## 3. Frontend folder
```bash or VSC terminal
    cd frontend
    npm run dev
```

## Attention!
1. Open the Docker Desktop app before the project initialization
2. Activate every folder in different terminals (Recommended)
3. If the frontend or backend node.js structure doesn't exist, you can recover it writing `npm install` command in the terminal