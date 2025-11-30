<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOscar } from '@/composables/useOscar'

const router = useRouter()

// Adicione esses métodos
const goToMovie = (movieId) => {
  router.push({ name: 'movie', params: { id: movieId } })
}

const goToPerson = (personId) => {
  router.push({ name: 'person', params: { id: personId } })
}


const imageBase = 'https://image.tmdb.org/t/p/w500'

const { fetchYearWinners, oscarWinners } = useOscar()

const movieWinners = ref([])
const personWinners = ref([])
const technicalWinners = ref([])
const selectedYear = ref(2024)
const loading = ref(false)
const ceremony = ref(null)

const years = ref(Object.keys(oscarWinners).map(Number).sort((a, b) => b - a))

// Combinar filmes e prêmios técnicos
const allMovieWinners = computed(() => {
  return [...movieWinners.value, ...technicalWinners.value]
})

const loadWinners = async () => {
  loading.value = true
  movieWinners.value = []
  personWinners.value = []
  technicalWinners.value = []

  try {
    const yearData = await fetchYearWinners(selectedYear.value)

    if (yearData) {
      movieWinners.value = yearData.movieWinners || []
      personWinners.value = yearData.personWinners || []
      technicalWinners.value = yearData.technicalWinners || []
      ceremony.value = yearData.ceremony
    }
  } catch (error) {
    console.error('Erro ao carregar vencedores:', error)
  } finally {
    loading.value = false
  }
}

const changeYear = (year) => {
  selectedYear.value = year
}

watch(selectedYear, () => {
  loadWinners()
})

onMounted(() => {
  loadWinners()
})
</script>

