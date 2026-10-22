<script setup>
import './App.css';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import { getMovies, updateMovie, createMovie, deleteMovie, uploadMoviePoster, getAssetUrl, getBanners, updateBanner, createBanner, deleteBanner, uploadBannerImage } from './services/api.js';
import poster1 from './assets/posters/poster1.jpg';
import poster2 from './assets/posters/poster2.jpg';
import poster3 from './assets/posters/poster3.jpg';
import poster4 from './assets/posters/poster4.jpg';
import poster5 from './assets/posters/poster5.jpg';
import poster6 from './assets/posters/poster6.jpg'; 
import banner from './assets/posters/banner1.jpg';
import seatpicker from './SeatPicker.vue';
import about_us from './AboutUs.vue';
import club from './Club.vue';

const movies = ref([]);
const selectedGenre = ref('');
const genreOptions = computed(() => [...new Set(movies.value.flatMap(movie => String(movie.genre || '').split(/[,/;|]/).map(genre => genre.trim()).filter(Boolean)))].sort((a, b) => a.localeCompare(b)));
const filteredMovies = computed(() => movies.value.filter(movie => !selectedGenre.value || String(movie.genre || '').split(/[,/;|]/).some(genre => genre.trim().toLocaleLowerCase() === selectedGenre.value.toLocaleLowerCase())));

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const error = ref('');
const showSeatPicker = computed(() => route.path === '/buy-tickets');
const showAboutUs = computed(() => route.path === '/about_us');
const showClub = computed(() => route.path === '/club');
const selectedMovie = ref(null);
const selectedMovieIndex = ref(0);
const previousBodyOverflow = ref('');
const editingMovie = ref(false);
const creatingMovie = ref(false);
const savingMovie = ref(false);
const deletingMovie = ref(false);
const movieSaveError = ref('');
const movieForm = ref(null);
const posterFileInput = ref(null);
const uploadingPoster = ref(false);
const canEditMovies = import.meta.env.DEV;
const selectedBanner = ref(null);
const editingBanner = ref(false);
const creatingBanner = ref(false);
const savingBanner = ref(false);
const deletingBanner = ref(false);
const uploadingBanner = ref(false);
const bannerSaveError = ref('');
const bannerForm = ref(null);
const bannerFileInput = ref(null);
const canEditBanners = import.meta.env.DEV;
const slides = ref([]);
const activeSlide = ref(0);
const posters = [poster1, poster2, poster3, poster4, poster5, poster6];
const theme = ref('dark');
let slideTimer;
let browserTheme;
let onBrowserThemeChange;

function setTheme(value) {
  theme.value = value;
  localStorage.setItem('bradar-theme', value);
  document.documentElement.setAttribute('data-theme', value);
}

function nextSlide(step = 1) {
  if (!slides.value.length) return;
  activeSlide.value = (activeSlide.value + step + slides.value.length) % slides.value.length;
}

function stepSlide(step) {
  nextSlide(step);
  restartSlideTimer();
}

function goToSlide(index) {
  activeSlide.value = index;
  restartSlideTimer();
}

function restartSlideTimer() {
  window.clearInterval(slideTimer);
  slideTimer = window.setInterval(() => nextSlide(), 5500);
}

function getTrailerEmbedUrl(movie) {
  if (!movie.trailerUrl) return '';
  let url;
  try {
    url = new URL(movie.trailerUrl);
  } catch {
    return '';
  }
  const supportedHosts = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com'];
  if (!['http:', 'https:'].includes(url.protocol) || !supportedHosts.includes(url.hostname)) return '';
  const id = url.hostname === 'youtu.be'
    ? url.pathname.split('/').filter(Boolean)[0]
    : url.searchParams.get('v') ?? url.pathname.split('/').filter(Boolean).at(-1);
  return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : '';
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
  creatingMovie.value = false;
  movieSaveError.value = '';
  document.body.style.overflow = previousBodyOverflow.value;
}

