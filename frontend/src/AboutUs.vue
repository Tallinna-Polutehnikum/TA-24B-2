<script setup>
  import { onMounted, ref } from 'vue';
  import './AboutUs.css';
  import { getCinemas } from './services/api';
  import interplexImage from './assets/theaters/interplex.jpg';
  import shafferImage from './assets/theaters/shaffer.jpg';
  import inCinematicoImage from './assets/theaters/incinematico.jpg';
  import cinemaCubedImage from './assets/theaters/cinemacubed.jpg';
  import apollyonImage from './assets/theaters/apollyon.jpg';
  import howtocinemaImage from './assets/theaters/howtocinema.jpg';

  const cinemas = ref([]);
  const cinemasLoading = ref(true);
  const cinemasError = ref('');
  const cinemaImages = {
    'InterPlex Cinema': interplexImage,
    'Shaffer Cinema': shafferImage,
    'In Cinematico': inCinematicoImage,
    'Apollyon Cinema': apollyonImage,
    CinemaCubed: cinemaCubedImage,
    HowToCinema: howtocinemaImage,
  };
  const fallbackCinemaImages = Object.values(cinemaImages);
  const cinemaCoordinates = {
    'InterPlex Cinema': { latitude: 59.438283, longitude: 24.756450 },
    'Shaffer Cinema': { latitude: 59.435304, longitude: 24.745229 },
    'In Cinematico': { latitude: 59.408511, longitude: 24.689503 },
    'Apollyon Cinema': { latitude: 59.421856, longitude: 24.795709 },
    CinemaCubed: { latitude: 59.433593, longitude: 24.751325 },
    HowToCinema: { latitude: 59.433126, longitude: 24.752033 },
  };

  async function loadCinemas() {
    cinemasLoading.value = true;
    cinemasError.value = '';

    try {
      cinemas.value = await getCinemas();
    } catch (error) {
      cinemasError.value = error instanceof Error ? error.message : 'Could not load cinemas';
    } finally {
      cinemasLoading.value = false;
    }
  }

  function getMapUrl(coordinates) {
    return `https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=18/${coordinates.latitude}/${coordinates.longitude}`;
  }

  function getCinemaImage(cinema, index) {
    return cinemaImages[cinema.name] ?? fallbackCinemaImages[index % fallbackCinemaImages.length];
  }

  onMounted(loadCinemas);
</script>

<template>
  <div class="about-page">
    <h1 class="about-us">About us</h1>
    <p>Bradar Cinema is a cinema website created as a school project by students at Techno TLN Kesklinn. Our goal is to make discovering movies and exploring film details simple and enjoyable.</p>
    <p>Our team is trying to be the best in our job and make searches faster and comfortable in any time. By your support and support of others, there is a change to receive more new great updates from our team!</p>
    <p>This site was created by team of 3 people down below:</p>
    <section class="developers-section" aria-labelledby="developers-heading">
      <h2 id="developers-heading">Our developers</h2>
      <div class="developer-grid">
        <article v-for="developer in ['Daniel Helmrosin', 'Aleksander Kartuzov', 'Samir Cibis']" :key="developer" class="developer-card">
          <i class="pi pi-user" aria-hidden="true"></i><strong>{{ developer }}</strong><span>Developer · Techno TLN Kesklinn</span>
        </article>
      </div>
    </section>
    <section class="cinemas-section" aria-labelledby="cinemas-heading">
      <h2 id="cinemas-heading">Our cinemas</h2>
      <p v-if="cinemasLoading" class="cinemas-status" role="status">Loading cinemas...</p>
      <div v-else-if="cinemasError" class="cinemas-status" role="alert">
        <p>{{ cinemasError }}</p>
        <button class="cinemas-retry" type="button" @click="loadCinemas">Try again</button>
      </div>
      <p v-else-if="cinemas.length === 0" class="cinemas-status">No cinemas are available yet.</p>
      <div v-else class="cinema-list">
        <article v-for="(cinema, index) in cinemas" :key="cinema.name" class="cinema-card">
          <img class="cinema-image" :src="getCinemaImage(cinema, index)" :alt="`${cinema.name} cinema`" />
          <div class="cinema-details">
            <h3>{{ cinema.name }}</h3>
            <ul>
              <li>City: {{ cinema.city }}</li>
              <li>Address: {{ cinema.address }}</li>
              <li>Halls: {{ cinema.hallCount }} screening halls</li>
              <li>Working time: 10:00-22:30</li>
              <li v-if="cinemaCoordinates[cinema.name]">
                <a class="cinema-map-link" :href="getMapUrl(cinemaCoordinates[cinema.name])" target="_blank" rel="noopener noreferrer">View location on OpenStreetMap</a>
              </li>
            </ul>
          </div>
        </article>
      </div>
      <p class="cinemas-attribution">Coordinates: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a></p>
    </section>
  </div>
</template>