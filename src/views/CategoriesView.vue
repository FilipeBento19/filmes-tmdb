<script setup>
import { ref, onMounted } from 'vue'
import { useOscar } from '@/composables/useOscar'

import { useRouter } from 'vue-router'

const router = useRouter()

// Adicione esses métodos
const goToMovie = (movieId) => {
  router.push({ name: 'movie', params: { id: movieId } })
}

const goToPerson = (personId) => {
  router.push({ name: 'person', params: { id: personId } })
}

const imageBase = 'https://image.tmdb.org/t/p/w500'

const { 
  oscarWinners, 
  fetchMovieDetails, 
  fetchPersonDetails, 
} = useOscar()

// Mapeamento das categorias da UI para as chaves do oscarWinners
const oscarCategories = [
  {
    id: 'bestPicture',
    name: 'Melhor Filme',
    icon: '/imgs/clapperboard.png',
    description: 'Os grandes vencedores da noite',
    color: '#FFD700',
    type: 'movie'
  },
  {
    id: 'bestDirector',
    name: 'Melhor Diretor',
    icon: '/imgs/theater.png',
    description: 'Mestres da sétima arte',
    color: '#C5A028',
    type: 'person'
  },
  {
    id: 'bestActor',
    name: 'Melhor Ator',
    icon: '/imgs/star.png',
    description: 'Performances masculinas memoráveis',
    color: '#B8941F',
    type: 'person'
  },
  {
    id: 'bestActress',
    name: 'Melhor Atriz',
    icon: '/imgs/crown.png',
    description: 'Atuações femininas inesquecíveis',
    color: '#D4AF37',
    type: 'person'
  },
  {
    id: 'bestAnimatedFeature',
    name: 'Melhor Animação',
    icon: '/imgs/paint-palette.png',
    description: 'Magia da animação premiada',
    color: '#FFD700',
    type: 'movie'
  },
  {
    id: 'bestCinematography',
    name: 'Melhor Cinematografia',
    icon: '/imgs/video-camera.png', // Você adiciona o ícone aqui
    description: 'Excelência em fotografia cinematográfica',
    color: '#C5A028',
    type: 'technical'
  },
  {
    id: 'bestOriginalScore',
    name: 'Melhor Trilha Sonora',
    icon: '/imgs/next.png', // Você adiciona o ícone aqui
    description: 'Composições musicais memoráveis',
    color: '#B8941F',
    type: 'technical'
  }
]

const selectedCategory = ref(oscarCategories[0])
const categoryWinners = ref([])
const loading = ref(false)

// Load winners of a specific category over the years
const loadCategoryWinners = async () => {
  loading.value = true
  categoryWinners.value = []

  try {
    const categoryKey = selectedCategory.value.id
    const categoryType = selectedCategory.value.type
    const winners = []

    // Iterate all years of oscarWinners
    const years = Object.keys(oscarWinners).map(Number).sort((a, b) => b - a)

    for (const year of years) {
      const yearData = oscarWinners[year]
      const categoryData = yearData.categories[categoryKey]

      if (!categoryData?.winner) continue

      const winner = categoryData.winner

      // Skip if no valid tmdbId
      if (!winner.tmdbId || winner.tmdbId === 0) continue

      if (categoryType === 'person') {
        // Fetch person details
        const personDetails = await fetchPersonDetails(winner.tmdbId)
        
        if (personDetails) {
          winners.push({
            id: `${year}-${categoryKey}-${winner.tmdbId}`,
            year: year,
            ceremony: yearData.ceremony,
            winner: winner,
            personDetails: personDetails,
            movieTitle: winner.title,
            type: 'person'
          })
        }
      } else if (categoryType === 'technical') {
        // Technical category: fetch movie and include professional name
        const movieDetails = await fetchMovieDetails(winner.tmdbId)
        
        if (movieDetails) {
          winners.push({
            id: `${year}-${categoryKey}-${winner.tmdbId}`,
            year: year,
            ceremony: yearData.ceremony,
            winner: winner,
            movieDetails: movieDetails,
            professionalName: winner.cinematographer || winner.composer || null,
            type: 'technical'
          })
        }
      } else {
        // Normal movie category
        const movieDetails = await fetchMovieDetails(winner.tmdbId)
        
        if (movieDetails) {
          winners.push({
            id: `${year}-${categoryKey}-${winner.tmdbId}`,
            year: year,
            ceremony: yearData.ceremony,
            winner: winner,
            movieDetails: movieDetails,
            type: 'movie'
          })
        }
      }

      // Limit to 25 results to avoid overload
      if (winners.length >= 25) break
    }

    categoryWinners.value = winners
  } catch (error) {
    console.error('Error loading category winners:', error)
  } finally {
    loading.value = false
  }
}

