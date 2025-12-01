<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useOscar } from '@/composables/useOscar'

import { useRouter } from 'vue-router'

const router = useRouter()

const goToMovie = (movieId) => {
  router.push({ name: 'movie', params: { id: movieId } })
}

const goToPerson = (personId) => {
  router.push({ name: 'person', params: { id: personId } })
}

const imageBase = 'https://image.tmdb.org/t/p/w500'
const imageBannerBase = 'https://image.tmdb.org/t/p/original'

const { oscarWinners, fetchMovieDetails, fetchPersonDetails } = useOscar()

// Estados
const loading = ref(true)
const featuredMovies = ref([])
const currentIndex = ref(0)
const carousels = ref({
  bestPicture: [],
  topRated: [],
  recent: [],
  animation: [],
  directors: [],
  actors: []
})

let autoplayTimer = null

// Computed
const currentMovie = computed(() => featuredMovies.value[currentIndex.value] || null)

const stats = computed(() => ({
  ceremonies: Object.keys(oscarWinners).length,
  bestPictures: carousels.value.bestPicture.length,
  animations: carousels.value.animation.length,
  categories: 23
}))

// Navegação do Banner
const navigate = (direction) => {
  const total = featuredMovies.value.length
  currentIndex.value = direction === 'next' 
    ? (currentIndex.value + 1) % total 
    : (currentIndex.value - 1 + total) % total
  resetAutoplay()
}

// Autoplay
const startAutoplay = () => {
  stopAutoplay()
  autoplayTimer = setInterval(() => navigate('next'), 7000)
}

const stopAutoplay = () => {
  if (autoplayTimer) clearInterval(autoplayTimer)
}

const resetAutoplay = () => {
  stopAutoplay()
  startAutoplay()
}

const loadData = async () => {
  loading.value = true

  try {
    const years = Object.keys(oscarWinners)
      .map(Number)
      .sort((a, b) => b - a)
      .slice(0, 20)

    const allMovies = []
    const allAnimations = []
    const allDirectors = []
    const allActors = []

    const requests = []

    for (const year of years) {
      const yearData = oscarWinners[year]

      // Melhor Filme
      const bestPicture = yearData.categories.bestPicture?.winner
      if (bestPicture?.tmdbId) {
        requests.push(
          fetchMovieDetails(bestPicture.tmdbId).then(movie => {
            if (movie) {
              allMovies.push({
                ...movie,
                oscarYear: year,
                ceremony: yearData.ceremony
              })
            }
          })
        )
      }

      // Animação
      const animation = yearData.categories.bestAnimatedFeature?.winner
      if (animation?.tmdbId) {
        requests.push(
          fetchMovieDetails(animation.tmdbId).then(movie => {
            if (movie) {
              allAnimations.push({
                ...movie,
                oscarYear: year
              })
            }
          })
        )
      }

      // Diretor
      const director = yearData.categories.bestDirector?.winner
      if (director?.tmdbId) {
        requests.push(
          fetchPersonDetails(director.tmdbId).then(person => {
            if (person) {
              allDirectors.push({
                ...person,
                oscarYear: year,
                oscarData: director,
                movieTitle: director.title
              })
            }
          })
        )
      }

      // Ator
      const actor = yearData.categories.bestActor?.winner
      if (actor?.tmdbId) {
        requests.push(
          fetchPersonDetails(actor.tmdbId).then(person => {
            if (person) {
              allActors.push({
                ...person,
                oscarYear: year,
                oscarData: actor,
                movieTitle: actor.title
              })
            }
          })
        )
      }
    }

    // AGORA roda tudo ao mesmo tempo
    await Promise.all(requests)

    carousels.value = {
      bestPicture: allMovies.slice(0, 12),
      topRated: [...allMovies]
        .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
        .slice(0, 12),
      recent: allMovies.slice(0, 6),
      animation: allAnimations.slice(0, 12),
      directors: allDirectors.slice(0, 12),
      actors: allActors.slice(0, 12)
    }

    featuredMovies.value = allMovies.slice(0, 5)

    if (featuredMovies.value.length > 0) {
      setTimeout(startAutoplay, 1000)
    }

  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    loading.value = false
  }
}


