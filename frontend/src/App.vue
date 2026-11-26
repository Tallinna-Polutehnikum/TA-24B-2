<script setup>
import './App.css';
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
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
import banner from './assets/banners/banner1.jpg';
import menuMusic from './assets/music/menu.mp3';
import logoMusic from './assets/music/logo.mp3';
const movies = ref([]);
const selectedGenre = ref('');
const genreOptions = computed(() => [...new Set(movies.value.flatMap(movie => String(movie.genre || '').split(/[,/;|]/).map(genre => genre.trim()).filter(Boolean)))].sort((a, b) => a.localeCompare(b)));
const genreMenuOpen = ref(false);
const searchQuery = ref('');
const searchFocused = ref(false);
const searchMatches = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase();
  return query ? movies.value.filter(movie => String(movie.title || '').toLocaleLowerCase().includes(query)) : [];
});
const searchSuggestions = computed(() => searchMatches.value.slice(0, 8));
const filteredMovies = computed(() => movies.value.filter(movie => {
  const matchesGenre = !selectedGenre.value || String(movie.genre || '').split(/[,/;|]/).some(genre => genre.trim().toLocaleLowerCase() === selectedGenre.value.toLocaleLowerCase());
  const matchesSearch = !searchQuery.value.trim() || String(movie.title || '').toLocaleLowerCase().includes(searchQuery.value.trim().toLocaleLowerCase());
  return matchesGenre && matchesSearch;
}));

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const backendUnavailable = ref(false);
const activePage = computed(() => route.meta.view ?? null);
const activePageName = computed(() => route.meta.page ?? 'home');
const showHeaderSearch = computed(() => activePageName.value === 'home' || activePageName.value === 'vouchers');
watch(activePageName, () => {
  searchQuery.value = '';
  searchFocused.value = false;
});
const selectedMovie = ref(null);
const selectedMovieIndex = ref(0);
const movieUserRatings = ref({});
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
const invertColors = ref(false);
const arrowNavigation = ref(false);
const menuAudio = ref(null);
const logoAudio = ref(null);
const musicEnabled = ref(false);
const musicError = ref('');
const introVisible = ref(true);
const introFading = ref(false);
const siteContentVisible = ref(false);
const introStep = ref(0);
const introSoundBlocked = ref(false);
const introPreviousBodyOverflow = ref('');
const introBodyLocked = ref(false);
const backendRetryIntervalMs = 1000;
let slideTimer;
let backendRetryTimer;
let introFadeTimer;
const introTimers = [];
let backendRequestInFlight = false;
let browserTheme;
let onBrowserThemeChange;

function setTheme(value) {
  theme.value = value;
  localStorage.setItem('bradar-theme', value);
  document.documentElement.setAttribute('data-theme', value);
}

function setInvertColors(value) {
  invertColors.value = value;
  localStorage.setItem('bradar-invert-colors', String(value));
  document.documentElement.toggleAttribute('data-invert-colors', value);
}

function setArrowNavigation(value) {
  arrowNavigation.value = value;
  localStorage.setItem('bradar-arrow-navigation', String(value));
}

function handleArrowNavigation(event) {
  if (!arrowNavigation.value || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  const target = event.target;
  if (target instanceof HTMLElement && (
    target.isContentEditable ||
    target.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]), select, textarea, [role="combobox"], [role="listbox"], [role="menu"], [role="menubar"], [role="radio"], [role="slider"], [role="spinbutton"], [role="tree"], [role="grid"]')
  )) return;

  const focusableElements = [...document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => element instanceof HTMLElement && element.getClientRects().length > 0 && !element.closest('[inert], [aria-hidden="true"]'));
  if (!focusableElements.length) return;

  const currentIndex = focusableElements.indexOf(document.activeElement);
  const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
  const nextIndex = currentIndex < 0
    ? (direction > 0 ? 0 : focusableElements.length - 1)
    : (currentIndex + direction + focusableElements.length) % focusableElements.length;

  event.preventDefault();
  focusableElements[nextIndex].focus();
}

async function startMenuMusic() {
  const audio = menuAudio.value;
  if (!audio) return;
  musicError.value = '';
  audio.volume = 0.3;
  audio.muted = false;
  try {
    await audio.play();
    musicEnabled.value = true;
  } catch (error) {
    musicEnabled.value = false;
    if (error?.name !== 'NotAllowedError') {
      musicError.value = 'Could not play background music.';
    }
  }
}