<template>
  <div class="winners-page">
    <!-- Hero -->
    <section class="page-hero">
      <div class="hero-content">
        <div class="hero-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="7" stroke="url(#gold-stroke)" stroke-width="2"/>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" stroke="url(#gold-stroke)" stroke-width="2"/>
            <defs>
              <linearGradient id="gold-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFD700"/>
                <stop offset="100%" style="stop-color:#B8941F"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1>Vencedores do Oscar</h1>
        <p>Explore os filmes e artistas que marcaram a história do cinema</p>
      </div>
    </section>

    <!-- Filtro de Anos -->
    <section class="filters-section">
      <div class="container">
        <div class="filter-group">
          <h3 class="filter-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Ano da Cerimônia
          </h3>
          <div class="years-scroll">
            <button
              v-for="year in years"
              :key="year"
              @click="changeYear(year)"
              :class="['year-btn', { active: selectedYear === year }]"
            >
              {{ year }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando vencedores de {{ selectedYear }}...</p>
    </div>

    <!-- Conteúdo -->
    <div v-else class="winners-content">
      
      <!-- Header do Ano -->
      <div class="container">
        <div class="year-header">
          <h2>Oscar {{ selectedYear }}</h2>
          <p class="ceremony-info" v-if="ceremony">{{ ceremony }}ª Cerimônia do Oscar</p>
        </div>
      </div>

      <!-- SEÇÃO: FILMES PREMIADOS (inclui técnicos) -->
      <section class="winners-section" v-if="allMovieWinners.length > 0">
        <div class="container">
          <div class="section-title">
            <h3>Filmes Premiados</h3>
            <span class="count">{{ allMovieWinners.length }}</span>
          </div>

          <div class="movies-grid">
            <article
              v-for="item in allMovieWinners"
              :key="`movie-${item.movieDetails.id}-${item.category}`"
              class="movie-card"
            >
              <div class="featured-badge" v-if="item.category === 'bestPicture'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Melhor Filme
              </div>

              <div class="card-poster">
                <img
                  v-if="item.movieDetails.poster_path"
                  :src="imageBase + item.movieDetails.poster_path"
                  :alt="item.movieDetails.title"
                  loading="lazy"
                />
                <div v-else class="no-poster">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>

                <div class="poster-overlay">
                  <button class="view-details-btn" @click="goToMovie(item.movieDetails.id)">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Ver Detalhes
                  </button>
                </div>
              </div>

              <div class="card-content">
                <div class="category-badge">{{ item.categoryName }}</div>
                <h4 class="movie-title">{{ item.movieDetails.title }}</h4>
                
                <!-- Nome do profissional (para prêmios técnicos) -->
                <p class="professional-name" v-if="item.professionalName">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {{ item.professionalName }}
                </p>

                <div class="movie-meta">
                  <span class="rating" v-if="item.movieDetails.vote_average">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {{ item.movieDetails.vote_average?.toFixed(1) }}
                  </span>
                  <span class="year" v-if="item.movieDetails.release_date">
                    {{ new Date(item.movieDetails.release_date).getFullYear() }}
                  </span>
                </div>

                <p class="movie-overview" v-if="item.movieDetails.overview">
                  {{ item.movieDetails.overview.substring(0, 100) }}...
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: PESSOAS VENCEDORAS -->
      <section class="winners-section persons-section" v-if="personWinners.length > 0">
        <div class="container">
          <div class="section-title">
            <h3>Artistas Premiados</h3>
            <span class="count">{{ personWinners.length }}</span>
          </div>

          <div class="persons-grid">
            <article
              v-for="item in personWinners"
              :key="`person-${item.category}-${item.winner.tmdbId}`"
              class="person-card"
            >
              <div class="person-photo">
                <img
                  v-if="item.personDetails?.profile_path"
                  :src="imageBase + item.personDetails.profile_path"
                  :alt="item.winner.name"
                  loading="lazy"
                />
                <div v-else class="no-photo">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>

              <div class="person-content" @click="goToPerson(item.personDetails.id)"> 
                <div class="category-badge person-category">{{ item.categoryName }}</div>
                <h4 class="person-name">{{ item.winner.name }}</h4>
                
                <p class="movie-reference">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                    <line x1="7" y1="2" x2="7" y2="22"/>
                    <line x1="17" y1="2" x2="17" y2="22"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                  </svg>
                  {{ item.movieTitle }}
                </p>

                <div class="person-info" v-if="item.personDetails">
                  <span v-if="item.personDetails.birthday" class="info-item">
                    <img src="/imgs/calendar.png" class="icon" alt=""> {{ new Date(item.personDetails.birthday).toLocaleDateString('pt-BR') }}
                  </span>
                  <span v-if="item.personDetails.place_of_birth" class="info-item">
                    <img src="/imgs/maps-and-flags.png" class="icon" alt=""> {{ item.personDetails.place_of_birth.split(',')[0] }}
                  </span>
                </div>

                <div class="oscar-badge">Oscar {{ selectedYear }}</div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- Sem vencedores -->
      <div v-if="allMovieWinners.length === 0 && personWinners.length === 0" class="no-winners">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="7"/>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
        </svg>
        <h3>Nenhum vencedor encontrado</h3>
        <p>Não temos dados completos para {{ selectedYear }} ainda.</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.winners-page {
  min-height: 100vh;
  background: var(--oscar-dark-bg);
  color: var(--oscar-text);
}

/* Page Hero */
.page-hero {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
  padding: 6rem 3rem 4rem;
  text-align: center;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  margin-bottom: 2rem;
  display: inline-block;
  filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.4));
}

.icon {
  max-width: 14px;
}

.page-hero h1 {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  background: var(--oscar-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-hero p {
  font-size: 1.2rem;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
}

/* Container */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

/* Filters */
.filters-section {
  padding: 3rem 0;
  background: rgba(212, 175, 55, 0.03);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.filter-group {
  margin-bottom: 0;
}

.filter-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--oscar-gold);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.05em;
}

.years-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-top: 1rem;
  padding-bottom: 1rem;
  scrollbar-width: thin;
  scrollbar-color: var(--oscar-gold) transparent;
}

.years-scroll::-webkit-scrollbar {
  height: 6px;
}

.years-scroll::-webkit-scrollbar-track {
  background: rgba(212, 175, 55, 0.1);
  border-radius: 10px;
}

.years-scroll::-webkit-scrollbar-thumb {
  background: var(--oscar-gradient);
  border-radius: 10px;
}

.year-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.2);
  color: var(--oscar-text-secondary);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: 'Montserrat', sans-serif;
}

.year-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--oscar-gold);
  color: var(--oscar-gold);
  transform: translateY(-2px);
}