const selectCategory = (category) => {
  selectedCategory.value = category
  loadCategoryWinners()
}

// Category statistics (removed unused variable)
// const categoryStats = computed(() => {
//   const categoryKey = selectedCategory.value.id
//   let total = 0

//   Object.values(oscarWinners).forEach(yearData => {
//     if (yearData.categories[categoryKey]?.winner?.tmdbId) {
//       total++
//     }
//   })

//   return { total }
// })

onMounted(() => {
  loadCategoryWinners()
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
        <h1>Oscar Categories</h1>
        <p>Explore the winners in each award category</p>
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
            <div class="category-icon-wrapper">
              <img :src="category.icon" :alt="category.name" class="category-icon" />
            </div>
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
              <img :src="selectedCategory.icon" :alt="selectedCategory.name" class="badge-icon" />
              {{ selectedCategory.name }}
            </span>
            <h2>Winners Over the Years</h2>
            <p>{{ selectedCategory.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading winners of {{ selectedCategory.name }}...</p>
    </div>

    <!-- Winners Grid -->
    <section v-else class="movies-section">
      <div class="container">
        
        <!-- No winners -->
        <div v-if="categoryWinners.length === 0" class="no-winners">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="7"/>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
          </svg>
          <h3>No winner found</h3>
          <p>No complete data for this category yet.</p>
        </div>

        <!-- Grid de Filmes (movie e technical) -->
        <div v-else-if="selectedCategory.type === 'movie' || selectedCategory.type === 'technical'" class="movies-grid">
          <article
            v-for="item in categoryWinners"
            :key="item.id"
            class="movie-card"
          >
            <div class="movie-poster">
              <img
                v-if="item.movieDetails?.poster_path"
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
                <button class="play-btn" @click="goToMovie(item.movieDetails.id)">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>

              <!-- Ano do Oscar -->
              <div class="year-badge">
                🏆 {{ item.year }}
              </div>
            </div>

            <div class="movie-info">
              <h3>{{ item.movieDetails?.title || item.winner.title }}</h3>
              
              <!-- Nome do profissional (para categorias técnicas) -->
              <p class="professional-name" v-if="item.professionalName">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {{ item.professionalName }}
              </p>

              <div class="movie-meta">
                <span class="rating" v-if="item.movieDetails?.vote_average">
                  ⭐ {{ item.movieDetails.vote_average.toFixed(1) }}
                </span>
                <span class="release-year" v-if="item.movieDetails?.release_date">
                  {{ new Date(item.movieDetails.release_date).getFullYear() }}
                </span>
              </div>

              <p class="movie-description" v-if="item.movieDetails?.overview">
                {{ item.movieDetails.overview.substring(0, 100) }}...
              </p>

              <div class="award-info">
                <span class="award-badge">🏆 Oscar {{ item.year }}</span>
                <span class="ceremony-badge">{{ item.ceremony }}ª Cerimônia</span>
              </div>
            </div>
          </article>
        </div>

        <!-- Grid de Pessoas -->
        <div v-else class="persons-grid">
          <article
            v-for="item in categoryWinners"
            :key="item.id"
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

              <!-- Ano do Oscar -->
              <div class="year-badge">
                🏆 {{ item.year }}
              </div>
            </div>

            <div class="person-info" @click="goToPerson(item.personDetails.id)">
              <h3>{{ item.winner.name }}</h3>
              
              <p class="movie-reference">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                </svg>
                {{ item.movieTitle }}
              </p>

              <!-- Info da pessoa -->
              <div class="person-details" v-if="item.personDetails">
                <span v-if="item.personDetails.birthday" class="detail-item">
                  📅 {{ new Date(item.personDetails.birthday).toLocaleDateString('pt-BR') }}
                </span>
                <span v-if="item.personDetails.place_of_birth" class="detail-item">
                  📍 {{ item.personDetails.place_of_birth.split(',')[0] }}
                </span>
              </div>

              <div class="award-info">
                <span class="award-badge">🏆 Oscar {{ item.year }}</span>
                <span class="ceremony-badge">{{ item.ceremony }}ª Cerimônia</span>
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
  max-width: 1900px;
  margin: 0 auto;
  padding: 0 3rem;
}

.categories-grid {
  justify-content: center;
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  scrollbar-width: thin;
  scrollbar-color: var(--oscar-gold) transparent;
}

.categories-grid::-webkit-scrollbar {
  height: 6px;
}

.categories-grid::-webkit-scrollbar-track {
  background: rgba(212, 175, 55, 0.1);
  border-radius: 10px;
}

.categories-grid::-webkit-scrollbar-thumb {
  background: var(--oscar-gradient);
  border-radius: 10px;
}

.category-card {
  min-width: 160px;
  max-width: 180px;
  background: var(--oscar-card-bg);
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 1.2rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-align: center;
  flex-shrink: 0;
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
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.25);
}

.category-card.active {
  border-color: var(--oscar-gold);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
}

.category-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.75rem;
}

.category-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(255, 215, 0, 0.3));
}