function toggleMenuMusic() {
  const audio = menuAudio.value;
  if (!audio) return;
  if (musicEnabled.value) {
    audio.muted = true;
    musicEnabled.value = false;
    return;
  }
  void startMenuMusic();
}

async function startBrandIntro() {
  if (!introBodyLocked.value) {
    introPreviousBodyOverflow.value = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    introBodyLocked.value = true;
  }
  const audio = logoAudio.value;
  if (audio) {
    audio.volume = 0.85;
    audio.currentTime = 0;
    audio.muted = false;
    try {
      await audio.play();
    } catch (error) {
      if (error?.name === 'NotAllowedError') {
        introSoundBlocked.value = true;
        return;
      }
      musicError.value = 'Could not play the intro sound.';
    }
  }

  introTimers.forEach(window.clearTimeout);
  introTimers.length = 0;
  introSoundBlocked.value = false;
  introStep.value = 0;
  introFading.value = false;
  siteContentVisible.value = false;
  introTimers.push(window.setTimeout(() => { introStep.value = 1; }, 250));
  introTimers.push(window.setTimeout(() => { introStep.value = 2; }, 1450));
  introTimers.push(window.setTimeout(finishBrandIntro, 3600));
}

function finishBrandIntro() {
  if (!introVisible.value || introFading.value) return;
  introFading.value = true;
  siteContentVisible.value = true;

  const audio = logoAudio.value;
  if (audio && !audio.paused) {
    const initialVolume = audio.volume;
    const fadeStartedAt = performance.now();
    introFadeTimer = window.setInterval(() => {
      const progress = Math.min((performance.now() - fadeStartedAt) / 900, 1);
      audio.volume = initialVolume * (1 - progress);
      if (progress === 1) {
        window.clearInterval(introFadeTimer);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0.85;
      }
    }, 40);
  }

  introTimers.push(window.setTimeout(() => {
    introVisible.value = false;
    document.body.style.overflow = introPreviousBodyOverflow.value;
    introBodyLocked.value = false;
    audio?.pause();
    void startMenuMusic();
  }, 900));
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

function rateMovie(movieId, rating) {
  movieUserRatings.value[movieId] = rating;
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
  const image = event.currentTarget;

  if (image.currentSrc.includes('picsum.photos')) {
    image.classList.add('poster-unavailable');
    image.removeAttribute('src');
    return;
  }

  image.src = posters[index % posters.length];
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

async function selectSearchMovie(movie) {
  searchFocused.value = false;
  await router.push('/');
  await nextTick();
  openMovie(movie, movies.value.findIndex(entry => entry.id === movie.id));
}

function handleSearchFocusout(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) searchFocused.value = false;
}

function handleSearchKeydown(event) {
  if (event.key === 'Escape') searchFocused.value = false;
  if (event.key === 'Enter' && searchSuggestions.value.length) {
    event.preventDefault();
    selectSearchMovie(searchSuggestions.value[0]);
  }
}

function handleGenreFilterFocusout(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) genreMenuOpen.value = false;
}

function handleGenreFilterKeydown(event) {
  if (event.key === 'Escape') genreMenuOpen.value = false;
}

function selectGenre(genre) {
  selectedGenre.value = genre;
  genreMenuOpen.value = false;
}

function openSeatPicker(movie = null) {
  selectedBookingMovie.value = movie;
  router.push('/buy-tickets');
}

function openMovieShowtimes(movie) {
  closeMovie();
  openSeatPicker(movie);
}

function openAboutUs() {
  router.push('/about_us');
}

function openClub() {
  router.push('/club');
}

function openVouchers() {
  router.push('/vouchers');
}

function openSettings() {
  router.push('/settings');
}

async function openCheckout(booking) {
  sessionStorage.setItem('pendingBooking', JSON.stringify(booking));
  await router.push('/checkout');
}