.year-btn.active {
  background: var(--oscar-gradient);
  border-color: transparent;
  color: var(--oscar-black);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
}

/* Loading */
.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(212, 175, 55, 0.2);
  border-top-color: var(--oscar-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Year Header */
.year-header {
  text-align: center;
  padding: 3rem 0 2rem;
}

.year-header h2 {
  font-size: 2.5rem;
  font-weight: 900;
  background: var(--oscar-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.ceremony-info {
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
}

/* Winners Section */
.winners-section {
  padding: 2rem 0 4rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.title-icon {
  font-size: 2rem;
}

.section-title h3 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  flex: 1;
}

.section-title .count {
  color: var(--oscar-text-secondary);
  font-size: 0.9rem;
  font-family: 'Montserrat', sans-serif;
}

/* Movies Grid */
.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.movie-card {
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.movie-card:hover {
  transform: translateY(-10px);
  border-color: var(--oscar-gold);
  box-shadow: 0 10px 40px rgba(212, 175, 55, 0.2);
}

.featured-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: var(--oscar-gradient);
  color: var(--oscar-black);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 900;
  font-size: 0.8rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
}

.card-poster {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.card-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .card-poster img {
  transform: scale(1.1);
}

.no-poster {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(212, 175, 55, 0.3);
}

.poster-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 10, 10, 0.95) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.movie-card:hover .poster-overlay {
  opacity: 1;
}

.view-details-btn {
  background: var(--oscar-gradient);
  color: var(--oscar-black);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.view-details-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.5);
}

.card-content {
  padding: 1.5rem;
}

.category-badge {
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: var(--oscar-gold);
  padding: 0.4rem 0.9rem;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.05em;
  display: inline-block;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.movie-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  color: #fff;
}

/* Professional Name (para prêmios técnicos) */
.professional-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--oscar-gold);
  font-size: 0.9rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.professional-name svg {
  flex-shrink: 0;
  opacity: 0.7;
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-family: 'Montserrat', sans-serif;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--oscar-gold);
  font-weight: 700;
}

.rating svg {
  fill: var(--oscar-gold);
}

.year {
  color: var(--oscar-text-secondary);
}

.movie-overview {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
}

/* Persons Section */
.persons-section {
  background: rgba(212, 175, 55, 0.02);
  padding-top: 3rem;
}

.persons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.person-card {
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: row;
}

.person-card:hover {
  transform: translateY(-5px);
  border-color: var(--oscar-gold);
  box-shadow: 0 10px 40px rgba(212, 175, 55, 0.2);
}

.person-photo {
  width: 140px;
  min-height: 200px;
  flex-shrink: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.person-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.person-card:hover .person-photo img {
  transform: scale(1.1);
}

.no-photo {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(212, 175, 55, 0.3);
}

.person-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.person-category {
  align-self: flex-start;
}

.person-name {
  font-size: 1.3rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.movie-reference {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--oscar-text-secondary);
  font-size: 0.9rem;
  font-family: 'Montserrat', sans-serif;
  margin-bottom: 1rem;
}

.movie-reference svg {
  color: var(--oscar-gold);
  flex-shrink: 0;
}

.person-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.info-item {
  font-size: 0.8rem;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
}

.oscar-badge {
  margin-top: auto;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: var(--oscar-gold);
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  display: inline-flex;
  align-self: flex-start;
}

/* No Winners */
.no-winners {
  text-align: center;
  padding: 5rem 2rem;
  color: var(--oscar-text-secondary);
}

.no-winners svg {
  opacity: 0.3;
  margin-bottom: 2rem;
}

.no-winners h3 {
  font-size: 1.8rem;
  color: #fff;
  margin-bottom: 1rem;
}

.no-winners p {
  font-size: 1.1rem;
  font-family: 'Montserrat', sans-serif;
}

/* Responsive */
@media (max-width: 768px) {
  .page-hero {
    padding: 5rem 2rem 3rem;
  }

  .page-hero h1 {
    font-size: 2.5rem;
  }

  .container {
    padding: 0 1.5rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .persons-grid {
    grid-template-columns: 1fr;
  }

  .person-card {
    flex-direction: column;
  }

  .person-photo {
    width: 100%;
    height: 250px;
  }
}
</style>