.category-card h3 {
  font-size: 0.9rem;
  font-weight: 800;
  margin-bottom: 0.4rem;
  color: #fff;
  line-height: 1.2;
}

.category-card p {
  font-size: 0.7rem;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  line-height: 1.3;
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

.badge-icon {
  max-width: 24px;
  max-height: 24px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3));
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

/* Movies Section */
.movies-section {
  padding: 4rem 0 6rem;
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

.year-badge {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: var(--oscar-gold);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.movie-info {
  padding: 1.5rem;
}

.movie-info h3 {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  color: #fff;
}

/* Professional Name (para categorias técnicas) */
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
  color: var(--oscar-gold);
  font-weight: 700;
}

.release-year {
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
}

.ceremony-badge {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--oscar-text-secondary);
  padding: 0.4rem 0.9rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
}

/* Persons Grid */
.persons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.person-card {
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  position: relative;
}

.person-card:hover {
  transform: translateY(-8px);
  border-color: var(--oscar-gold);
  box-shadow: 0 15px 50px rgba(212, 175, 55, 0.25);
}

.person-photo {
  width: 160px;
  min-height: 220px;
  flex-shrink: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  position: relative;
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

.person-photo .year-badge {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
}

.person-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.person-info h3 {
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  line-height: 1.3;
  color: #fff;
}

.movie-reference {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--oscar-gold);
  font-size: 0.95rem;
  font-family: 'Montserrat', sans-serif;
  margin-bottom: 1rem;
  font-weight: 500;
}

.movie-reference svg {
  flex-shrink: 0;
  opacity: 0.7;
}

.person-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-item {
  font-size: 0.8rem;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
}

.person-info .award-info {
  margin-top: auto;
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
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .category-card {
    padding: 1.5rem 1rem;
  }

  .category-icon {
    max-width: 50px;
    max-height: 50px;
  }

  .category-card h3 {
    font-size: 0.95rem;
  }

  .category-card p {
    font-size: 0.75rem;
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

  .persons-grid {
    grid-template-columns: 1fr;
  }

  .person-card {
    flex-direction: column;
  }

  .person-photo {
    width: 100%;
    height: 280px;
  }
}
</style>