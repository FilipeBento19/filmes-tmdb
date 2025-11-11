<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useOscar } from '@/composables/useOscar'

const imageBase = 'https://image.tmdb.org/t/p/w500'
const imageBannerBase = 'https://image.tmdb.org/t/p/original'

const { 
  fetchBestPictureWinners,
  fetchCategoryWinners,
  oscarWinners
} = useOscar()

const featuredWinner = ref(null)
const featuredMovies = ref([])
const currentFeaturedIndex = ref(0)
const bestPictureWinners = ref([])
const bestActorMovies = ref([])
const bestActressMovies = ref([])
const animationWinners = ref([])
const topRatedOscar = ref([])
const recentWinners = ref([])
const loading = ref(true)

let autoplayInterval = null
const isTransitioning = ref(false)

const changeFeaturedMovie = (index) => {
  if (isTransitioning.value || !featuredMovies.value.length) return
  
  isTransitioning.value = true
  currentFeaturedIndex.value = index
  featuredWinner.value = featuredMovies.value[index]
  
  setTimeout(() => {
    isTransitioning.value = false
  }, 500)
}

const nextFeatured = () => {
  const nextIndex = (currentFeaturedIndex.value + 1) % featuredMovies.value.length
  changeFeaturedMovie(nextIndex)
}

const prevFeatured = () => {
  const prevIndex = currentFeaturedIndex.value === 0 
    ? featuredMovies.value.length - 1 
    : currentFeaturedIndex.value - 1
  changeFeaturedMovie(prevIndex)
}