function startMovieCreate() {
  if (!selectedMovie.value) previousBodyOverflow.value = document.body.style.overflow;
  selectedMovie.value = { title: 'New movie', posterUrl: '' };
  selectedMovieIndex.value = 0;
  movieForm.value = {
    title: '',
    genre: '',
    duration: 90,
    description: '',
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
    ratingScore: '',
    ratingVoteCount: '',
    creators: [],
  };
  movieSaveError.value = '';
  creatingMovie.value = true;
  editingMovie.value = true;
  document.body.style.overflow = 'hidden';
}

function startBannerCreate() {
  if (!canEditBanners) return;
  selectedBanner.value = null;
  bannerForm.value = {
    title: '',
    subtitle: '',
    image: ''
  };
  bannerSaveError.value = '';
  creatingBanner.value = true;
  editingBanner.value = true;
}

function startMovieEdit(movie) {
  creatingMovie.value = false;
  movieForm.value = {
    title: movie.title,
    genre: movie.genre,
    duration: movie.duration,
    description: movie.description ?? '',
    posterUrl: movie.posterUrl ?? '',
    bannerUrl: movie.bannerUrl ?? '',
    trailerUrl: movie.trailerUrl ?? '',
    ratingScore: movie.rating ? String(movie.rating.score) : '',
    ratingVoteCount: movie.rating ? String(movie.rating.voteCount) : '',
    creators: (movie.creators ?? []).map(({ name, role }) => ({ name, role })),
  };
  movieSaveError.value = '';
  editingMovie.value = true;
}

function startBannerEdit(banner) {
  if (!canEditBanners) return;

  selectedBanner.value = banner;
  creatingBanner.value = false;
  bannerForm.value = {
    title: banner.title,
    subtitle: banner.subtitle ?? '',
    image: banner.image ?? ''
  };
  bannerSaveError.value = '';
  editingBanner.value = true;
}

function cancelMovieEdit() {
  if (creatingMovie.value) {
    closeMovie();
    return;
  }
  editingMovie.value = false;
  movieSaveError.value = '';
}

function cancelBannerEdit() {
  editingBanner.value = false;
  creatingBanner.value = false;
  selectedBanner.value = null;
  bannerSaveError.value = '';
}

function addCreator() {
  movieForm.value.creators.push({ name: '', role: 'Director' });
}

async function saveMovieChanges() {
  if ((!creatingMovie.value && !selectedMovie.value) || !movieForm.value || savingMovie.value || deletingMovie.value || uploadingPoster.value) return;
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
      trailerUrl: form.trailerUrl.trim(),
      rating: ratingScore === ''
        ? null
        : { score: Number(ratingScore), voteCount: Number(form.ratingVoteCount) },
      creators: form.creators,
    };
    if (creatingMovie.value) {
      const newMovie = await createMovie(changes);
      movies.value = [...movies.value, newMovie];
      if (creatingMovie.value) {
        selectedMovie.value = newMovie;
        selectedMovieIndex.value = movies.value.length - 1;
        creatingMovie.value = false;
      }
    } else {
      const updatedMovie = await updateMovie(selectedMovie.value.id, changes);
      movies.value = movies.value.map((movie) => movie.id === updatedMovie.id ? updatedMovie : movie);
      selectedMovie.value = updatedMovie;
    }
    editingMovie.value = false;
  } catch (error) {
    movieSaveError.value = error instanceof Error ? error.message : 'Could not save movie changes.';
  } finally {
    savingMovie.value = false;
  }
}

async function saveBannerChanges() {
  if (!bannerForm.value || savingBanner.value || deletingBanner.value || uploadingBanner.value) return;
  savingBanner.value = true;
  bannerSaveError.value = '';

  try {
    const changes = {
      title: bannerForm.value.title,
      subtitle: bannerForm.value.subtitle,
      image: bannerForm.value.image
    };

    if (creatingBanner.value) {
      const newBanner = await createBanner(changes);
      slides.value = [...slides.value, newBanner];
      activeSlide.value = slides.value.length - 1;
    } else {
      const updatedBanner = await updateBanner(selectedBanner.value.id, changes);
      slides.value = slides.value.map(banner => banner.id === updatedBanner.id ? updatedBanner : banner);
    }

    cancelBannerEdit();
    restartSlideTimer();
  } catch (error) {
    bannerSaveError.value = error instanceof Error ? error.message : 'Could not save banner.';
  } finally {
    savingBanner.value = false;
  }
}