onMounted(loadData)
onUnmounted(stopAutoplay)
</script>

<template>
  <div class="home">
    <!-- Loading -->
    <div v-if="loading" class="loading">
      <svg class="spinner" width="60" height="60" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="7" stroke="url(#gold)" stroke-width="2" fill="none"/>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" stroke="url(#gold)" stroke-width="2" fill="none"/>
        <defs>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFD700"/>
            <stop offset="100%" stop-color="#B8941F"/>
          </linearGradient>
        </defs>
      </svg>
      <p>Carregando vencedores do Oscar...</p>
    </div>

    <!-- Content -->
    <template v-else>
      
      <!-- Hero Banner -->
      <section v-if="currentMovie" class="hero">
        <div class="hero-bg">
          <img 
            v-if="currentMovie.backdrop_path"
            :src="imageBannerBase + currentMovie.backdrop_path" 
            :alt="currentMovie.title"
          />
          <div class="hero-overlay"></div>
        </div>

        <button class="nav-btn prev" @click="navigate('prev')">‹</button>
        <button class="nav-btn next" @click="navigate('next')">›</button>

        <div class="hero-content">
          <span class="badge">🏆 OSCAR {{ currentMovie.oscarYear }} - MELHOR FILME</span>
          <h1>{{ currentMovie.title }}</h1>
          <div class="meta">
            <span>⭐ {{ currentMovie.vote_average?.toFixed(1) }}</span>
            <span>{{ new Date(currentMovie.release_date).getFullYear() }}</span>
          </div>
          <p class="desc">{{ currentMovie.overview?.substring(0, 200) }}...</p>
          <div class="buttons">
            <button class="btn primary" @click="goToMovie(currentMovie.id)">▶ Ver Detalhes</button>
          </div>
        </div>

        <div class="indicators">
          <button
            v-for="(movie, idx) in featuredMovies"
            :key="movie.id"
            @click="currentIndex = idx; resetAutoplay()"
            :class="['indicator', { active: idx === currentIndex }]"
          />
        </div>
      </section>

      <!-- Stats -->
      <!-- Stats -->
<section class="stats">
  <div class="container">
    <div class="stats-grid">
      <div class="stat">
        <div class="icon">
          <img src="/imgs/clapperboard.png" class="imgsicon" alt="Edições">
        </div>
        <div class="num">{{ stats.ceremonies }}</div>
        <div class="label">Edições</div>
      </div>
      <div class="stat">
        <div class="icon">
          <img src="/imgs/theater.png" class="imgsicon" alt="Melhores Filmes">
        </div>
        <div class="num">{{ stats.bestPictures }}</div>
        <div class="label">Melhores Filmes</div>
      </div>
      <div class="stat">
        <div class="icon">
          <img src="/imgs/star.png" class="imgsicon" alt="Categorias">
        </div>
        <div class="num">{{ stats.categories }}</div>
        <div class="label">Categorias</div>
      </div>
      <div class="stat">
        <div class="icon">
          <img src="/imgs/paint-palette.png" class="imgsicon" alt="Animações">
        </div>
        <div class="num">{{ stats.animations }}</div>
        <div class="label">Animações</div>
      </div>
    </div>
  </div>
</section>


      <!-- Carrosséis -->
      <div class="carousels">
        <div class="container">
          
          <!-- Melhores Filmes -->
          <section class="carousel" v-if="carousels.bestPicture.length">
            <h2>Melhores Filmes de Todos os Tempos</h2>
            <div class="scroll">
              <article v-for="movie in carousels.bestPicture" :key="movie.id" class="card" @click="goToMovie(movie.id)">
                <img v-if="movie.poster_path" :src="imageBase + movie.poster_path" :alt="movie.title" loading="lazy" />
                <div v-else class="no-img">🎬</div>
                <div class="info">
                  <h3>{{ movie.title }}</h3>
                  <div class="meta">
                    <span>⭐ {{ movie.vote_average?.toFixed(1) }}</span>
                    <span>{{ new Date(movie.release_date).getFullYear() }}</span>
                  </div>
                  <span class="year">Oscar {{ movie.oscarYear }}</span>
                </div>
              </article>
            </div>
          </section>

          <!-- Aclamados pela Crítica -->
          <section class="carousel" v-if="carousels.topRated.length">
            <h2>Aclamados pela Crítica</h2>
            <div class="scroll">
              <article v-for="movie in carousels.topRated" :key="'top-' + movie.id" class="card" @click="goToMovie(movie.id)">
                <img v-if="movie.poster_path" :src="imageBase + movie.poster_path" :alt="movie.title" loading="lazy"/>
                <div v-else class="no-img">🎬</div>
                <div class="info">
                  <h3>{{ movie.title }}</h3>
                  <div class="meta">
                    <span>⭐ {{ movie.vote_average?.toFixed(1) }}</span>
                    <span>{{ new Date(movie.release_date).getFullYear() }}</span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- Vencedores Recentes -->
          <section class="carousel" v-if="carousels.recent.length">
            <h2>Vencedores Recentes</h2>
            <div class="scroll">
              <article v-for="movie in carousels.recent" :key="'recent-' + movie.id" class="card" @click="goToMovie(movie.id)">
                <img v-if="movie.poster_path" :src="imageBase + movie.poster_path"  :alt="movie.title" loading="lazy"/>
                <div v-else class="no-img">🎬</div>
                <div class="info">
                  <h3>{{ movie.title }}</h3>
                  <div  class="meta">
                    <span>⭐ {{ movie.vote_average?.toFixed(1) }}</span>
                  </div>
                  <span class="year">Oscar {{ movie.oscarYear }}</span>
                </div>
              </article>
            </div>
          </section>

          <!-- Animações -->
          <section class="carousel" v-if="carousels.animation.length">
            <h2>Melhores Animações</h2>
            <div class="scroll">
              <article v-for="movie in carousels.animation" :key="'anim-' + movie.id" class="card" @click="goToMovie(movie.id)">
                <img v-if="movie.poster_path" :src="imageBase + movie.poster_path" :alt="movie.title" loading="lazy"/>
                <div v-else class="no-img">🎨</div>
                <div class="info">
                  <h3>{{ movie.title }}</h3>
                  <div class="meta">
                    <span>⭐ {{ movie.vote_average?.toFixed(1) }}</span>
                  </div>
                  <span class="year">Oscar {{ movie.oscarYear }}</span>
                </div>
              </article>
            </div>
          </section>

          <!-- Diretores -->
          <section class="carousel persons" v-if="carousels.directors.length">
            <h2>Melhores Diretores</h2>
            <div class="scroll">
              <article v-for="person in carousels.directors" :key="'dir-' + person.id" class="person-card" @click="goToPerson(person.id)">
                <img v-if="person.profile_path" :src="imageBase + person.profile_path" :alt="person.oscarData.name" loading="lazy"/>
                <div v-else class="no-img">🎥</div>
                <div class="info">
                  <h3>{{ person.oscarData.name }}</h3>
                  <p class="movie">{{ person.movieTitle }}</p>
                  <span class="year">Oscar {{ person.oscarYear }}</span>
                </div>
              </article>
            </div>
          </section>

          <!-- Atores -->
          <section class="carousel persons" v-if="carousels.actors.length">
            <h2>Melhores Atores</h2>
            <div class="scroll">
              <article v-for="person in carousels.actors" :key="'act-' + person.id" class="person-card" @click="goToPerson(person.id)">
                <img v-if="person.profile_path" :src="imageBase + person.profile_path" :alt="person.oscarData.name" loading="lazy"/>
                <div v-else class="no-img">🎭</div>
                <div class="info">
                  <h3>{{ person.oscarData.name }}</h3>
                  <p class="movie">{{ person.movieTitle }}</p>
                  <span class="year">Oscar {{ person.oscarYear }}</span>
                </div>
              </article>
            </div>
          </section>

        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--oscar-dark-bg);
  color: var(--oscar-text);
}

