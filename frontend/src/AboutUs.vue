<template>
  <div class="about-page">
    <h1 class="about-us">About us</h1>
    <p>Bradar Cinema is a cinema website created as a school project by students at Techno TLN (Pärnu Mnt 57, Kesklinn). Our goal is to make discovering movies and exploring film details simple and enjoyable.</p>
    <h3>Our developers</h3>
      <div class="developer-grid">
        <div v-for="developer in ['Daniel Helmrosin', 'Aleksandr Kartuzov', 'Samir Cibis']" :key="developer" class="developer-card">
          <i class="pi pi-user" aria-hidden="true"></i><strong>{{ developer }}</strong><span>Developer · Tallinna Polütehnikum</span>
        </div>
      </div>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 55px 6vw 80px;
  color: var(--cinema-text);
  font-family: "DM Sans", sans-serif;
}
.about-page > p {
  max-width: 760px;
  margin: 0 auto;
  line-height: 1.8;
  text-align: center;
  color: var(--cinema-muted);
}
.about-page h3 {
  margin-top: 36px;
}
.about-us {
  margin: 0 0 36px;
  padding-top: 20px;
  font-size: clamp(42px, 8vw, 96px);
  text-align: center;
}
.developer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 18px;
  margin-top: 20px;
}
.developer-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border: 1px solid var(--cinema-border);
  border-radius: 8px;
  background: var(--cinema-surface);
}
.developer-card i {
  color: #3d77f3;
  font-size: 28px;
}
.developer-card span {
  color: var(--cinema-muted);
  font-size: 13px;
}
</style>