const startAutoplay = () => {
  stopAutoplay()
  autoplayInterval = setInterval(() => {
    nextFeatured()
  }, 7000)
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

const resetAutoplay = () => {
  stopAutoplay()
  startAutoplay()
}

const loadAllContent = async () => {
  loading.value = true
  try {
    const bestPictures = await fetchBestPictureWinners()
    bestPictureWinners.value = bestPictures.slice(0, 15)
    
    featuredMovies.value = bestPictures.slice(0, 5)
    
    if (featuredMovies.value.length > 0) {
      featuredWinner.value = featuredMovies.value[0]
      currentFeaturedIndex.value = 0
      
      setTimeout(() => {
        startAutoplay()
      }, 1000)
    }

    const animations = await fetchCategoryWinners('bestAnimatedFeature')
    animationWinners.value = animations.slice(0, 15)

    const actors = await fetchCategoryWinners('bestActor')
    bestActorMovies.value = actors.slice(0, 15)

    const actresses = await fetchCategoryWinners('bestActress')
    bestActressMovies.value = actresses.slice(0, 15)

    const allWinners = [...bestPictures]
    topRatedOscar.value = allWinners
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 15)

    const recentYears = [2024, 2023, 2022, 2021, 2020]
    const recentMovies = []
    
    for (const year of recentYears) {
      const yearData = oscarWinners[year]
      if (yearData?.categories?.bestPicture?.winner) {
        const movie = bestPictures.find(m => m.id === yearData.categories.bestPicture.winner.tmdbId)
        if (movie) {
          recentMovies.push(movie)
        }
      }
    }
    
    recentWinners.value = recentMovies

  } catch (error) {
    console.error('Erro ao carregar vencedores:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAllContent()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<template>
  <div class="oscar-home">
    <!-- Loading -->
    <div v-if="loading" class="loading-screen">
      <div class="oscar-spinner">
        <svg class="spinning-oscar" width="80" height="80" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L9 8H15L12 2Z" fill="url(#gold-gradient)"/>
          <circle cx="12" cy="10" r="2" fill="url(#gold-gradient)"/>
          <path d="M12 12L10 18H14L12 12Z" fill="url(#gold-gradient)"/>
          <rect x="8" y="18" width="8" height="2" fill="url(#gold-gradient)"/>
          <rect x="7" y="20" width="10" height="2" fill="url(#gold-gradient)"/>
          <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FFD700"/>
              <stop offset="100%" style="stop-color:#B8941F"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <p class="loading-text">Carregando os vencedores do Oscar...</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Hero Banner Rotativo -->
      <section class="hero-banner" v-if="featuredWinner">
        <div class="hero-background" :class="{ 'transitioning': isTransitioning }">
          <img 
            v-if="featuredWinner.backdrop_path"
            :src="imageBannerBase + featuredWinner.backdrop_path" 
            :alt="featuredWinner.title"
            :key="featuredWinner.id"
          />
          <div class="hero-gradient"></div>
          <div class="oscar-pattern"></div>
        </div>

        <button 
          class="hero-nav-btn hero-nav-prev" 
          @click="prevFeatured(); resetAutoplay()"
          aria-label="Filme anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <button 
          class="hero-nav-btn hero-nav-next" 
          @click="nextFeatured(); resetAutoplay()"
          aria-label="Próximo filme"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        
        <div class="hero-content" :class="{ 'transitioning': isTransitioning }">
          <div class="hero-badge">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="7" stroke="currentColor" stroke-width="2"/>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>OSCAR {{ featuredWinner.oscarData?.oscarYear || '2024' }} - MELHOR FILME</span>
          </div>
          
          <h1 class="hero-title">{{ featuredWinner.title }}</h1>
          
          <div class="hero-meta">
            <span class="rating">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {{ featuredWinner.vote_average?.toFixed(1) || 'N/A' }}
            </span>
            <span class="year">{{ new Date(featuredWinner.release_date).getFullYear() }}</span>
            <span class="awards">🏆 Vencedor do Oscar</span>
          </div>
          
          <p class="hero-overview">{{ featuredWinner.overview || 'Vencedor do Oscar de Melhor Filme' }}</p>
          
          <div class="hero-buttons">
            <button class="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Ver Detalhes
            </button>
            <button class="btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              Minha Lista
            </button>
          </div>
        </div>

        <div class="hero-indicators">
          <button
            v-for="(movie, index) in featuredMovies"
            :key="movie.id"
            @click="changeFeaturedMovie(index); resetAutoplay()"
            :class="['indicator', { active: index === currentFeaturedIndex }]"
            :aria-label="`Ver ${movie.title}`"
          >
            <div class="indicator-progress" v-if="index === currentFeaturedIndex"></div>
          </button>
        </div>
      </section>

      <!-- Estatísticas -->
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🏆</div>
              <div class="stat-number">96</div>
              <div class="stat-label">Edições do Oscar</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎬</div>
              <div class="stat-number">{{ bestPictureWinners.length }}</div>
              <div class="stat-label">Filmes Premiados</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-number">23</div>
              <div class="stat-label">Categorias</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎭</div>
              <div class="stat-number">{{ animationWinners.length }}</div>
              <div class="stat-label">Animações Premiadas</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Carrosséis -->
      <div class="carousels-container">
        <!-- 1. Melhores Filmes -->
        <section class="oscar-carousel" v-if="bestPictureWinners.length > 0">
          <div class="container">
            <div class="carousel-header">
              <h2 class="carousel-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="8" r="7"/>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                </svg>
                Melhores Filmes de Todos os Tempos
              </h2>
            </div>
            
            <div class="carousel-scroll">
              <div class="oscar-cards">
                <article 
                  v-for="(movie, index) in bestPictureWinners" 
                  :key="movie.id"
                  class="oscar-card"
                >
                  <div class="card-badge" v-if="index < 3">TOP {{ index + 1 }}</div>
                  <div class="card-image">
                    <img 
                      v-if="movie.poster_path"
                      :src="imageBase + movie.poster_path" 
                      :alt="movie.title"
                      loading="lazy"
                    />
                    <div v-else class="no-poster">🎬</div>
                    <div class="card-overlay">
                      <div class="oscar-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L9 8H15L12 2Z" fill="url(#gold)"/>
                          <circle cx="12" cy="10" r="2" fill="url(#gold)"/>
                          <path d="M12 12L10 18H14L12 12Z" fill="url(#gold)"/>
                          <rect x="8" y="18" width="8" height="2" fill="url(#gold)"/>
                          <defs>
                            <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style="stop-color:#FFD700"/>
                              <stop offset="100%" style="stop-color:#B8941F"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div class="card-info">
                        <h3>{{ movie.title }}</h3>
                        <div class="meta">
                          <span class="rating">⭐ {{ movie.vote_average?.toFixed(1) }}</span>
                          <span class="year">{{ new Date(movie.release_date).getFullYear() }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Aclamados pela Crítica -->
        <section class="oscar-carousel" v-if="topRatedOscar.length > 0">
          <div class="container">
            <div class="carousel-header">
              <h2 class="carousel-title">⭐ Aclamados pela Crítica</h2>
            </div>
            
            <div class="carousel-scroll">
              <div class="oscar-cards">
                <article 
                  v-for="movie in topRatedOscar" 
                  :key="'top-' + movie.id"
                  class="oscar-card"
                >
                  <div class="card-image">
                    <img 
                      v-if="movie.poster_path"
                      :src="imageBase + movie.poster_path" 
                      :alt="movie.title"
                      loading="lazy"
                    />
                    <div v-else class="no-poster">🎬</div>
                    <div class="card-overlay">
                      <div class="oscar-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div class="card-info">
                        <h3>{{ movie.title }}</h3>
                        <div class="meta">
                          <span class="rating">⭐ {{ movie.vote_average?.toFixed(1) }}</span>
                          <span class="year">{{ new Date(movie.release_date).getFullYear() }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. Vencedores Recentes -->
        <section class="oscar-carousel" v-if="recentWinners.length > 0">
          <div class="container">
            <div class="carousel-header">
              <h2 class="carousel-title">🎬 Vencedores Recentes</h2>
            </div>
            
            <div class="carousel-scroll">
              <div class="oscar-cards">
                <article 
                  v-for="movie in recentWinners" 
                  :key="'recent-' + movie.id"
                  class="oscar-card"
                >
                  <div class="card-image">
                    <img 
                      v-if="movie.poster_path"
                      :src="imageBase + movie.poster_path" 
                      :alt="movie.title"
                      loading="lazy"
                    />
                    <div v-else class="no-poster">🎬</div>
                    <div class="card-overlay">
                      <div class="oscar-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="8" r="7"/>
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                        </svg>
                      </div>
                      <div class="card-info">
                        <h3>{{ movie.title }}</h3>
                        <div class="meta">
                          <span class="rating">⭐ {{ movie.vote_average?.toFixed(1) }}</span>
                          <span class="year">{{ new Date(movie.release_date).getFullYear() }}</span>
                        </div>
                        <p class="oscar-year">Oscar {{ movie.oscarData?.oscarYear }}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. Melhores Animações -->
        <section class="oscar-carousel" v-if="animationWinners.length > 0">
          <div class="container">
            <div class="carousel-header">
              <h2 class="carousel-title">🎨 Melhores Animações</h2>
            </div>
            
            <div class="carousel-scroll">
              <div class="oscar-cards">
                <article 
                  v-for="movie in animationWinners" 
                  :key="'animation-' + movie.id"
                  class="oscar-card"
                >
                  <div class="card-image">
                    <img 
                      v-if="movie.poster_path"
                      :src="imageBase + movie.poster_path" 
                      :alt="movie.title"
                      loading="lazy"
                    />
                    <div v-else class="no-poster">🎨</div>
                    <div class="card-overlay">
                      <div class="oscar-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div class="card-info">
                        <h3>{{ movie.title }}</h3>
                        <div class="meta">
                          <span class="rating">⭐ {{ movie.vote_average?.toFixed(1) }}</span>
                          <span class="year">{{ new Date(movie.release_date).getFullYear() }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. Melhor Ator -->
        <section class="oscar-carousel" v-if="bestActorMovies.length > 0">
          <div class="container">
            <div class="carousel-header">
              <h2 class="carousel-title">🎭 Vencedores de Melhor Ator</h2>
            </div>
            
            <div class="carousel-scroll">
              <div class="oscar-cards">
                <article 
                  v-for="movie in bestActorMovies" 
                  :key="'actor-' + movie.id"
                  class="oscar-card"
                >
                  <div class="card-image">
                    <img 
                      v-if="movie.poster_path"
                      :src="imageBase + movie.poster_path" 
                      :alt="movie.title"
                      loading="lazy"
                    />
                    <div v-else class="no-poster">🎭</div>
                    <div class="card-overlay">
                      <div class="oscar-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div class="card-info">
                        <h3>{{ movie.title }}</h3>
                        <div class="meta">
                          <span class="rating">⭐ {{ movie.vote_average?.toFixed(1) }}</span>
                          <span class="year">{{ new Date(movie.release_date).getFullYear() }}</span>
                        </div>
                        <p class="actor-name" v-if="movie.oscarData?.name">{{ movie.oscarData.name }}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <!-- 6. Melhor Atriz -->
        <section class="oscar-carousel" v-if="bestActressMovies.length > 0">
          <div class="container">
            <div class="carousel-header">
              <h2 class="carousel-title">👑 Vencedoras de Melhor Atriz</h2>
            </div>
            
            <div class="carousel-scroll">
              <div class="oscar-cards">
                <article 
                  v-for="movie in bestActressMovies" 
                  :key="'actress-' + movie.id"
                  class="oscar-card"
                >
                  <div class="card-image">
                    <img 
                      v-if="movie.poster_path"
                      :src="imageBase + movie.poster_path" 
                      :alt="movie.title"
                      loading="lazy"
                    />
                    <div v-else class="no-poster">👑</div>
                    <div class="card-overlay">
                      <div class="oscar-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div class="card-info">
                        <h3>{{ movie.title }}</h3>
                        <div class="meta">
                          <span class="rating">⭐ {{ movie.vote_average?.toFixed(1) }}</span>
                          <span class="year">{{ new Date(movie.release_date).getFullYear() }}</span>
                        </div>
                        <p class="actor-name" v-if="movie.oscarData?.name">{{ movie.oscarData.name }}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.oscar-home {
  min-height: 100vh;
  background: var(--oscar-dark-bg);
  color: var(--oscar-text);
}

/* Loading */
.loading-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.spinning-oscar {
  animation: rotate 2s linear infinite;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-family: 'Montserrat', sans-serif;
  color: var(--oscar-gold);
  font-size: 1.1rem;
  letter-spacing: 0.1em;
}

/* Hero Banner */
.hero-banner {
  position: relative;
  height: 90vh;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  transition: opacity 0.5s ease-in-out;
}

.hero-background.transitioning {
  opacity: 0;
}

.hero-background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: zoomIn 7s ease-out forwards;
}

@keyframes zoomIn {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    var(--oscar-dark-bg) 0%,
    rgba(10, 10, 10, 0.8) 40%,
    transparent 100%
  ),
  linear-gradient(
    to right,
    rgba(10, 10, 10, 0.95) 0%,
    transparent 60%
  );
}

.oscar-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 100px,
      rgba(212, 175, 55, 0.02) 100px,
      rgba(212, 175, 55, 0.02) 200px
    );
}

.hero-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 6rem;
  max-width: 900px;
  z-index: 1;
  transition: all 0.5s ease-in-out;
}

.hero-content.transitioning {
  opacity: 0;
  transform: translateY(20px);
}

/* Navegação Hero */
.hero-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: var(--oscar-gold);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.hero-nav-btn:hover {
  background: rgba(212, 175, 55, 0.4);
  border-color: var(--oscar-gold);
  transform: translateY(-50%) scale(1.1);
}

.hero-nav-prev {
  left: 1rem;
}

.hero-nav-next {
  right: 1rem;
}

/* Indicadores */
.hero-indicators {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem;
  z-index: 100;
}

.indicator {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.5);
}

.indicator.active {
  background: var(--oscar-gold);
  width: 60px;
}

.indicator-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  animation: progress 7s linear;
}