/* Loading */
.loading {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.spinner {
  animation: rotate 2s linear infinite;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

.loading p {
  color: var(--oscar-gold);
  font-family: 'Montserrat', sans-serif;
}

/* Hero */
.hero {
  position: relative;
  height: 85vh;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
}

.hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: zoom 10s ease-out;
}

@keyframes zoom {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--oscar-dark-bg) 0%, transparent 70%),
              linear-gradient(to right, rgba(10,10,10,0.95) 0%, transparent 50%);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: var(--oscar-gold);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.nav-btn:hover {
  background: rgba(212, 175, 55, 0.4);
  transform: translateY(-50%) scale(1.1);
}

.prev { left: 2rem; }
.next { right: 2rem; }

.hero-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 6rem;
  max-width: 900px;
  z-index: 1;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid var(--oscar-gold);
  color: var(--oscar-gold);
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  width: fit-content;max-w: 200px;
  margin-bottom: 1.5rem;
  font-family: 'Montserrat', sans-serif;
  backdrop-filter: blur(10px);
}

.hero-content h1 {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1rem;
  line-height: 1.1;
  text-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
}

.meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  font-family: 'Montserrat', sans-serif;
}

.meta span:first-child {
  color: var(--oscar-gold);
  font-weight: 700;
}

.desc {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  color: #e1e1e1;
}

.buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.primary {
  background: var(--oscar-gradient);
  color: var(--oscar-black);
}

.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.5);
}

.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(212, 175, 55, 0.3);
  color: var(--oscar-gold);
  backdrop-filter: blur(10px);
}

.secondary:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: var(--oscar-gold);
}

.indicators {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem;
  z-index: 10;
}

.indicator {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.5);
}

.indicator.active {
  background: var(--oscar-gold);
  width: 60px;
}

/* Stats */
.stats {
  padding: 3rem 0;
  margin-top: -4rem;
  position: relative;
  z-index: 2;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.stat {
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
}

.stat:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--oscar-gold);
  transform: translateY(-5px);
}

.icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;

}

.imgsicon{
  max-width: 140px;
}

.num {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--oscar-gold);
  margin-bottom: 0.5rem;
}

.label {
  font-size: 0.9rem;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
}

/* Carousels */
.carousels {
  padding: 3rem 0 5rem;
}

.carousel {
  margin-bottom: 3rem;
}

.carousel h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
}

.scroll {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  padding-top: 1rem;
  scrollbar-width: thin;
  scrollbar-color: var(--oscar-gold) transparent;
}

.scroll::-webkit-scrollbar {
  height: 8px;
}

.scroll::-webkit-scrollbar-thumb {
  background: var(--oscar-gradient);
  border-radius: 10px;
}

.card {
  min-width: 220px;
  cursor: pointer;
  transition: transform 0.3s;
  position: relative;
}

.card:hover {
  transform: scale(1.05);
  z-index: 10;
}

.top {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--oscar-gradient);
  color: var(--oscar-black);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 900;
  z-index: 10;
}

.card img,
.person-card img {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 12px;
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.no-img {
  width: 100%;
  aspect-ratio: 2/3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: var(--oscar-card-bg);
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.card .info,
.person-card .info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.95), transparent);
  padding: 1.5rem 1rem;
  border-radius: 0 0 12px 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.card:hover .info,
.person-card:hover .info {
  opacity: 1;
}

.info h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.info .meta {
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.info .year,
.info .movie {
  font-size: 0.75rem;
  color: var(--oscar-gold);
  font-family: 'Montserrat', sans-serif;
  text-align: center;
}

.info .movie {
  margin-bottom: 0.5rem;
  display: block;
}

/* Persons Carousel */
.persons .scroll {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 200px;
}

.person-card {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s;
}

.person-card:hover {
  transform: translateY(-10px);
}

.person-card img {
  aspect-ratio: 3/4;
  border-radius: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    height: 70vh;
  }

  .hero-content {
    padding: 0 2rem;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }

  .prev { left: 1rem; }
  .next { right: 1rem; }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .buttons {
    flex-direction: column;
  }

  .card {
    min-width: 160px;
  }

  .persons .scroll {
    grid-auto-columns: 140px;
  }
}
</style>