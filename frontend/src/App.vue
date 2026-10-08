<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import { getMovies, updateMovie } from './services/api';
import poster1 from './assets/poster1.jpg';
import poster2 from './assets/poster2.jpg';
import poster3 from './assets/poster3.jpg';
import poster4 from './assets/poster4.jpg';
import poster5 from './assets/poster5.jpg';
import poster6 from './assets/poster6.jpg'; 
import banner from './assets/banner1.jpg';
import seatpicker from './seatpicker.vue';

const movies = ref([]);
const loading = ref(true);
const error = ref('');
const showSeatPicker = ref(false);
const selectedMovie = ref(null);
const selectedMovieIndex = ref(0);
const previousBodyOverflow = ref('');
const editingMovie = ref(false);
const savingMovie = ref(false);
const movieSaveError = ref('');
const movieForm = ref(null);
const canEditMovies = import.meta.env.DEV;
const posters = [poster1, poster2, poster3, poster4, poster5, poster6];

const trailerIds = {
  'Crime Patrol 2: Drug Wars': 'qZ5h9foGi24',
  'Rain Man': 'rrTQEP41NL4',
  'Pokémon: the First Movie': 'hX-NHafvY5I',
  '1917': 'UcmZN0Mbl04',
};

function getTrailerEmbedUrl(movie) {
  const id = trailerIds[movie.title];
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : '';
}

function getTrailerSearchUrl(movie) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} official trailer`)}`;
}

function openMovie(movie, index) {
  if (!selectedMovie.value) previousBodyOverflow.value = document.body.style.overflow;
  selectedMovie.value = movie;
  selectedMovieIndex.value = index;
  document.body.style.overflow = 'hidden';
}

function closeMovie() {
  selectedMovie.value = null;
  editingMovie.value = false;
  movieSaveError.value = '';
  document.body.style.overflow = previousBodyOverflow.value;
}

function startMovieEdit(movie) {
  movieForm.value = {
    title: movie.title,
    genre: movie.genre,
    duration: movie.duration,
    description: movie.description ?? '',
    posterUrl: movie.posterUrl ?? '',
    bannerUrl: movie.bannerUrl ?? '',
    ratingScore: movie.rating ? String(movie.rating.score) : '',
    ratingVoteCount: movie.rating ? String(movie.rating.voteCount) : '',
    creators: (movie.creators ?? []).map(({ name, role }) => ({ name, role })),
  };
  movieSaveError.value = '';
  editingMovie.value = true;
}

function addCreator() {
  movieForm.value.creators.push({ name: '', role: 'Director' });
}

async function saveMovieChanges() {
  if (!selectedMovie.value || !movieForm.value || savingMovie.value) return;
  savingMovie.value = true;
  movieSaveError.value = '';
  try {
    const form = movieForm.value;
    const ratingScore = String(form.ratingScore ?? '').trim();
    const changes = {
      title: form.title,
      genre: form.genre,
      duration: Number(form.duration),
      description: form.description,
      posterUrl: form.posterUrl,
      bannerUrl: form.bannerUrl,
      rating: ratingScore === ''
        ? null
        : { score: Number(ratingScore), voteCount: Number(form.ratingVoteCount) },
      creators: form.creators,
    };
    const updatedMovie = await updateMovie(selectedMovie.value.id, changes);
    movies.value = movies.value.map((movie) => movie.id === updatedMovie.id ? updatedMovie : movie);
    selectedMovie.value = updatedMovie;
    editingMovie.value = false;
  } catch (error) {
    movieSaveError.value = error instanceof Error ? error.message : 'Could not save movie changes.';
  } finally {
    savingMovie.value = false;
  }
}

function handleModalKeydown(event) {
  if (event.key === 'Escape' && selectedMovie.value) closeMovie();
}

function getPoster(movie, index) {
  if (movie.posterUrl?.startsWith('https://')) return movie.posterUrl;
  const posterName = movie.posterUrl?.split('/').pop();
  const posterIndex = posters.findIndex((poster) => posterName === `poster${posters.indexOf(poster) + 1}.jpg`);
  return posterIndex >= 0 ? posters[posterIndex] : posters[index % posters.length];
}

