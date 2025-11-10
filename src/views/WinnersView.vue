<script setup>
import { ref, onMounted } from 'vue'
import { useOscar } from '@/composables/useOscar'

const imageBase = 'https://image.tmdb.org/t/p/w500'

const { fetchYearWinners, oscarWinners } = useOscar()

const winners = ref([])
const selectedYear = ref(2024)
const loading = ref(false)
const selectedCategory = ref('all')

// Gerar anos disponíveis (somente anos com dados)
const years = ref(Object.keys(oscarWinners).map(Number).sort((a, b) => b - a))

const categories = [
  { id: 'all', name: 'Todas as Categorias', icon: '🏆' },
  { id: 'bestPicture', name: 'Melhor Filme', icon: '🎬' },
  { id: 'bestActor', name: 'Melhor Ator', icon: '🎭' },
  { id: 'bestActress', name: 'Melhor Atriz', icon: '👑' },
  { id: 'bestDirector', name: 'Melhor Diretor', icon: '🎥' },
  { id: 'bestAnimatedFeature', name: 'Melhor Animação', icon: '🎨' },
  { id: 'bestInternationalFilm', name: 'Filme Internacional', icon: '🌍' }
]

const loadWinners = async () => {
  loading.value = true
  try {
    const yearData = await fetchYearWinners(selectedYear.value)
    
    if (yearData && yearData.categories) {
      // Extrair filmes vencedores do ano
      const moviesArray = []
      
      Object.entries(yearData.categories).forEach(([categoryKey, categoryData]) => {
        // Filtrar por categoria se não for "all"
        if (selectedCategory.value === 'all' || selectedCategory.value === categoryKey) {
          if (categoryData.movieDetails) {
            moviesArray.push({
              ...categoryData.movieDetails,
              oscarCategory: getCategoryName(categoryKey),
              oscarCategoryKey: categoryKey,
              oscarData: categoryData.winner,
              oscarYear: yearData.year,
              ceremony: yearData.ceremony
            })
          }
        }
      })
      
      winners.value = moviesArray
    } else {
      winners.value = []
    }
  } catch (error) {
    console.error('Erro ao carregar vencedores:', error)
    winners.value = []
  } finally {
    loading.value = false
  }
}

const getCategoryName = (key) => {
  const categoryMap = {
    bestPicture: 'Melhor Filme',
    bestActor: 'Melhor Ator',
    bestActress: 'Melhor Atriz',
    bestDirector: 'Melhor Diretor',
    bestSupportingActor: 'Melhor Ator Coadjuvante',
    bestSupportingActress: 'Melhor Atriz Coadjuvante',
    bestAnimatedFeature: 'Melhor Animação',
    bestInternationalFilm: 'Melhor Filme Internacional',
    bestDocumentary: 'Melhor Documentário',
    bestOriginalScreenplay: 'Melhor Roteiro Original',
    bestAdaptedScreenplay: 'Melhor Roteiro Adaptado'
  }
  return categoryMap[key] || 'Vencedor'
}

const changeYear = (year) => {
  selectedYear.value = year
  loadWinners()
}