async function removeMovie() {
  if (!selectedMovie.value || savingMovie.value || deletingMovie.value || uploadingPoster.value) return;
  const movie = selectedMovie.value;
  if (!window.confirm(`Delete "${movie.title}"?`)) return;
  deletingMovie.value = true;
  movieSaveError.value = '';
  try {
    await deleteMovie(movie.id);
    movies.value = movies.value.filter((entry) => entry.id !== movie.id);
    if (selectedMovie.value?.id === movie.id) closeMovie();
  } catch (error) {
    movieSaveError.value = error instanceof Error ? error.message : 'Could not delete movie.';
  } finally {
    deletingMovie.value = false;
  }
}

async function removeBanner() {
  if (!selectedBanner.value || deletingBanner.value || savingBanner.value || uploadingBanner.value) return;
  if (!confirm(`Delete "${selectedBanner.value.title}"?`)) return;
  deletingBanner.value = true;
  bannerSaveError.value = '';

  try {
    await deleteBanner(selectedBanner.value.id);
    slides.value = slides.value.filter(banner => banner.id !== selectedBanner.value.id);
    activeSlide.value = Math.min(activeSlide.value, Math.max(0, slides.value.length - 1));
    cancelBannerEdit();
    restartSlideTimer();
  } catch (error) {
    bannerSaveError.value = error instanceof Error ? error.message : 'Could not delete banner.';
  } finally {
    deletingBanner.value = false;
  }
}

async function uploadPoster(event) {
  const input = event.target;
  const file = input.files?.[0];
  const form = movieForm.value;
  input.value = '';
  if (!file || !form || uploadingPoster.value) return;
  uploadingPoster.value = true;
  movieSaveError.value = '';
  try {
    const uploadedPoster = await uploadMoviePoster(file);
    if (movieForm.value === form) form.posterUrl = uploadedPoster.posterUrl;
  } catch (error) {
    movieSaveError.value = error instanceof Error ? error.message : 'Could not upload poster.';
  } finally {
    uploadingPoster.value = false;
  }
}

async function uploadBanner(event) {
  const input = event.target;
  const file = input.files?.[0];
  const form = bannerForm.value;
  input.value = '';
  if (!file || !form || uploadingBanner.value) return;
  uploadingBanner.value = true;
  bannerSaveError.value = '';
  try {
    const uploaded = await uploadBannerImage(file);
    if (bannerForm.value === form) form.image = uploaded.image;
  } catch (error) {
    bannerSaveError.value = error instanceof Error ? error.message : 'Could not upload banner.';
  } finally {
    uploadingBanner.value = false;
  }
}

function handleModalKeydown(event) {
  if (event.key === 'Escape' && selectedMovie.value) closeMovie();
}

function getPoster(movie, index) {
  if (movie.posterUrl?.startsWith('https://') || movie.posterUrl?.startsWith('http://') || movie.posterUrl?.startsWith('/uploads/')) {
    return getAssetUrl(movie.posterUrl);
  }
  const posterName = movie.posterUrl?.split('/').pop();
  const posterIndex = posters.findIndex((poster) => posterName === `poster${posters.indexOf(poster) + 1}.jpg`);
  return posterIndex >= 0 ? posters[posterIndex] : posters[index % posters.length];
}

function handlePosterError(event, index) {
  event.target.src = posters[index % posters.length];
}

function getBannerImage(image) {
  const defaultImages = {
    '/banner1.jpg': banner,
    '/poster4.jpg': poster4,
    '/poster5.jpg': poster5,
  };
  return defaultImages[image] ?? getAssetUrl(image);
}

const selectedBookingMovie = ref(null)

function goHome() {
  router.push('/');
}

function goToMovies() {
  router.push({ path: '/', hash: '#movies' });
}

function openSeatPicker(movie = null) {
  selectedBookingMovie.value = movie;
  router.push('/buy-tickets');
}

function openAboutUs() {
  router.push('/about_us');
}

function openClub() {
  router.push('/club');
}

async function openCheckout(booking) {
  sessionStorage.setItem('pendingBooking', JSON.stringify(booking));
  await router.push('/checkout');
}

