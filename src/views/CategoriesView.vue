<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'

const imageBase = 'https://image.tmdb.org/t/p/w500'

const oscarCategories = [
  {
    id: 'best-picture',
    name: 'Melhor Filme',
    icon: '🎬',
    description: 'Os grandes vencedores da noite',
    color: '#FFD700',
    genreFilter: null
  },
  {
    id: 'best-actor',
    name: 'Melhor Ator',
    icon: '🎭',
    description: 'Performances masculinas memoráveis',
    color: '#B8941F',
    genreFilter: null
  },
  {
    id: 'best-actress',
    name: 'Melhor Atriz',
    icon: '👑',
    description: 'Atuações femininas inesquecíveis',
    color: '#D4AF37',
    genreFilter: null
  },
  {
    id: 'best-director',
    name: 'Melhor Diretor',
    icon: '🎥',
    description: 'Mestres da sétima arte',
    color: '#C5A028',
    genreFilter: null
  },
  {
    id: 'animation',
    name: 'Melhor Animação',
    icon: '🎨',
    description: 'Magia da animação premiada',
    color: '#FFD700',
    genreFilter: 16
  },
  {
    id: 'documentary',
    name: 'Melhor Documentário',
    icon: '📚',
    description: 'Histórias reais que impactam',
    color: '#B8941F',
    genreFilter: 99
  },
  {
    id: 'foreign',
    name: 'Melhor Filme Internacional',
    icon: '🌍',
    description: 'Cinema mundial premiado',
    color: '#D4AF37',
    genreFilter: null
  },
  {
    id: 'screenplay',
    name: 'Melhor Roteiro',
    icon: '📝',
    description: 'Histórias brilhantemente escritas',
    color: '#C5A028',
    genreFilter: null
  }
]

const selectedCategory = ref(oscarCategories[0])
const categoryMovies = ref([])
const loading = ref(false)

const loadCategoryMovies = async () => {
  loading.value = true
  try {
    let url = 'discover/movie?language=pt-BR&sort_by=vote_average.desc&vote_count.gte=2000'
    
    if (selectedCategory.value.genreFilter) {
      url += `&with_genres=${selectedCategory.value.genreFilter}`
    }
    
    const res = await api.get(url)
    categoryMovies.value = res.data.results.slice(0, 12)
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    loading.value = false
  }
}

const selectCategory = (category) => {
  selectedCategory.value = category
  loadCategoryMovies()
}

onMounted(() => {
  loadCategoryMovies()
})
</script>

<template>
  <div class="categories-page">
    <!-- Hero -->
    <section class="page-hero">
      <div class="hero-content">
        <div class="hero-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="url(#gold-stroke)" stroke-width="2">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
            <defs>
              <linearGradient id="gold-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFD700"/>
                <stop offset="100%" style="stop-color:#B8941F"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1>Categorias do Oscar</h1>
        <p>Explore os vencedores em cada categoria da premiação</p>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="categories-selector">
      <div class="container">
        <div class="categories-grid">
          <button
            v-for="category in oscarCategories"
            :key="category.id"
            @click="selectCategory(category)"
            :class="['category-card', { active: selectedCategory.id === category.id }]"
            :style="{ '--category-color': category.color }"
          >
            <div class="category-icon">{{ category.icon }}</div>
            <h3>{{ category.name }}</h3>
            <p>{{ category.description }}</p>
            <div class="category-shine" v-if="selectedCategory.id === category.id"></div>
          </button>
        </div>
      </div>
    </section>

    <!-- Category Header -->
    <section class="category-header">
      <div class="container">
        <div class="header-content">
          <div class="header-left">
            <span class="category-badge">
              {{ selectedCategory.icon }}
              {{ selectedCategory.name }}
            </span>
            <h2>Vencedores e Indicados</h2>
            <p>{{ selectedCategory.description }}</p>
          </div>
          <div class="header-stats">
            <div class="stat">
              <span class="stat-number">{{ categoryMovies.length }}</span>
              <span class="stat-label">Filmes</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando vencedores...</p>
    </div>

    <!-- Movies Grid -->
    <section v-else class="movies-section">
      <div class="container">
        <div class="movies-grid">
          <article
            v-for="(movie, index) in categoryMovies"
            :key="movie.id"
            class="movie-card"
          >
            <div class="award-number" v-if="index < 3">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L9 8H15L12 2Z" fill="url(#gold)"/>
                <circle cx="12" cy="10" r="2" fill="url(#gold)"/>
                <path d="M12 12L10 18H14L12 12Z" fill="url(#gold)"/>
                <defs>
                  <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#FFD700"/>
                    <stop offset="100%" style="stop-color:#B8941F"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div class="movie-poster">
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
                <button class="play-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="movie-info">
              <h3>{{ movie.title }}</h3>
              
              <div class="movie-meta">
                <span class="rating">
                  ⭐ {{ movie.vote_average.toFixed(1) }}
                </span>
                <span class="year">
                  {{ new Date(movie.release_date).getFullYear() }}
                </span>
              </div>

              <p class="movie-description">
                {{ movie.overview?.substring(0, 100) }}...
              </p>

              <div class="award-info">
                <span class="award-badge">🏆 Vencedor</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.categories-page {
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

/* Categories Selector */
.categories-selector {
  padding: 3rem 0;
  background: rgba(212, 175, 55, 0.02);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: var(--oscar-card-bg);
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-align: center;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
  transition: left 0.5s ease;
}

.category-card:hover::before {
  left: 100%;
}

.category-card:hover {
  border-color: var(--category-color);
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(212, 175, 55, 0.25);
}

.category-card.active {
  border-color: var(--oscar-gold);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.3);
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.category-card h3 {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: #fff;
}

.category-card p {
  font-size: 0.9rem;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
}

.category-shine {
  position: absolute;
  inset: 0;
  background: var(--oscar-shine);
  animation: shine 2s infinite;
  pointer-events: none;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Category Header */
.category-header {
  padding: 3rem 0;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.05) 0%, transparent 100%);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left {
  flex: 1;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid var(--oscar-gold);
  color: var(--oscar-gold);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  font-family: 'Montserrat', sans-serif;
}

.header-left h2 {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 0.75rem;
  color: #fff;
}

.header-left p {
  font-size: 1.1rem;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  text-align: center;
  padding: 1.5rem 2rem;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--oscar-gold);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
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

/* Movies Section */
.movies-section {
  padding: 4rem 0 6rem;
}

.movies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.movie-card {
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.movie-card:hover {
  transform: translateY(-10px);
  border-color: var(--oscar-gold);
  box-shadow: 0 15px 50px rgba(212, 175, 55, 0.25);
}

.award-number {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
  filter: drop-shadow(0 4px 15px rgba(255, 215, 0, 0.6));
}

.movie-poster {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
}

.movie-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster img {
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
  background: linear-gradient(to top, rgba(10, 10, 10, 0.9) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.movie-card:hover .poster-overlay {
  opacity: 1;
}

.play-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--oscar-gradient);
  border: none;
  color: var(--oscar-black);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn:hover {
  transform: scale(1.15);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.5);
}

.movie-info {
  padding: 1.5rem;
}

.movie-info h3 {
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
  color: var(--oscar-gold);
  font-weight: 700;
}

.year {
  color: var(--oscar-text-secondary);
}

.movie-description {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--oscar-text-secondary);
  margin-bottom: 1rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
}

.award-info {
  display: flex;
  gap: 0.5rem;
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

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .header-left h2 {
    font-size: 2rem;
  }

  .movies-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
}
</style>