<script setup>
  import { onMounted, ref } from 'vue';
  import './AboutUs.css';
  import { getCinemas } from './services/api';

  const cinemas = ref([]);
  const cinemasLoading = ref(true);
  const cinemasError = ref('');

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

  onMounted(loadCinemas);
</script>

<template>
  <div class="about-page">
    <h1 class="about-us">About us</h1>
    <p>Bradar Cinema is a cinema website created as a school project by students at Techno TLN Kesklinn. Our goal is to make discovering movies and exploring film details simple and enjoyable.</p>
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
        <article v-for="cinema in cinemas" :key="cinema.name" class="cinema-card">
          <div class="cinema-image-placeholder" role="img" :aria-label="`Image placeholder for ${cinema.name}`">
            <i class="pi pi-image" aria-hidden="true"></i>
            <span>Image coming soon</span>
          </div>
          <div class="cinema-details">
            <h3>{{ cinema.name }}</h3>
            <ul>
              <li>{{ cinema.city }}</li>
              <li>{{ cinema.address }}</li>
              <li>{{ cinema.hallCount }} screening halls</li>
              <li>Working time: 10:00-22:30</li>
            </ul>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>