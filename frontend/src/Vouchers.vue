<script setup>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import './Vouchers.css';
import banner from './assets/posters/banner1.jpg';

const router = useRouter();

function goToMovies() {
  router.push({ path: '/', hash: '#movies' });
}
</script>

<template>
  <section class="hero vouchers-hero" aria-label="Vouchers banner">
    <div
      class="hero-background"
      :style="{ backgroundImage: `url('${banner}')` }"
    ></div>
    <div class="hero-copy">
      <Tag value="NOW IN THEATERS" severity="secondary" />
      <h1>Crime Patrol: The Amazing full FMV-movie</h1>
      <p>For only 9.99€</p>
      <Button class="see-movies-button" label="See movies" icon="pi pi-angle-down" @click="goToMovies" />
    </div>
  </section>
</template>