async function loadBackendData() {
  if (backendRequestInFlight) return false;
  backendRequestInFlight = true;

  try {
    const [loadedMovies, loadedBanners] = await Promise.all([getMovies(), getBanners()]);
    movies.value = loadedMovies;
    slides.value = loadedBanners;
    backendUnavailable.value = false;
    window.clearInterval(backendRetryTimer);
    backendRetryTimer = undefined;
    return true;
  } catch {
    backendUnavailable.value = true;
    return false;
  } finally {
    loading.value = false;
    backendRequestInFlight = false;
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleModalKeydown);
  window.addEventListener('keydown', handleArrowNavigation);
  void startBrandIntro();
  invertColors.value = localStorage.getItem('bradar-invert-colors') === 'true';
  arrowNavigation.value = localStorage.getItem('bradar-arrow-navigation') === 'true';
  document.documentElement.toggleAttribute('data-invert-colors', invertColors.value);
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
  if (activePageName.value !== 'checkout' && !await loadBackendData()) {
    backendRetryTimer = window.setInterval(loadBackendData, backendRetryIntervalMs);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleModalKeydown);
  window.removeEventListener('keydown', handleArrowNavigation);
  window.clearInterval(slideTimer);
  window.clearInterval(backendRetryTimer);
  window.clearInterval(introFadeTimer);
  introTimers.forEach(window.clearTimeout);
  if (introBodyLocked.value) document.body.style.overflow = introPreviousBodyOverflow.value;
  logoAudio.value?.pause();
  menuAudio.value?.pause();
  browserTheme?.removeEventListener('change', onBrowserThemeChange);
  if (selectedMovie.value) document.body.style.overflow = previousBodyOverflow.value;
});
</script>

