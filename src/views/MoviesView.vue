<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'
import { useGenreStore } from '@/stores/genre'

const genreStore = useGenreStore()
const selectedGenre = ref(null)
const items = ref([])
const page = ref(1)
const loading = ref(false)
const searchQuery = ref('')
const imageBase = 'https://image.tmdb.org/t/p/w500'

const loadMovies = async () => {
  loading.value = true
  try {
    let url = `movie/popular?language=pt-BR&page=${page.value}`
    
    if (searchQuery.value) {
      url = `search/movie?query=${searchQuery.value}&language=pt-BR&page=${page.value}`
    } else if (selectedGenre.value) {
      url = `discover/movie?with_genres=${selectedGenre.value}&language=pt-BR&page=${page.value}`
    }
    
    const res = await api.get(url)
    items.value = res.data.results
  } catch (error) {
    console.error('Erro ao carregar filmes:', error)
  } finally {
    loading.value = false
  }
}

const selectGenre = (genreId) => {
  selectedGenre.value = selectedGenre.value === genreId ? null : genreId
  page.value = 1
  searchQuery.value = ''
  loadMovies()
}

const handleSearch = () => {
  selectedGenre.value = null
  page.value = 1
  loadMovies()
}

const nextPage = () => {
  page.value++
  loadMovies()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    loadMovies()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const getYear = (date) => {
  return date ? new Date(date).getFullYear() : 'N/A'
}

const getRating = (vote) => {
  return vote ? vote.toFixed(1) : 'N/A'
}

onMounted(async () => {
  await genreStore.getAllGenres('movie')
  loadMovies()
})
</script>

<template>
  <div class="movies-page">
    <!-- Hero Banner -->
    <section class="hero">
      <div class="hero-content">
        <h1>🎬 Filmes</h1>
        <p>Descubra os melhores filmes do cinema</p>
        
        <div class="search-bar">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            v-model="searchQuery" 
            @keyup.enter="handleSearch"
            type="text" 
            placeholder="Buscar filmes..."
          />
          <button @click="handleSearch" class="search-btn">Buscar</button>
        </div>
      </div>
    </section>

    <!-- Gêneros -->
    <section class="genres-section">
      <div class="container">
        <h2 class="section-title">Gêneros</h2>
        <div class="genres-list">
          <button
            v-for="genre in genreStore.genres"
            :key="genre.id"
            :class="['genre-tag', { selected: selectedGenre === genre.id }]"
            @click="selectGenre(genre.id)"
          >
            {{ genre.name }}
          </button>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando filmes...</p>
    </div>

    <!-- Grid de Resultados -->
    <section v-else class="results-section">
      <div class="container">
        <div class="results-header">
          <h2>{{ selectedGenre ? genreStore.genres.find(g => g.id === selectedGenre)?.name : 'Filmes Populares' }}</h2>
          <span class="results-count">{{ items.length }} resultados</span>
        </div>

        <div v-if="items.length === 0" class="no-results">
          <p>Nenhum filme encontrado 😕</p>
        </div>

        <div v-else class="results-grid">
          <article 
            v-for="item in items" 
            :key="item.id" 
            class="card"
          >
            <div class="card-image">
              <img 
                v-if="item.poster_path"
                :src="imageBase + item.poster_path" 
                :alt="item.title"
                loading="lazy"
              />
              <div v-else class="no-image">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div class="card-overlay">
                <button class="play-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                <div class="card-info">
                  <h3>{{ item.title }}</h3>
                  <div class="meta">
                    <span class="year">{{ getYear(item.release_date) }}</span>
                    <span class="rating">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      {{ getRating(item.vote_average) }}
                    </span>
                  </div>
                  <p class="overview" v-if="item.overview">{{ item.overview.substring(0, 100) }}...</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Paginação -->
    <footer class="pagination">
      <div class="container">
        <button 
          @click="prevPage" 
          :disabled="page === 1"
          class="pagination-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Anterior
        </button>
        
        <div class="page-indicator">
          <span class="current-page">{{ page }}</span>
        </div>
        
        <button 
          @click="nextPage" 
          class="pagination-btn"
        >
          Próxima
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.movies-page {
  min-height: 100vh;
  background: #0b0c0f;
  color: #fff;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #0f8cff 0%, #7928ca 100%);
  padding: 4rem 2rem 3rem;
  text-align: center;
}

.hero-content h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.hero-content p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.search-bar {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 0.5rem 0.5rem 0.5rem 1.5rem;
  backdrop-filter: blur(10px);
}

.search-icon {
  color: rgba(255, 255, 255, 0.8);
  margin-right: 1rem;
}

.search-bar input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1rem;
  outline: none;
}

.search-bar input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #0f8cff;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: #fff;
  transform: scale(1.05);
}

/* Container */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Genres Section */
.genres-section {
  padding: 2rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #fff;
}

.genres-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.genre-tag {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #b8b8b8;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.genre-tag:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateY(-2px);
}

.genre-tag.selected {
  background: linear-gradient(90deg, #0f8cff 0%, #7928ca 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 15px rgba(15, 140, 255, 0.3);
}

/* Loading */
.loading {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #0f8cff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Results Section */
.results-section {
  padding: 2rem 0 4rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.results-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
}

.results-count {
  color: #666;
  font-size: 0.9rem;
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.2rem;
  color: #666;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

/* Card */
.card {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-8px);
  z-index: 10;
}

.card-image {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #1a1a1a;
  aspect-ratio: 2/3;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  color: #444;
}

.card:hover .card-image img {
  transform: scale(1.1);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
}

.card:hover .card-overlay {
  opacity: 1;
}

.play-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: center;
  margin-top: 2rem;
}

.play-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.card-info {
  color: #fff;
}

.card-info h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.year {
  color: #b8b8b8;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #ffd700;
}

.overview {
  font-size: 0.85rem;
  line-height: 1.4;
  color: #ccc;
}

/* Pagination */
.pagination {
  padding: 3rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.pagination .container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(15, 140, 255, 0.5);
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-indicator {
  display: flex;
  align-items: center;
}

.current-page {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(90deg, #0f8cff 0%, #7928ca 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }

  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}
</style>