@keyframes progress {
  from { width: 0%; }
  to { width: 100%; }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid var(--oscar-gold);
  color: var(--oscar-gold);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  width: fit-content;
  margin-bottom: 2rem;
  font-family: 'Montserrat', sans-serif;
  backdrop-filter: blur(10px);
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  color: #fff;
  text-shadow: 
    0 0 30px rgba(212, 175, 55, 0.3),
    0 4px 20px rgba(0, 0, 0, 0.8);
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  font-family: 'Montserrat', sans-serif;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--oscar-gold);
  font-weight: 700;
}

.year {
  color: var(--oscar-text-secondary);
  font-weight: 600;
}

.awards {
  color: var(--oscar-gold);
  font-size: 0.9rem;
}

.hero-overview {
  font-size: 1.15rem;
  line-height: 1.7;
  color: #e1e1e1;
  margin-bottom: 2.5rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.1rem 2.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.05em;
}

.btn-primary {
  background: var(--oscar-gradient);
  color: var(--oscar-black);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(212, 175, 55, 0.3);
  color: var(--oscar-gold);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--oscar-gold);
  transform: translateY(-3px);
}

/* Stats Section */
.stats-section {
  padding: 3rem 0;
  background: linear-gradient(180deg, transparent 0%, rgba(212, 175, 55, 0.03) 100%);
  margin-top: -6rem;
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
  padding-top: 5rem;
}