function handlePosterError(event, index) {
  event.target.src = posters[index % posters.length];
}

function formatScreeningTime(value) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

onMounted(async () => {
  window.addEventListener('keydown', handleModalKeydown);
  try { movies.value = await getMovies(); }
  catch (e) { error.value = 'Backend is not running yet. Start NestJS and refresh.'; }
  finally { loading.value = false; }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleModalKeydown);
  if (selectedMovie.value) document.body.style.overflow = previousBodyOverflow.value;
});
</script>

<template>
  <div class="page" id="bradarcinema.ee">
    <header class="topbar">
      <div class="brand">
        <a href="#bradarcinema.ee" class="logo" aria-label="Go to main screen" @click="showSeatPicker = false">BRADAR <span>CINEMA</span></a>
        <nav class="logo-actions" aria-label="Main navigation">
          <Button class="nav-button" as="a" href="#movies" label="Movies" size="small" text @click="showSeatPicker = false" />
          <Button class="nav-button" label="Theaters" size="small" text @click="showSeatPicker = true" />
          <Button class="nav-button" as="a" href="#about-us" label="About Us" size="small" text @click="showSeatPicker = false" />
          <Button class="nav-button" as="a" href="log-in" label="Log In" size="small" outlined />
        </nav>
      </div>
    </header>

    <main v-if="showSeatPicker">
      <seatpicker />
    </main>
    <main v-else>
      <section class="hero" :style="{ backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.9),rgba(0,0,0,.35)), url(${banner})` }">
        <div class="hero-copy">
          <Tag value="NOW IN THEATERS" severity="secondary" />
          <h1>Crime Patrol: The Amazing full FMV-movie</h1>
          <p>For only 9.99€</p>
          <Button label="See movies" icon="pi pi-play" @click="document.getElementById('movies').scrollIntoView({behavior:'smooth'})" />
        </div>
      </section>

      <section id="movies" class="content">
        <div class="section-heading"><div><h3>Top Movies</h3></div><span>{{ movies.length }} movies</span></div>
        <div v-if="loading" class="state">Loading movies from backend...</div>
        <div v-else-if="error" class="state error">{{ error }}</div>
        <div v-else class="grid">
          <Card v-for="(movie, index) in movies" :key="movie.id" class="movie-card clickable-card" @click="openMovie(movie, index)">
            <template #header><img :src="getPoster(movie, index)" :alt="movie.title" @error="handlePosterError($event, index)" /></template>
            <template #title>{{ movie.title }}</template>
            <template #subtitle>{{ movie.genre }} · {{ movie.duration }} min</template>
            <template #content>
              <p class="movie-description">{{ movie.description }}</p>
              <div class="movie-data">
                <div class="movie-data-group">
                  <span class="movie-data-label">Rating</span>
                  <strong v-if="movie.rating" class="movie-rating">
                    {{ Number(movie.rating.score).toFixed(1) }}/10
                    <span>{{ movie.rating.voteCount.toLocaleString() }} votes</span>
                  </strong>
                  <span v-else class="movie-data-empty">Not generated yet</span>
                </div>
                <div class="movie-data-group">
                  <span class="movie-data-label">Creators</span>
                  <div v-if="movie.creators?.length" class="movie-data-list">
                    <div v-for="creator in movie.creators" :key="creator.id" class="movie-data-item">
                      <strong>{{ creator.name }}</strong><span>{{ creator.role }}</span>
                    </div>
                  </div>
                  <span v-else class="movie-data-empty">Not generated yet</span>
                </div>
                <div class="movie-data-group">
                  <span class="movie-data-label">Showing at</span>
                  <div v-if="movie.screenings?.length" class="movie-data-list">
                    <div v-for="screening in movie.screenings" :key="screening.id" class="movie-data-item">
                      <strong>{{ screening.building }}</strong>
                      <span>{{ screening.address }}, {{ screening.city }}</span>
                      <span>{{ formatScreeningTime(screening.startsAt) }} · Hall {{ screening.hallNumber }} · €{{ Number(screening.ticketPrice).toFixed(2) }}</span>
                    </div>
                  </div>
                  <span v-else class="movie-data-empty">Not generated yet</span>
                </div>
              </div>
            </template>
            <template #footer>
              <div class="card-actions">
                <button class="details-button" type="button" @click.stop="openMovie(movie, index)">
                  <i class="pi pi-info-circle" aria-hidden="true"></i> Movie details
                </button>
                <button class="showtime" type="button" @click.stop>
                  <i class="pi pi-ticket" aria-hidden="true"></i> Choose showtime
                </button>
              </div>
            </template>
          </Card>
        </div>
      </section>

      <div v-if="selectedMovie" class="movie-modal-backdrop" @click.self="closeMovie">
        <article class="movie-modal" role="dialog" aria-modal="true" :aria-label="selectedMovie.title">
          <button class="modal-close" type="button" aria-label="Close movie details" @click="closeMovie">×</button>
          <form v-if="canEditMovies && editingMovie" class="movie-edit-form" @submit.prevent="saveMovieChanges">
            <h2>Edit movie</h2>
            <div class="edit-fields">
              <label>Title<input v-model="movieForm.title" required maxlength="160" /></label>
              <label>Genre<input v-model="movieForm.genre" required maxlength="80" /></label>
              <label>Duration (minutes)<input v-model.number="movieForm.duration" type="number" min="1" step="1" required /></label>
              <label>Poster URL<input v-model="movieForm.posterUrl" maxlength="500" /></label>
              <label>Banner URL<input v-model="movieForm.bannerUrl" maxlength="500" /></label>
              <label class="edit-full-width">Description<textarea v-model="movieForm.description" required maxlength="5000" rows="3"></textarea></label>
            </div>
            <fieldset class="edit-rating">
              <legend>Rating</legend>
              <label>Score / 10<input v-model="movieForm.ratingScore" type="number" min="0" max="10" step="0.1" /></label>
              <label>Vote count<input v-model="movieForm.ratingVoteCount" type="number" min="0" step="1" :required="movieForm.ratingScore !== ''" /></label>
              <span class="edit-hint">Leave the score empty to remove the rating.</span>
            </fieldset>
            <fieldset class="edit-creators">
              <legend>Creators</legend>
              <div v-for="(creator, creatorIndex) in movieForm.creators" :key="creatorIndex" class="creator-edit-row">
                <label>Name<input v-model="creator.name" required maxlength="160" /></label>
                <label>Role<input v-model="creator.role" required maxlength="80" /></label>
                <button class="remove-creator-button" type="button" aria-label="Remove creator" @click="movieForm.creators.splice(creatorIndex, 1)">Remove</button>
              </div>
              <button class="add-creator-button" type="button" @click="addCreator">+ Add creator</button>
            </fieldset>
            <p v-if="movieSaveError" class="edit-error" role="alert">{{ movieSaveError }}</p>
            <div class="edit-actions">
              <button class="details-button" type="button" :disabled="savingMovie" @click="editingMovie = false; movieSaveError = ''">Cancel</button>
              <button class="showtime" type="submit" :disabled="savingMovie">{{ savingMovie ? 'Saving…' : 'Save changes' }}</button>
            </div>
          </form>
          <template v-else>
            <button v-if="canEditMovies" class="edit-movie-button" type="button" @click="startMovieEdit(selectedMovie)">Edit movie</button>
            <div class="modal-layout">
              <img class="modal-poster" :src="getPoster(selectedMovie, selectedMovieIndex)" :alt="selectedMovie.title" @error="handlePosterError($event, selectedMovieIndex)" />
              <div class="modal-copy">
                <span class="modal-genre">{{ selectedMovie.genre }} · {{ selectedMovie.duration }} min</span>
                <h2>{{ selectedMovie.title }}</h2>
                <h3>About the movie</h3>
                <p class="modal-description">{{ selectedMovie.description || 'Description coming soon.' }}</p>
                <div class="modal-meta">
                  <div>
                    <span>Rating</span>
                    <strong v-if="selectedMovie.rating">
                      {{ Number(selectedMovie.rating.score).toFixed(1) }}/10
                      <small>{{ Number(selectedMovie.rating.voteCount).toLocaleString() }} votes</small>
                    </strong>
                    <span v-else class="modal-empty">Not generated yet</span>
                  </div>
                  <div>
                    <span>Creators</span>
                    <div v-if="selectedMovie.creators?.length" class="modal-creators">
                      <div v-for="creator in selectedMovie.creators" :key="creator.id">
                        <strong>{{ creator.name }}</strong><small>{{ creator.role }}</small>
                      </div>
                    </div>
                    <span v-else class="modal-empty">Not generated yet</span>
                  </div>
                </div>
              </div>
            </div>
            <section class="trailer-section">
              <h3>Trailer</h3>
              <div v-if="getTrailerEmbedUrl(selectedMovie)" class="trailer-frame">
                <iframe :src="getTrailerEmbedUrl(selectedMovie)" :title="`${selectedMovie.title} trailer`" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
              </div>
              <div v-else class="trailer-fallback">
                <p>A direct trailer is not set for this project movie.</p>
                <a :href="getTrailerSearchUrl(selectedMovie)" target="_blank" rel="noopener noreferrer"><i class="pi pi-youtube"></i> Find trailer on YouTube</a>
              </div>
            </section>
          </template>
        </article>
      </div>
    </main>
    <footer class="footer">
      <div class="fleft">Bradar Cinema · School project</div>
      <div class="fright">Copyright © 2026 Bradar Cinema. All rights reserved.</div>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Outfit:wght@415&display=swap');
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Outfit:wght@415&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

  body { 
    font-family: "DM Sans", sans-serif; 
    color: #f5f5f5; background: #090909; 
    margin: 0; 
    background: #090909; 
  } 
  button, .p-button { border-style: solid; }
  a { 
    color: #fff;
    text-decoration: none; 
  }
  .page { 
    min-height: 100vh; 
    background: radial-gradient(circle at 80% 0%, #222 0, #090909 40%); 
  }
  .topbar { 
    min-height: 104px; 
    display:flex; 
    align-items:center; 
    gap:28px;
    padding:0 6vw; 
    border-bottom:1px solid #292929; 
    position:sticky; 
    top:0; 
    z-index:10; 
    background:rgba(9,9,9,.92); 
    backdrop-filter:blur(12px); 
  }
  .brand {
    display:flex;
    flex-direction:column;
    align-items:flex-start;
    gap:12px;
  }
  .logo { 
    font-family: "Outfit", sans-serif;
    font-weight:900; 
    letter-spacing:.08em; 
    font-size:20px; 
    color:rgb(61, 119, 243);
    display:inline-block;
    cursor:pointer;
    transition:opacity .2s ease;
  }
  .logo:hover {
    opacity: .85;
  }
  .logo span { 
    font-weight:400; 
    color:#e2dfdf;
    font-style: normal;
  }
  nav { 
    display:flex; 
    gap:24px; 
    color:#bbb; 
    font-size:14px; 
  } 
  .logo-actions {
    gap:8px;
    align-items:center;
  }
  .nav-button {
    font-family: "DM Sans", sans-serif;
    min-height:22px;
    padding:10px 18px;
    font-size:28px;
    font-weight:900;
  }
  .topbar > .brand {
    margin-right:auto;
  }
  nav a:hover { 
    color:white; 
  }
  .hero {
    min-height:480px; 
    display:flex; 
    align-items:end; 
    padding:70px 6vw; 
    background-position:center;
    background-size:cover;
  }
  .hero-copy { 
    max-width:620px; 
  } 
  h1 { 
    font-size:clamp(42px,6vw,76px); 
    line-height:.95; 
    margin:18px 0; 
  } 
  .hero p { 
    color:#ccc; 
    max-width:520px; 
    margin-bottom:26px; 
  }
  .content { 
    padding:55px 6vw 80px; 
    max-width:1400px; 
    margin:auto; 
  } 
  .section-heading { 
    display:flex; 
    justify-content:space-between; 
    align-items:end; 
    margin-bottom:28px; 
  } 
  small { 
    color:#999; 
    letter-spacing:.15em; 
  } 
  h2 { 
    font-size:34px; 
    margin:5px 0 0; 
  } 
  .section-heading > span { 
    color:#888; 
  }
  .grid { 
    display:grid; 
    grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); 
    gap:22px; 
  } 
  .movie-card { 
    overflow:hidden; 
    background:#141414; 
    border:1px solid #6b6b6b;
    border-radius:10px;
  } 
  .movie-card img { 
    width: 100%;
    height:350px;
    object-fit:cover; 
    display:block; 
    border-radius: 10px;
  } 
  .movie-card p { 
    color:#aaa; 
    line-height:1.5; 
    min-height:68px; 
    text-align: center;
    padding: 5px;
  } 
  .movie-data {
    display:grid;
    gap:14px;
    margin-top:18px;
    font-size:13px;
  }
  .movie-data-group {
    display:grid;
    gap:6px;
  }
  .movie-data-label {
    color:#888;
    font-size:11px;
    text-transform:uppercase;
    text-align: center;
  }
  .movie-data-list, .movie-data-item {
    display:grid;
    gap:4px;
  }
  .movie-data-item {
    color:#aaa;
    line-height:1.4;
    text-align: center;
  }
  .movie-data-item strong {
    color:#eee;
    font-weight:600;
  }
  .movie-rating {
    color:#3285f1;
    text-align: center;
  }
  .movie-rating span {
    color:#999;
    font-size:12px;
    font-weight:400;
    text-align: center;
  }
  .movie-data-empty {
    color:#777;
  }
  .state { 
    padding:50px; 
    border:1px dashed #333; 
    text-align:center; 
    color:#aaa; 
  } 
  .error { 
    color:#f0a0a0; 
  } 
  .footer {
    color:#666;
    font-size:13px; 
    border-top:1px solid #222; 
    padding:25px 6vw;
    display:flex;
    justify-content:space-between;
    align-items:center;
  }
  .footerleft { 
    text-align:left; 
  }
  .footerright { 
    text-align:right; 
  }
  .showtime {
    padding: 10px 16px;
    border-radius: 24px;
    border: 3px solid #fff;
    background-color: #0a0a0a;
    color: rgb(248, 247, 247);
    cursor: pointer;
    transition: background-color .2s ease;
  }
  .showtime:hover {
    background-color: #fff;
    color:#070707;
    border-color: #fff;
  }
  .card-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    width: 100%;
  }
  .card-actions button {
    flex: 1 1 150px;
  }
  .details-button {
    padding: 10px 16px;
    border: 2px solid #fff;
    border-radius: 24px;
    background: #0a0a0a;
    color: #fff;
    cursor: pointer;
    transition: background-color .2s ease, color .2s ease;
  }
  .details-button:hover {
    background: #fff;
    color: #070707;
  }
  .movie-card .p-card-footer {
    display: flex;
    justify-content: center;
    padding: 12px 16px 18px;
  }
  .clickable-card {
    cursor: pointer;
    transition: transform .2s ease, border-color .2s ease;
  }
  .clickable-card:hover {
    transform: translateY(-4px);
    border-color: #555;
  }
  .movie-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0,0,0,.82);
    backdrop-filter: blur(8px);
  }
  .movie-modal {
    position: relative;
    width: min(980px, 100%);
    max-height: 90vh;
    overflow: auto;
    padding: 32px;
    border: 3px solid #333;
    border-radius: 10px;
    background: #111;
    box-shadow: 0 24px 80px rgba(0,0,0,.6);
  }
  .modal-close {
    position: absolute;
    top: 14px;
    right: 18px;
    z-index: 2;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 50%;
    background: #242424;
    color: #fff;
    font-size: 30px;
    cursor: pointer;
  }
  .modal-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 28px;
    align-items: start;
  }
  .modal-poster {
    width: 100%;
    height: 350px;
    object-fit: cover;
    border-radius: 14px;
  }
  .modal-copy h2 {
    margin: 6px 0 18px;
    font-size: 38px;
    overflow-wrap: anywhere;
  }
  .modal-copy h3, .trailer-section h3 {
    margin: 18px 0 10px;
    font-size: 20px;
  }
  .modal-genre, .modal-empty {
    color: #999;
  }
  .modal-description {
    color: #f1ecec;
    line-height: 1.7;
    font-size: 16px;
  }
  .modal-meta {
    display: grid;
    gap: 14px;
    margin-top: 18px;
  }
  .modal-meta > div {
    display: grid;
    grid-template-columns: 85px 1fr;
    gap: 10px;
    align-items: start;
  }
  .modal-meta > div > span:first-child {
    color: #888;
    font-size: 12px;
    text-transform: uppercase;
  }
  .modal-meta strong {
    color: #3285f1;
  }
  .modal-meta small {
    display: block;
    color: #999;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: normal;
  }
  .modal-creators {
    display: grid;
    gap: 8px;
  }
  .modal-creators strong {
    color: #eee;
  }
  .trailer-section {
    margin-top: 28px;
  }
  .trailer-frame {
    position: relative;
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
    border-radius: 14px;
    background: #000;
  }
  .trailer-frame iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
  .trailer-fallback {
    padding: 28px;
    border: 1px dashed #444;
    border-radius: 14px;
    color: #aaa;
    text-align: center;
  }
  .trailer-fallback a {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    margin-top: 8px;
    padding: 10px 16px;
    border-radius: 24px;
    background: rgb(61,119,243);
  }
  .edit-movie-button, .add-creator-button, .remove-creator-button {
    padding: 9px 14px;
    border: 1px solid #555;
    border-radius: 20px;
    background: #1b1b1b;
    color: #fff;
    cursor: pointer;
  }
  .edit-movie-button {
    margin: 0 0 22px;
  }
  .edit-movie-button:hover, .add-creator-button:hover, .remove-creator-button:hover {
    background: #292929;
  }
  .movie-edit-form h2 {
    margin: 0 52px 22px 0;
  }
  .edit-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .movie-edit-form label {
    display: grid;
    gap: 7px;
    color: #bbb;
    font-size: 13px;
  }
  .movie-edit-form input, .movie-edit-form textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;
    border: 1px solid #444;
    border-radius: 8px;
    background: #090909;
    color: #fff;
    font: inherit;
  }
  .movie-edit-form textarea {
    resize: vertical;
  }
  .edit-full-width {
    grid-column: 1 / -1;
  }
  .edit-rating, .edit-creators {
    display: grid;
    gap: 14px;
    margin: 22px 0 0;
    padding: 16px;
    border: 1px solid #333;
    border-radius: 10px;
  }
  .edit-rating {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .edit-rating legend, .edit-creators legend {
    padding: 0 8px;
    color: #ddd;
  }
  .edit-hint {
    grid-column: 1 / -1;
    color: #888;
    font-size: 12px;
  }
  .creator-edit-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 12px;
    align-items: end;
  }
  .add-creator-button {
    justify-self: start;
  }
  .edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  }
  .edit-actions button:disabled {
    cursor: wait;
    opacity: .6;
  }
  .edit-error {
    color: #ff9e9e;
    overflow-wrap: anywhere;
  }
 @media(max-width:700px){
    .topbar{padding:12px 20px}.brand{width:100%; flex-wrap:wrap; gap:6px 16px}.logo-actions{width:100%; flex-wrap:wrap; gap:4px}.hero{padding:50px 20px}.content{padding:40px 20px}.movie-card img{height:280px}.movie-modal-backdrop{padding:10px}.movie-modal{padding:20px}.modal-layout{grid-template-columns:1fr}.modal-poster{max-width:220px;height:310px}.modal-copy h2{font-size:30px}.modal-meta>div{grid-template-columns:75px 1fr}.edit-fields,.edit-rating{grid-template-columns:1fr}.edit-full-width,.edit-hint{grid-column:auto}.creator-edit-row{grid-template-columns:1fr 1fr}.remove-creator-button{grid-column:1 / -1;justify-self:start}
  }
</style>
