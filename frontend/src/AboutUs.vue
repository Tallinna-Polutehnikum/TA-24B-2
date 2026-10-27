<script setup>
  import './AboutUs.css';
</script>

<template>
  <div class="about-page">
    <h1 class="about-us">About us</h1>
    <p>Bradar Cinema is a cinema website created as a school project by students at Techno TLN (Pärnu Mnt 57, Kesklinn). Our goal is to make discovering movies and exploring film details simple and enjoyable.</p>
    <h2>Our developers</h2>
      <div class="developer-grid">
        <div v-for="developer in ['Daniel Helmrosin', 'Aleksander Kartuzov', 'Samir Cibis']" :key="developer" class="developer-card">
          <i class="pi pi-user" aria-hidden="true"></i><strong>{{ developer }}</strong><span>Developer · Techno TLN Kesklinn</span>
        </div>
      </div>
  </div>
</template>