onMounted(async () => {
  window.addEventListener('keydown', handleModalKeydown);
  browserTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const saved = localStorage.getItem('bradar-theme');
  theme.value = saved === 'light' || saved === 'dark' ? saved : (browserTheme.matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme.value);
  onBrowserThemeChange = (event) => {
    if (!localStorage.getItem('bradar-theme')) {
      theme.value = event.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme.value);
    }
  };
  browserTheme.addEventListener('change', onBrowserThemeChange);
  restartSlideTimer();
  try { movies.value = await getMovies(), slides.value = await getBanners(); }
  catch (e) { error.value = 'Backend is not running yet. Start NestJS and refresh.'; }
  finally { loading.value = false; }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleModalKeydown);
  window.clearInterval(slideTimer);
  browserTheme?.removeEventListener('change', onBrowserThemeChange);
  if (selectedMovie.value) document.body.style.overflow = previousBodyOverflow.value;
});
</script>

<template>
  <div class="page" id="bradarcinema.ee">
    <header class="topbar">
      <div class="brand">
        <a href="/" class="logo" aria-label="Go to main screen" @click.prevent="goHome">BRADAR <span>CINEMA</span></a>
        <nav class="logo-actions" aria-label="Main navigation">
          <Button class="nav-button" :class="{ 'nav-active': !showSeatPicker && !showAboutUs && !showClub }" label="Movies" size="small" text @click="goToMovies" />
          <Button class="nav-button" :class="{ 'nav-active': showSeatPicker }" label="Buy tickets" size="small" text @click="openSeatPicker()" />
          <Button class="nav-button" :class="{ 'nav-active': showAboutUs }" label="About Us" size="small" text @click="openAboutUs()"/>
          <Button class="nav-button" :class="{ 'nav-active': showClub }" label="Bradar Club" size="small" text @click="openClub()"/>
        </nav>
        <button class="theme-toggle" type="button" :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'" @click="setTheme(theme === 'dark' ? 'light' : 'dark')">
          <i :class="theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'" aria-hidden="true"></i>
          {{ theme === 'dark' ? 'Light' : 'Dark' }} mode
        </button>
      </div>
    </header>
    <main v-if="route.meta.pageComponent">
      <component
        :is="route.meta.pageComponent"
        v-bind="route.meta.pageProps === 'booking' ? { movie: selectedBookingMovie, movies } : {}"
        v-on="route.meta.pageProps === 'booking' ? { close: goToMovies, checkout: openCheckout } : {}"
      />
    </main>
    <main v-else-if="showClubApplication">
      <club-application />
    </main>
    <main v-else>
      <section class="hero" aria-label="Featured movies">
        <Transition name="slide-fade">
          <div :key="activeSlide" class="hero-background" :style="{backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.9),rgba(0,0,0,.35)), url('${getBannerImage(slides[activeSlide]?.image)}')`}"></div>
        </Transition>
        <Transition name="text-fade" mode="out-in">
          <div :key="activeSlide" class="hero-copy" aria-live="polite">
            <Tag value="NOW IN THEATERS" severity="secondary" />
            <h1>{{ slides[activeSlide]?.title }}</h1>
            <p>{{ slides[activeSlide]?.subtitle }}</p>
            <Button class="see-movies-button" label="See movies" icon="pi pi-angle-down" @click="goToMovies" />
          </div>
        </Transition>
        <div class="banner-controls" aria-label="Banner controls">
          <button type="button" aria-label="Previous banner" @click="stepSlide(-1)"><i class="pi pi-chevron-left" aria-hidden="true"></i></button>
          <button
            v-for="(_, index) in slides"
            :key="index"
            type="button"
            class="banner-dot"
            :class="{ active: activeSlide === index }"
            :aria-label="`Show banner ${index + 1}`"
            :aria-current="activeSlide === index ? 'true' : undefined"
            @click="goToSlide(index)"
          ></button>
          <button type="button" aria-label="Next banner" @click="stepSlide(1)"><i class="pi pi-chevron-right" aria-hidden="true"></i></button>
          <button v-if="canEditBanners && slides.length" class="banner-edit-button" type="button" @click="startBannerEdit(slides[activeSlide])">Edit banner</button>
        </div>
      </section>
      <section id="movies" class="content">
        <div class="section-heading">
          <div><h3>Top Movies</h3></div>
          <div class="movie-heading-actions">
            <span>{{ filteredMovies.length }} of {{ movies.length }} movies</span>
            <button v-if="canEditBanners" class="edit-movie-button add-movie-button" type="button" @click="startBannerCreate">+ Add banner</button>
            <button v-if="canEditMovies" class="edit-movie-button add-movie-button" type="button" @click="startMovieCreate">+ Add movie</button>
            <label class="genre-heading-control" for="movie-genre-filter">
              <span class="sr-only">Filter movies by genre</span>
              <select id="movie-genre-filter" v-model="selectedGenre" class="genre-filter-select" aria-label="Filter movies by genre">
                <option value="">All genres</option>
                <option v-for="genre in genreOptions" :key="genre" :value="genre">{{ genre }}</option>
              </select>
            </label>
          </div>
        </div>
        <div v-if="loading" class="state">Loading movies from backend...</div>
        <div v-else-if="error" class="state error">{{ error }}</div>
        <div v-else-if="!filteredMovies.length" class="state">No movies found for this genre.</div>
        <div v-else class="grid">
          <Card v-for="movie in filteredMovies" :key="movie.id" class="movie-card clickable-card" @click="openMovie(movie, movies.findIndex(entry => entry.id === movie.id))">
            <template #header><img :src="getPoster(movie, movies.findIndex(entry => entry.id === movie.id))" :alt="movie.title" @error="handlePosterError($event, movies.findIndex(entry => entry.id === movie.id))" /></template>
            <template #title>
              <div class="movie-title-row">
                <div class="movie-title-info">
                  <span class="movie-title">{{ movie.title }}</span>
                  <span class="movie-title-meta">{{ movie.genre }} · {{ movie.duration }} min</span>
                </div>
                <div v-if="movie.rating" class="movie-title-rating">
                  <strong>{{ Number(movie.rating.score).toFixed(1) }}/10</strong>
                  <small>{{ movie.rating.voteCount.toLocaleString() }} votes</small>
                </div>
                <div v-else class="movie-title-rating movie-title-rating-empty" aria-hidden="true"></div>
              </div>
            </template>
            <template #content>
              <p class="movie-description">{{ movie.description }}</p>
              <div class="movie-data">
                <div class="movie-data-group">
                  <span class="movie-data-label">Creators</span>
                  <div v-if="movie.creators?.length" class="movie-data-list">
                    <div class="movie-data-creator-row">
                      <span v-for="creator in movie.creators.slice(0, 3)" :key="`${creator.id}-role`">{{ creator.role }}</span>
                    </div>
                    <div class="movie-data-creator-row movie-data-creator-names">
                      <strong v-for="creator in movie.creators.slice(0, 3)" :key="`${creator.id}-name`">{{ creator.name }}</strong>
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
                <button class="showtime" type="button" @click.stop="openSeatPicker(movie)">
                  <i class="pi pi-ticket" aria-hidden="true"></i>
                  Choose showtime
                </button>
              </div>
            </template>
          </Card>
        </div>
      </section>
      <div v-if="selectedMovie || creatingMovie" class="movie-modal-backdrop" @click.self="closeMovie">
        <article class="movie-modal" role="dialog" aria-modal="true" :aria-label="selectedMovie.title">
          <button class="modal-close" type="button" aria-label="Close movie details" @click="closeMovie">×</button>
          <form v-if="canEditMovies && editingMovie" class="movie-edit-form" @submit.prevent="saveMovieChanges">
            <h2>{{ creatingMovie ? 'Add movie' : 'Edit movie' }}</h2>
            <div class="edit-fields">
              <label>Title<input v-model="movieForm.title" required maxlength="160" /></label>
              <label>Genre<input v-model="movieForm.genre" required maxlength="80" /></label>
              <label>Duration (minutes)<input v-model.number="movieForm.duration" type="number" min="1" step="1" required /></label>
              <label>Poster URL<input v-model="movieForm.posterUrl" maxlength="500" /></label>
              <div class="poster-upload edit-full-width">
                <span>Poster image</span>
                <div class="poster-upload-controls">
                  <img :src="getPoster({ ...selectedMovie, posterUrl: movieForm.posterUrl }, selectedMovieIndex)" :alt="`${movieForm.title} poster preview`" />
                  <input ref="posterFileInput" class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" @change="uploadPoster" />
                  <button class="details-button" type="button" :disabled="uploadingPoster || savingMovie || deletingMovie" @click="posterFileInput?.click()">
                    {{ uploadingPoster ? 'Uploading…' : 'Browse file' }}
                  </button>
                  <span class="edit-hint">JPEG, PNG, or WebP. Maximum 5 MB.</span>
                </div>
              </div>
              <label>Banner URL<input v-model="movieForm.bannerUrl" maxlength="500" /></label>
              <label class="edit-full-width">Trailer URL<input v-model="movieForm.trailerUrl" type="url" maxlength="500" placeholder="https://www.youtube.com/watch?v=…" /></label>
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
              <button v-if="!creatingMovie" class="delete-movie-button" type="button" :disabled="savingMovie || deletingMovie || uploadingPoster" @click="removeMovie">{{ deletingMovie ? 'Deleting…' : 'Delete movie' }}</button>
              <button class="details-button" type="button" :disabled="savingMovie || deletingMovie || uploadingPoster" @click="cancelMovieEdit">Cancel</button>
              <button class="showtime" type="submit" :disabled="savingMovie || deletingMovie || uploadingPoster">{{ uploadingPoster ? 'Uploading poster…' : savingMovie ? (creatingMovie ? 'Creating…' : 'Saving…') : creatingMovie ? 'Add movie' : 'Save changes' }}</button>
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
      <div v-if="editingBanner" class="movie-modal-backdrop" @click.self="cancelBannerEdit">
        <article class="movie-modal" role="dialog" aria-modal="true">
          <button class="modal-close" type="button" @click="cancelBannerEdit">×</button>
          <form class="movie-edit-form" @submit.prevent="saveBannerChanges">
            <h2> {{ creatingBanner ? 'Add banner' : 'Edit banner' }} </h2>
            <div class="edit-fields">
              <label>Title<input v-model="bannerForm.title" required maxlength="160" /></label>
              <label>Subtitle<input v-model="bannerForm.subtitle" maxlength="300" /></label>
              <label class="edit-full-width">Banner URL
                <input v-model="bannerForm.image" required maxlength="500" />
              </label>
              <div class="poster-upload edit-full-width">
                <span>Banner image</span>
                <div class="poster-upload-controls">
                  <img v-if="bannerForm.image" :src="getBannerImage(bannerForm.image)" alt="Banner preview" />
                  <input ref="bannerFileInput" class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" @change="uploadBanner" />
                  <button class="details-button" type="button" :disabled="uploadingBanner || savingBanner || deletingBanner" @click="bannerFileInput?.click()">
                    {{ uploadingBanner ? 'Uploading…' : 'Browse file' }}
                  </button>
                </div>
              </div>
            </div>
            <p v-if="bannerSaveError" class="edit-error" role="alert">{{ bannerSaveError }}</p>
            <div class="edit-actions">
              <button v-if="!creatingBanner" class="delete-movie-button" type="button" :disabled="savingBanner || deletingBanner || uploadingBanner" @click="removeBanner">
                {{ deletingBanner ? 'Deleting…' : 'Delete banner' }}
              </button>
              <button class="details-button" type="button" :disabled="savingBanner || deletingBanner || uploadingBanner" @click="cancelBannerEdit">Cancel</button>
              <button class="showtime" type="submit" :disabled="savingBanner || deletingBanner || uploadingBanner">
                {{ savingBanner ? 'Saving…' : creatingBanner ? 'Add banner' : 'Save changes' }}
              </button>
            </div>
          </form>
        </article>
      </div>
    </main>
    <footer class="footer">
      <div class="fleft">Bradar Cinema · School project</div>
      <div class="fright">Copyright © 2026 Bradar Cinema. All rights reserved.</div>
    </footer>
  </div>
</template>
