<script setup>
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import { getMovies } from './services/api';
import poster1 from './assets/poster1.jpg';
import poster2 from './assets/poster2.jpg';
import poster3 from './assets/poster3.jpg';
import poster4 from './assets/poster4.jpg';
import poster5 from './assets/poster5.jpg';
import poster6 from './assets/poster6.jpg'; 
import poster7 from './assets/poster7.jpg';
import banner from './assets/banner1.jpg';
import seatpicker from './seatpicker.vue';

const movies = ref([]);
const loading = ref(true);
const error = ref('');
const showSeatPicker = ref(false);
const posters = [poster1, poster2, poster3, poster4, poster5, poster6, poster7];

function getPoster(movie, index) {
  const posterName = movie.posterUrl?.split('/').pop();
  const posterIndex = posters.findIndex((poster) => posterName === `poster${posters.indexOf(poster) + 1}.jpg`);
  return posterIndex >= 0 ? posters[posterIndex] : posters[index % posters.length];
}

onMounted(async () => {
  try { movies.value = await getMovies(); }
  catch (e) { error.value = 'Backend is not running yet. Start NestJS and refresh.'; }
  finally { loading.value = false; }
});
</script>

<template>
  <div class="page" id="apollokino.ee">
    <header class="topbar">
      <div class="brand">
        <a href="#apollokino.ee" class="logo" aria-label="Go to main screen">APOLLO <span>KINO</span></a>
        <nav class="logo-actions" aria-label="Main navigation">
          <Button class="nav-button" as="a" href="#movies" label="Movies" size="small" text />
          <Button class="nav-button" label="Theaters" size="small" text @click="showSeatPicker = true" />
          <Button class="nav-button" as="a" href="#about-us" label="About Us" size="small" text />
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
          <Card v-for="(movie, index) in movies" :key="movie.id" class="movie-card">
            <template #header><img :src="getPoster(movie, index)" :alt="movie.title" /></template>
            <template #title>{{ movie.title }}</template>
            <template #subtitle>{{ movie.genre }} · {{ movie.duration }} min</template>
            <template #content><p>{{ movie.description }}</p></template>
            <template #footer><Button label="Choose showtime" icon="pi pi-ticket" outlined /></template>
          </Card>
        </div>
      </section>

      <section id="theaters" class="content">
        <div>Bro</div>
      </section>
    </main>
    <footer>Apollo Kino · School project · First milestone</footer>
  </div>
</template>

<style>
  :root { 
    font-family: Inter, system-ui, sans-serif; 
    color: #f5f5f5; background: #090909; 
  }
  * { box-sizing: border-box; } 
  body { 
    margin: 0; 
    background: #090909; 
  } 
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
    font-weight:900; 
    letter-spacing:.08em; 
    font-size:20px; 
    color:rgb(255, 123, 0);
    font-style: italic;
    display:inline-block;
    cursor:pointer;
    transition:opacity .2s ease;
  }
  .logo:hover {
    opacity: .85;
  }
  .logo span { 
    font-weight:400; 
    color:#888;
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
    border:1px solid #292929; 
  } 
  .movie-card img { 
    width:100%; 
    height:310px; 
    object-fit:cover; 
    display:block; 
  } 
  .movie-card p { 
    color:#aaa; 
    line-height:1.5; 
    min-height:68px; 
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
  footer { 
    border-top:1px solid #222; 
    padding:25px 6vw; 
    color:#666; 
    font-size:13px; }
  @media(max-width:700px){
    .topbar{padding:12px 20px}.brand{width:100%; flex-wrap:wrap; gap:6px 16px}.logo-actions{width:100%; flex-wrap:wrap; gap:4px}.hero{padding:50px 20px}.content{padding:40px 20px}.movie-card img{height:280px}
  }
</style>