const changeCategory = (categoryId) => {
  selectedCategory.value = categoryId
  loadWinners()
}

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
        <p>Explore os filmes que marcaram a história do cinema</p>
      </div>
    </section>

    <!-- Filtros -->
    <section class="filters-section">
      <div class="container">
        <!-- Filtro de Anos -->
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

        <!-- Filtro de Categorias -->
        <div class="filter-group">
          <h3 class="filter-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
            </svg>
            Filtrar por Categoria
          </h3>
          <div class="categories-scroll">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="changeCategory(category.id)"
              :class="['category-btn', { active: selectedCategory === category.id }]"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span>{{ category.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando vencedores...</p>
    </div>

    <!-- Grid de Vencedores -->
    <section v-else class="winners-grid-section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2>Vencedores de {{ selectedYear }}</h2>
            <p class="ceremony-info" v-if="winners.length > 0">
              {{ winners[0].ceremony }}ª Cerimônia do Oscar
            </p>
          </div>
          <span class="count">{{ winners.length }} {{ winners.length === 1 ? 'vencedor' : 'vencedores' }}</span>
        </div>

        <!-- Mensagem se não houver vencedores -->
        <div v-if="winners.length === 0" class="no-winners">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="7"/>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
          </svg>
          <h3>Nenhum vencedor encontrado</h3>
          <p>Não temos dados para {{ selectedYear }} nesta categoria ainda.</p>
        </div>

        <div v-else class="winners-grid">
          <article
            v-for="(movie, index) in winners"
            :key="movie.id + '-' + movie.oscarCategoryKey"
            class="winner-card"
          >
            <!-- Badge de ranking apenas para os 3 primeiros -->
            <div class="winner-rank" v-if="index < 3">
              <span class="rank-number">#{{ index + 1 }}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>

            <div class="card-poster">
              <img
                v-if="movie.poster_path"
                :src="imageBase + movie.poster_path"
                :alt="movie.title"
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
                <button class="view-details-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Ver Detalhes
                </button>
              </div>
            </div>

            <div class="card-content">
              <div class="category-badge">{{ movie.oscarCategory }}</div>
              
              <h3 class="movie-title">{{ movie.title }}</h3>
              
              <div class="movie-meta">
                <span class="rating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {{ movie.vote_average?.toFixed(1) || 'N/A' }}
                </span>
                <span class="year">{{ new Date(movie.release_date).getFullYear() }}</span>
              </div>

              <p class="movie-overview">{{ movie.overview?.substring(0, 120) || 'Vencedor do Oscar' }}...</p>

              <div class="awards-info">
                <span class="award-badge">
                  🏆 Oscar {{ movie.oscarYear }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
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

/* Filters Section */
.filters-section {
  padding: 3rem 0;
  background: rgba(212, 175, 55, 0.03);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.filter-group {
  margin-bottom: 2.5rem;
}

.filter-group:last-child {
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

.years-scroll,
.categories-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scrollbar-width: thin;
  scrollbar-color: var(--oscar-gold) transparent;
}

.years-scroll::-webkit-scrollbar,
.categories-scroll::-webkit-scrollbar {
  height: 6px;
}

.years-scroll::-webkit-scrollbar-track,
.categories-scroll::-webkit-scrollbar-track {
  background: rgba(212, 175, 55, 0.1);
  border-radius: 10px;
}

.years-scroll::-webkit-scrollbar-thumb,
.categories-scroll::-webkit-scrollbar-thumb {
  background: var(--oscar-gradient);
  border-radius: 10px;
}

.year-btn,
.category-btn {
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

.category-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-icon {
  font-size: 1.2rem;
}

.year-btn:hover,
.category-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--oscar-gold);
  color: var(--oscar-gold);
  transform: translateY(-2px);
}

.year-btn.active,
.category-btn.active {
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

/* Winners Grid Section */
.winners-grid-section {
  padding: 4rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.5rem;
}

.ceremony-info {
  font-size: 0.9rem;
  color: var(--oscar-gold);
  font-family: 'Montserrat', sans-serif;
  margin: 0;
}

.count {
  color: var(--oscar-text-secondary);
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
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

.winners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.winner-card {
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.winner-card:hover {
  transform: translateY(-10px);
  border-color: var(--oscar-gold);
  box-shadow: 0 10px 40px rgba(212, 175, 55, 0.2);
}

.winner-rank {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: var(--oscar-gradient);
  color: var(--oscar-black);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 900;
  font-size: 0.9rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
}

.rank-number {
  font-size: 1.1rem;
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

.winner-card:hover .card-poster img {
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
  background: linear-gradient(
    to top,
    rgba(10, 10, 10, 0.95) 0%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.winner-card:hover .poster-overlay {
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
  margin-bottom: 0.75rem;
  line-height: 1.3;
  color: #fff;
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
  margin-bottom: 1rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
}

.awards-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.award-badge {
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: var(--oscar-gold);
  padding: 0.4rem 0.9rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: 0.05em;
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

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .winners-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
}
</style>