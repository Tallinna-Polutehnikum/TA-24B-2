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
      <Tag value="Great Gifts!" severity="secondary" />
      <h2 class="voucher-title">More movies!</h2>
      <h2 class="voucher-title">More memories!</h2>
      <h2 class="voucher-title">More happiness!</h2>
      <p>All vouchers for families, your birthday parties, for special holidays only in Bradar Cinema!</p>
      <Button type="button" class="vouchers-button" label="SEE OFFERS" icon="pi pi-sort-down-fill" @click="goToMovies" />
    </div>
  </section>
</template>
