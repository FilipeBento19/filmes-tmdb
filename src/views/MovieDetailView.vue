<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/plugins/axios'
import { useOscar } from '@/composables/useOscar'

const route = useRoute()
const router = useRouter()
const { oscarWinners } = useOscar()

const imageBase = 'https://image.tmdb.org/t/p/w500'
const backdropBase = 'https://image.tmdb.org/t/p/original'

const movie = ref(null)
const credits = ref(null)
const videos = ref([])
const similar = ref([])
const loading = ref(true)
const oscarInfo = ref(null)

// Buscar informações do Oscar para este filme
const findOscarInfo = (movieId) => {
  const awards = []
  
  Object.entries(oscarWinners).forEach(([year, yearData]) => {
    Object.entries(yearData.categories).forEach(([category, data]) => {
      if (data.winner?.tmdbId === movieId) {
        awards.push({
          year: parseInt(year),
          ceremony: yearData.ceremony,
          category: getCategoryName(category),
          categoryKey: category,
          winner: data.winner
        })
      }
    })
  })
  
  return awards.length > 0 ? awards : null
}

const getCategoryName = (key) => {
  const map = {
    bestPicture: 'Melhor Filme',
    bestDirector: 'Melhor Diretor',
    bestActor: 'Melhor Ator',
    bestActress: 'Melhor Atriz',
    bestAnimatedFeature: 'Melhor Animação',
    bestCinematography: 'Melhor Cinematografia',
    bestOriginalScore: 'Melhor Trilha Sonora'
  }
  return map[key] || key
}

const loadMovie = async () => {
  loading.value = true
  
  try {
    const movieId = parseInt(route.params.id)
    
    // Buscar detalhes do filme
    const [movieRes, creditsRes, videosRes, similarRes] = await Promise.all([
      api.get(`/movie/${movieId}?language=pt-BR`),
      api.get(`/movie/${movieId}/credits?language=pt-BR`),
      api.get(`/movie/${movieId}/videos?language=pt-BR`),
      api.get(`/movie/${movieId}/similar?language=pt-BR`)
    ])
    
    movie.value = movieRes.data
    credits.value = creditsRes.data
    videos.value = videosRes.data.results.filter(v => v.type === 'Trailer')
    similar.value = similarRes.data.results.slice(0, 6)
    
    // Buscar informações do Oscar
    oscarInfo.value = findOscarInfo(movieId)
    
  } catch (error) {
    console.error('Erro ao carregar filme:', error)
  } finally {
    loading.value = false
  }
}