.stat-card {
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.stat-card:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--oscar-gold);
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--oscar-gold);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.05em;
}

/* Carousels */
.carousels-container {
  padding: 3rem 0 5rem;
}

.oscar-carousel {
  margin-bottom: 4rem;
}

.carousel-header {
  margin-bottom: 2rem;
}

.carousel-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.carousel-title svg {
  fill: var(--oscar-gold);
}

.carousel-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--oscar-gold) transparent;
}

.carousel-scroll::-webkit-scrollbar {
  height: 8px;
}

.carousel-scroll::-webkit-scrollbar-track {
  background: rgba(212, 175, 55, 0.1);
  border-radius: 10px;
}

.carousel-scroll::-webkit-scrollbar-thumb {
  background: var(--oscar-gradient);
  border-radius: 10px;
}

.oscar-cards {
  display: flex;
  gap: 1.5rem;
  padding-bottom: 1rem;
}

.oscar-card {
  min-width: 220px;
  cursor: pointer;
  transition: transform 0.3s ease;
  position: relative;
}

.oscar-card:hover {
  transform: scale(1.05);
  z-index: 10;
}

.card-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--oscar-gradient);
  color: var(--oscar-black);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  z-index: 10;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
}

.card-image {
  position: relative;
  aspect-ratio: 2/3;
  border-radius: 12px;
  overflow: hidden;
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.no-poster {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: var(--oscar-card-bg);
}

.oscar-card:hover .card-image img {
  transform: scale(1.1);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 10, 10, 0.95) 0%,
    rgba(10, 10, 10, 0.7) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1rem;
}

.oscar-card:hover .card-overlay {
  opacity: 1;
}

.oscar-icon {
  margin-top: 2rem;
  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.6));
}

.card-info {
  width: 100%;
}

.card-info h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.3;
  text-align: center;
}

.meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  font-family: 'Montserrat', sans-serif;
}

.meta .rating {
  color: var(--oscar-gold);
}

.meta .year {
  color: var(--oscar-text-secondary);
}

.oscar-year,
.actor-name {
  text-align: center;
  font-size: 0.75rem;
  color: var(--oscar-gold);
  margin-top: 0.5rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-content {
    padding: 0 2rem;
  }

  .hero-nav-btn {
    width: 40px;
    height: 40px;
  }

  .hero-nav-prev {
    left: 1rem;
  }

  .hero-nav-next {
    right: 1rem;
  }

  .hero-indicators {
    bottom: 2rem;
  }

  .indicator {
    width: 30px;
    height: 3px;
  }

  .indicator.active {
    width: 45px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1.5rem 1rem;
  }

  .carousel-title {
    font-size: 1.3rem;
  }

  .oscar-card {
    min-width: 160px;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>