<template>
  <div class="page" id="bradarcinema.ee">
    <audio ref="logoAudio" class="site-audio" :src="logoMusic" preload="auto" aria-hidden="true"></audio>
    <audio ref="menuAudio" class="site-audio" :src="menuMusic" loop preload="auto" aria-hidden="true"></audio>
    <div class="site-content" :class="{ 'site-content-visible': siteContentVisible }" :inert="introVisible" :aria-hidden="introVisible">
    <header class="topbar">
      <div class="brand">
        <a href="/" class="logo" aria-label="Go to main screen" @click.prevent="goHome">BRADAR <span>CINEMA</span></a>
        <div v-if="showHeaderSearch" class="header-search" @focusout="handleSearchFocusout">
          <label class="sr-only" :for="activePageName === 'vouchers' ? 'header-voucher-search' : 'header-movie-search'">
            {{ activePageName === 'vouchers' ? 'Search vouchers' : 'Search movies by title' }}
          </label>
          <div class="header-search-input">
            <i class="pi pi-search" aria-hidden="true"></i>
            <input
              :id="activePageName === 'vouchers' ? 'header-voucher-search' : 'header-movie-search'"
              v-model="searchQuery"
              type="search"
              :placeholder="activePageName === 'vouchers' ? 'Search vouchers…' : 'Search movies…'"
              autocomplete="off"
              role="combobox"
              aria-autocomplete="list"
              :aria-controls="activePageName === 'home' ? 'header-movie-search-results' : undefined"
              :aria-expanded="activePageName === 'home' && searchFocused && searchQuery.trim().length > 0"
              @focus="searchFocused = true"
              @keydown="handleSearchKeydown"
            />
            <button v-if="searchQuery" type="button" class="header-search-clear" aria-label="Clear search" @click="searchQuery = ''; searchFocused = true">
              <i class="pi pi-times" aria-hidden="true"></i>
            </button>
          </div>
          <div v-if="activePageName === 'home' && searchFocused && searchQuery.trim()" id="header-movie-search-results" class="header-search-results" role="listbox" aria-label="Movie search results">
            <button
              v-for="movie in searchSuggestions"
              :key="movie.id"
              type="button"
              class="header-search-result"
              role="option"
              @mousedown.prevent
              @click="selectSearchMovie(movie)"
            >
              <img :src="getPoster(movie, movies.findIndex(entry => entry.id === movie.id))" alt="" />
              <span>
                <strong>{{ movie.title }}</strong>
                <small>{{ movie.genre }}</small>
              </span>
            </button>
            <p v-if="!searchMatches.length" class="header-search-empty">No movies found.</p>
            <p v-else-if="searchMatches.length > searchSuggestions.length" class="header-search-more">{{ searchMatches.length - searchSuggestions.length }} more results — continue typing</p>
          </div>
        </div>
        <nav class="logo-actions" aria-label="Main navigation">
          <Button class="nav-button" :class="{ 'nav-active': activePageName === 'home' }" label="Movies" size="small" text @click="goToMovies" />
          <Button class="nav-button" :class="{ 'nav-active': activePageName === 'buyTickets' }" label="Buy tickets" size="small" text @click="openSeatPicker()" />
          <Button class="nav-button" :class="{ 'nav-active': activePageName === 'aboutUs' }" label="About Us" size="small" text @click="openAboutUs()"/>
          <Button class="nav-button" :class="{ 'nav-active': activePageName === 'club' || activePageName === 'clubApplication' }" label="Bradar Club" size="small" text @click="openClub()"/>
          <Button class="nav-button" :class="{ 'nav-active': activePageName === 'vouchers' }" label="Vouchers" size="small" text @click="openVouchers()"/>
        </nav>
        <div class="header-controls">
          <button
            class="music-toggle"
            :class="{ 'music-toggle-enabled': musicEnabled }"
            type="button"
            :aria-label="musicEnabled ? 'Mute background music' : 'Play background music'"
            :aria-pressed="musicEnabled"
            :title="musicError || (musicEnabled ? 'Mute background music' : 'Play background music')"
            @click="toggleMenuMusic"
          >
            <i :class="musicEnabled ? 'pi pi-volume-up' : 'pi pi-volume-off'" aria-hidden="true"></i>
          </button>
          <button
            class="music-toggle"
            :class="{ 'music-toggle-enabled': activePageName === 'settings' }"
            type="button"
            aria-label="Accessibility settings"
            title="Accessibility settings"
            :aria-current="activePageName === 'settings' ? 'page' : undefined"
            @click="openSettings"
          >
            <i class="pi pi-cog" aria-hidden="true"></i>
          </button>
          <button class="theme-toggle" type="button" :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'" @click="setTheme(theme === 'dark' ? 'light' : 'dark')">
            <i :class="theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'" aria-hidden="true"></i>
            {{ theme === 'dark' ? 'Light' : 'Dark' }} mode
          </button>
        </div>
        <span v-if="musicError" class="sr-only" role="status">{{ musicError }}</span>
      </div>
    </header>
    <main v-if="activePage">
      <component
        :is="activePage"
        v-if="activePageName === 'settings'"
        :invert-colors="invertColors"
        :arrow-navigation="arrowNavigation"
        @change-invert-colors="setInvertColors"
        @change-arrow-navigation="setArrowNavigation"
      />
      <component
        :is="activePage"
        v-else-if="activePageName === 'buyTickets'"
        :movie="selectedBookingMovie"
        :movies="movies"
        @close="goToMovies"
        @checkout="openCheckout"
      />
      <component
        :is="activePage"
        v-else-if="activePageName === 'vouchers'"
        :search-query="searchQuery"
        @checkout="openCheckout"
      />
      <component v-else :is="activePage" @checkout="openCheckout" />
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
          <button v-if="canEditBanners" class="banner-edit-button" type="button" @click="startBannerCreate">Add banner</button>
        </div>
      </section>
      <section id="movies" class="content">
        <div class="section-heading">
          <div><h3>Top Movies</h3></div>
          <div class="movie-heading-actions">
            <span>{{ filteredMovies.length }} of {{ movies.length }} movies</span>
            <button v-if="canEditMovies" class="edit-movie-button add-movie-button" type="button" @click="startMovieCreate">+ Add movie</button>
            <div class="genre-heading-control" @focusout="handleGenreFilterFocusout" @keydown="handleGenreFilterKeydown">
              <button
                id="movie-genre-filter"
                class="genre-filter-select"
                type="button"
                aria-haspopup="listbox"
                :aria-expanded="genreMenuOpen"
                aria-controls="movie-genre-options"
                @click="genreMenuOpen = !genreMenuOpen"
              >
                {{ selectedGenre || 'All genres' }}
              </button>
              <div v-if="genreMenuOpen" id="movie-genre-options" class="genre-filter-options" role="listbox" aria-label="Filter movies by genre">
                <button
                  type="button"
                  role="option"
                  :aria-selected="selectedGenre === ''"
                  @click="selectGenre('')"
                >All genres</button>
                <button
                  v-for="genre in genreOptions"
                  :key="genre"
                  type="button"
                  role="option"
                  :aria-selected="selectedGenre === genre"
                  @click="selectGenre(genre)"
                >{{ genre }}</button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="loading" class="state">Loading movies from backend...</div>
        <div v-else-if="!filteredMovies.length" class="state">{{ searchQuery.trim() ? 'No movies match your search.' : 'No movies found for this genre.' }}</div>
        <div v-else class="grid">
          <Card v-for="movie in filteredMovies" :key="movie.id" class="movie-card clickable-card" @click="openMovie(movie, movies.findIndex(entry => entry.id === movie.id))">
            <template #header>
              <button class="movie-card-open-button" type="button" :aria-label="`View details for ${movie.title}`" @click.stop="openMovie(movie, movies.findIndex(entry => entry.id === movie.id))">
                <img :src="getPoster(movie, movies.findIndex(entry => entry.id === movie.id))" alt="" @error="handlePosterError($event, movies.findIndex(entry => entry.id === movie.id))" />
              </button>
            </template>
            <template #title>
              <button class="movie-card-open-button movie-card-title-button" type="button" :aria-label="`View details for ${movie.title}`" @click.stop="openMovie(movie, movies.findIndex(entry => entry.id === movie.id))">
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
              </button>
            </template>
            <template #content>
              <p class="movie-description">{{ movie.description }}</p>
              <div class="movie-card-user-rating" :aria-label="movieUserRatings[movie.id] ? `Your rating: ${movieUserRatings[movie.id]} out of 5 stars` : 'Not rated yet'">
                <span class="movie-card-user-rating-label">Your rating</span>
                <span class="movie-card-user-rating-stars" aria-hidden="true">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="movie-card-user-rating-star"
                    :class="{ selected: star <= (movieUserRatings[movie.id] || 0) }"
                  >★</span>
                </span>
                <span class="movie-card-user-rating-value">
                  {{ movieUserRatings[movie.id] ? `${movieUserRatings[movie.id]} / 5` : 'Not rated' }}
                </span>
              </div>
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
                <button class="details-button" type="button" @click.stop="openMovie(movie, movies.findIndex(entry => entry.id === movie.id))">
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
            <div v-if="canEditMovies" class="movie-modal-actions">
              <button class="edit-movie-button" type="button" @click="startMovieEdit(selectedMovie)">Edit movie</button>
            </div>
            <div class="modal-layout">
              <div class="modal-poster-column">
                <img class="modal-poster" :src="getPoster(selectedMovie, selectedMovieIndex)" :alt="selectedMovie.title" @error="handlePosterError($event, selectedMovieIndex)" />
                <button class="showtime modal-showtime-button" type="button" @click="openMovieShowtimes(selectedMovie)">
                  <i class="pi pi-ticket" aria-hidden="true"></i>
                  Choose showtime
                </button>
              </div>
              <div class="modal-copy">
                <span class="modal-genre">{{ selectedMovie.genre }} · {{ selectedMovie.duration }} min</span>
                <h2>{{ selectedMovie.title }}</h2>
                <h3>About the movie</h3>
                <p class="modal-description">{{ selectedMovie.description || 'Description coming soon.' }}</p>
                <div class="user-movie-rating">
                  <span class="user-movie-rating-label">Your rating</span>
                  <div class="user-movie-rating-stars" role="group" :aria-label="`Rate ${selectedMovie.title} from 1 to 5 stars`">
                    <button
                      v-for="star in 5"
                      :key="star"
                      type="button"
                      class="user-movie-rating-star"
                      :class="{ selected: star <= (movieUserRatings[selectedMovie.id] || 0) }"
                      :aria-label="`${star} out of 5 stars`"
                      :aria-pressed="movieUserRatings[selectedMovie.id] === star"
                      @click="rateMovie(selectedMovie.id, star)"
                    >★</button>
                  </div>
                  <span class="user-movie-rating-value" aria-live="polite">
                    {{ movieUserRatings[selectedMovie.id] ? `Your rating: ${movieUserRatings[selectedMovie.id]} / 5` : 'Select 1 to 5 stars' }}
                  </span>
                </div>
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
    <div v-if="backendUnavailable" class="backend-unavailable-backdrop">
      <section class="backend-unavailable-dialog" role="alertdialog" aria-modal="true" aria-labelledby="backend-unavailable-title" aria-describedby="backend-unavailable-description">
        <h2 id="backend-unavailable-title">Couldn't load movies</h2>
        <p id="backend-unavailable-description">Please check your connection. We'll keep trying automatically.</p>
        <span class="backend-unavailable-status" role="status">Checking connection…</span>
        <button class="backend-unavailable-retry" type="button" @click="loadBackendData">Try again</button>
      </section>
    </div>
    </div>
      <div
        v-if="introVisible"
        class="brand-intro"
        :class="{ 'brand-intro-fading': introFading }"
        role="status"
        aria-label="Bradar Cinema"
      >
        <div class="brand-intro-content">
          <div class="brand-intro-wordmark" aria-hidden="true">
            <span v-if="introStep >= 1" class="brand-intro-word brand-intro-word-bradar">BRADAR</span>
            <span v-if="introStep >= 2" class="brand-intro-word brand-intro-word-cinema">CINEMA</span>
          </div>
          <button v-if="introSoundBlocked" class="brand-intro-start" type="button" @click="startBrandIntro">
            Start intro
          </button>
          <button class="brand-intro-start" type="button" @click="finishBrandIntro">
            Skip intro
          </button>
          <p v-if="musicError" class="brand-intro-error" role="status">{{ musicError }}</p>
        </div>
      </div>
  </div>
</template>