const formatRuntime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}min`
}

const formatMoney = (value) => {
  if (!value) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

const goToPerson = (personId) => {
  router.push({ name: 'person', params: { id: personId } })
}

const goToMovie = (movieId) => {
  router.push({ name: 'movie', params: { id: movieId } })
}

const goBack = () => {
  router.back()
}

// Computed
const director = computed(() => {
  return credits.value?.crew?.find(p => p.job === 'Director')
})

const mainCast = computed(() => {
  return credits.value?.cast?.slice(0, 8) || []
})

const trailer = computed(() => {
  return videos.value[0]
})

onMounted(() => {
  loadMovie()
})
</script>

<template>
  <div class="movie-detail">
    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando filme...</p>
    </div>

    <template v-else-if="movie">
      <!-- Hero Backdrop -->
      <section class="hero-backdrop">
        <div class="backdrop-image" v-if="movie.backdrop_path">
          <img :src="backdropBase + movie.backdrop_path" :alt="movie.title" />
        </div>
        <div class="backdrop-overlay"></div>

        <button class="back-btn" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Voltar
        </button>
      </section>

      <!-- Main Content -->
      <section class="movie-content">
        <div class="container">
          <div class="movie-header">
            <!-- Poster -->
            <div class="poster-section">
              <div class="poster">
                <img
                  v-if="movie.poster_path"
                  :src="imageBase + movie.poster_path"
                  :alt="movie.title"
                />
                <div v-else class="no-poster">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              </div>

            </div>

            <!-- Info -->
            <div class="info-section">
              <h1 class="movie-title">{{ movie.title }}</h1>
              
              <p class="original-title" v-if="movie.original_title !== movie.title">
                {{ movie.original_title }}
              </p>

              <div class="movie-meta">
                <span class="rating">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {{ movie.vote_average?.toFixed(1) }}
                </span>
                <span class="year" v-if="movie.release_date">
                  {{ new Date(movie.release_date).getFullYear() }}
                </span>
                <span class="runtime" v-if="movie.runtime">
                  {{ formatRuntime(movie.runtime) }}
                </span>
                <span class="certification" v-if="movie.adult">+18</span>
              </div>

              <!-- Genres -->
              <div class="genres" v-if="movie.genres">
                <span 
                  v-for="genre in movie.genres" 
                  :key="genre.id" 
                  class="genre-tag"
                >
                  {{ genre.name }}
                </span>
              </div>

              <!-- Tagline -->
              <p class="tagline" v-if="movie.tagline">"{{ movie.tagline }}"</p>

              <!-- Overview -->
              <div class="overview">
                <h3>Sinopse</h3>
                <p>{{ movie.overview || 'Sinopse não disponível.' }}</p>
              </div>

              <!-- Director -->
              <div class="director" v-if="director">
                <h3>Direção</h3>
                <button class="director-btn" @click="goToPerson(director.id)">
                  {{ director.name }}
                </button>
              </div>

              <!-- Trailer Button -->
              <div class="actions">
                <a 
                  v-if="trailer"
                  :href="`https://www.youtube.com/watch?v=${trailer.key}`"
                  target="_blank"
                  class="btn-primary"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Assistir Trailer
                </a>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="movie-stats">
            <div class="stat-card">
              <span class="stat-label">Orçamento</span>
              <span class="stat-value">{{ formatMoney(movie.budget) }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Bilheteria</span>
              <span class="stat-value">{{ formatMoney(movie.revenue) }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Votos</span>
              <span class="stat-value">{{ movie.vote_count?.toLocaleString() }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Popularidade</span>
              <span class="stat-value">{{ movie.popularity?.toFixed(0) }}</span>
            </div>
          </div>

          <!-- Cast -->
          <section class="cast-section" v-if="mainCast.length > 0">
            <h2>Elenco Principal</h2>
            <div class="cast-grid">
              <article 
                v-for="person in mainCast" 
                :key="person.id"
                class="cast-card"
                @click="goToPerson(person.id)"
              >
                <div class="cast-photo">
                  <img
                    v-if="person.profile_path"
                    :src="imageBase + person.profile_path"
                    :alt="person.name"
                    loading="lazy"
                  />
                  <div v-else class="no-photo">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                </div>
                <div class="cast-info">
                  <h4>{{ person.name }}</h4>
                  <p>{{ person.character }}</p>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.movie-detail {
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
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(212, 175, 55, 0.2);
  border-top-color: var(--oscar-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Hero Backdrop */
.hero-backdrop {
  position: relative;
  height: 60vh;
  overflow: hidden;
}

.backdrop-image {
  position: absolute;
  inset: 0;
}

.backdrop-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.backdrop-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(10, 10, 10, 0.3) 0%,
    rgba(10, 10, 10, 0.7) 50%,
    var(--oscar-dark-bg) 100%
  );
}

.back-btn {
  position: absolute;
  top: 6rem;
  left: 3rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: var(--oscar-gold);
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.back-btn:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: var(--oscar-gold);
}

/* Container */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

/* Movie Content */
.movie-content {
  margin-top: -15rem;
  position: relative;
  z-index: 5;
  padding-bottom: 5rem;
}

.movie-header {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

/* Poster */
.poster-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.poster {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(212, 175, 55, 0.3);
}

.poster img {
  width: 100%;
  display: block;
}

.no-poster {
  aspect-ratio: 2/3;
  background: var(--oscar-card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(212, 175, 55, 0.3);
}

/* Oscar Awards */
.oscar-awards {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
}

.oscar-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--oscar-gold);
  font-weight: 800;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.oscar-title svg {
  fill: var(--oscar-gold);
}

.oscar-award {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.award-category {
  color: #fff;
  font-weight: 600;
}

.award-year {
  background: var(--oscar-gradient);
  color: var(--oscar-black);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 700;
}

/* Info Section */
.info-section {
  padding-top: 2rem;
}

.movie-title {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 0.5rem;
  color: #fff;
}

.original-title {
  color: var(--oscar-text-secondary);
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  font-family: 'Montserrat', sans-serif;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--oscar-gold);
  font-weight: 700;
  font-size: 1.2rem;
}

.rating svg {
  fill: var(--oscar-gold);
}

.year, .runtime {
  color: var(--oscar-text-secondary);
  font-size: 1.1rem;
}

.certification {
  background: #e50914;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 700;
}

/* Genres */
.genres {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.genre-tag {
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: var(--oscar-gold);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.tagline {
  color: var(--oscar-gold);
  font-size: 1.2rem;
  font-style: italic;
  margin-bottom: 2rem;
  font-family: 'Montserrat', sans-serif;
}

.overview {
  margin-bottom: 2rem;
}

.overview h3, .director h3 {
  color: var(--oscar-gold);
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.overview p {
  color: var(--oscar-text-secondary);
  line-height: 1.7;
  font-size: 1.05rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
}

.director {
  margin-bottom: 2rem;
}

.director-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.3s;
}

.director-btn:hover {
  color: var(--oscar-gold);
}

/* Actions */
.actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: var(--oscar-gradient);
  color: var(--oscar-black);
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.4);
}

/* Stats */
.movie-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.stat-card {
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.stat-label {
  display: block;
  color: var(--oscar-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-family: 'Montserrat', sans-serif;
}

.stat-value {
  color: var(--oscar-gold);
  font-size: 1.3rem;
  font-weight: 800;
}

/* Cast Section */
.cast-section, .similar-section {
  margin-bottom: 4rem;
}

.cast-section h2, .similar-section h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 2rem;
  color: #fff;
}

.cast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
}

.cast-card {
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.cast-card:hover {
  transform: translateY(-5px);
  border-color: var(--oscar-gold);
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);
}

.cast-photo {
  aspect-ratio: 1;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.cast-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-photo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(212, 175, 55, 0.3);
}

.cast-info {
  padding: 1rem;
}

.cast-info h4 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #fff;
}

.cast-info p {
  font-size: 0.8rem;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
}

/* Similar Movies */
.similar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.similar-card {
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.similar-card:hover {
  transform: translateY(-5px);
  border-color: var(--oscar-gold);
}

.similar-poster {
  aspect-ratio: 2/3;
  overflow: hidden;
}

.similar-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-poster-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: rgba(255, 255, 255, 0.05);
}

.similar-info {
  padding: 1rem;
}

.similar-info h4 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #fff;
  line-height: 1.2;
}

.similar-rating {
  color: var(--oscar-gold);
  font-size: 0.85rem;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1.5rem;
  }

  .back-btn {
    left: 1.5rem;
    top: 5rem;
  }

  .movie-header {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .poster-section {
    max-width: 250px;
    margin: 0 auto;
  }

  .movie-title {
    font-size: 2rem;
  }

  .movie-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .cast-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>