<script setup>
import { ref, onMounted, computed } from 'vue'
import { useOscar } from '@/composables/useOscar'

const imageBase = 'https://image.tmdb.org/t/p/w500'

const { oscarWinners, fetchMovieDetails, fetchPersonDetails } = useOscar()

const decades = [
  { id: '2020s', name: 'Anos 2020', years: '2020-2024', start: 2020, end: 2024 },
  { id: '2010s', name: 'Anos 2010', years: '2010-2019', start: 2010, end: 2019 },
  { id: '2000s', name: 'Anos 2000', years: '2000-2009', start: 2000, end: 2009 }
]

const selectedDecade = ref(decades[0])
const timelineData = ref([])
const loading = ref(false)

const loadDecadeTimeline = async () => {
  loading.value = true
  timelineData.value = []

  try {
    const { start, end } = selectedDecade.value

    const years = Object.keys(oscarWinners)
      .map(Number)
      .filter(year => year >= start && year <= end)
      .sort((a, b) => b - a)

    const timelineItems = []

    for (const year of years) {
      const yearData = oscarWinners[year]
      
      if (!yearData) continue

      const item = {
        year: yearData.year,
        ceremony: yearData.ceremony,
        date: yearData.date,
        bestPicture: null,
        director: null,
        actor: null,
        actress: null,
        animation: null,
        cinematography: null,
        originalScore: null
      }

      // Buscar Melhor Filme
      const bestPictureWinner = yearData.categories.bestPicture?.winner
      if (bestPictureWinner?.tmdbId && bestPictureWinner.tmdbId !== 0) {
        const movieDetails = await fetchMovieDetails(bestPictureWinner.tmdbId)
        if (movieDetails) {
          item.bestPicture = {
            ...movieDetails,
            oscarData: bestPictureWinner
          }
        }
      }

      // Buscar Melhor Diretor
      const directorWinner = yearData.categories.bestDirector?.winner
      if (directorWinner?.tmdbId && directorWinner.tmdbId !== 0) {
        const personDetails = await fetchPersonDetails(directorWinner.tmdbId)
        if (personDetails) {
          item.director = {
            ...personDetails,
            oscarData: directorWinner,
            movieTitle: directorWinner.title
          }
        }
      }

      // Buscar Melhor Ator
      const actorWinner = yearData.categories.bestActor?.winner
      if (actorWinner?.tmdbId && actorWinner.tmdbId !== 0) {
        const personDetails = await fetchPersonDetails(actorWinner.tmdbId)
        if (personDetails) {
          item.actor = {
            ...personDetails,
            oscarData: actorWinner,
            movieTitle: actorWinner.title
          }
        }
      }

      // Buscar Melhor Atriz
      const actressWinner = yearData.categories.bestActress?.winner
      if (actressWinner?.tmdbId && actressWinner.tmdbId !== 0) {
        const personDetails = await fetchPersonDetails(actressWinner.tmdbId)
        if (personDetails) {
          item.actress = {
            ...personDetails,
            oscarData: actressWinner,
            movieTitle: actressWinner.title
          }
        }
      }

      // Buscar Melhor Animação
      const animationWinner = yearData.categories.bestAnimatedFeature?.winner
      if (animationWinner?.tmdbId && animationWinner.tmdbId !== 0) {
        const movieDetails = await fetchMovieDetails(animationWinner.tmdbId)
        if (movieDetails) {
          item.animation = {
            ...movieDetails,
            oscarData: animationWinner
          }
        }
      }

      // Buscar Melhor Cinematografia
      const cinematographyWinner = yearData.categories.bestCinematography?.winner
      if (cinematographyWinner?.tmdbId && cinematographyWinner.tmdbId !== 0) {
        const movieDetails = await fetchMovieDetails(cinematographyWinner.tmdbId)
        if (movieDetails) {
          item.cinematography = {
            ...movieDetails,
            oscarData: cinematographyWinner,
            professionalName: cinematographyWinner.cinematographer
          }
        }
      }

      // Buscar Melhor Trilha Sonora
      const scoreWinner = yearData.categories.bestOriginalScore?.winner
      if (scoreWinner?.tmdbId && scoreWinner.tmdbId !== 0) {
        const movieDetails = await fetchMovieDetails(scoreWinner.tmdbId)
        if (movieDetails) {
          item.originalScore = {
            ...movieDetails,
            oscarData: scoreWinner,
            professionalName: scoreWinner.composer
          }
        }
      }

      // Só adicionar se tiver pelo menos o Melhor Filme
      if (item.bestPicture) {
        timelineItems.push(item)
      }
    }

    timelineData.value = timelineItems
  } catch (error) {
    console.error('Erro ao carregar timeline:', error)
  } finally {
    loading.value = false
  }
}

const selectDecade = (decade) => {
  selectedDecade.value = decade
  loadDecadeTimeline()
}

// Estatísticas da década
const decadeStats = computed(() => {
  return {
    totalYears: timelineData.value.length,
    withDirector: timelineData.value.filter(item => item.director).length,
    withAnimation: timelineData.value.filter(item => item.animation).length
  }
})

onMounted(() => {
  loadDecadeTimeline()
})
</script>

<template>
  <div class="timeline-page">
    <!-- Hero -->
    <section class="page-hero">
      <div class="hero-content">
        <div class="hero-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="url(#gold-stroke)" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
            <defs>
              <linearGradient id="gold-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFD700"/>
                <stop offset="100%" style="stop-color:#B8941F"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1>Linha do Tempo</h1>
        <p>Uma jornada através das décadas de ouro do cinema premiado</p>
      </div>
    </section>

    <!-- Decade Selector -->
    <section class="decades-section">
      <div class="container">
       <div class="decades-grid">
        <button
          v-for="decade in decades"
          :key="decade.id"
          @click="selectDecade(decade)"
          :class="['decade-card', { active: selectedDecade.id === decade.id }]"
        >
          <div>
            <img 
              class="decade-icon" 
              :src="selectedDecade.id === decade.id ? '/imgs/calendar_1.png' : '/imgs/calendar.png'" 
              :alt="decade.name"
            >
          </div>
          <h3>{{ decade.name }}</h3>
          <p>{{ decade.years }}</p>
        </button>
      </div>

        <!-- Stats -->
        <div class="decade-stats" v-if="!loading && timelineData.length > 0">
          <div class="stat-item">
            <span class="stat-number">{{ decadeStats.totalYears }}</span>
            <span class="stat-label">Cerimônias</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ decadeStats.totalYears }}</span>
            <span class="stat-label">Melhores Filmes</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ decadeStats.withAnimation }}</span>
            <span class="stat-label">Animações</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando linha do tempo de {{ selectedDecade.name }}...</p>
    </div>

    <!-- No Results -->
    <div v-else-if="timelineData.length === 0" class="no-results">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <h3>Nenhum dado encontrado</h3>
      <p>Não temos dados completos para {{ selectedDecade.name }} ainda.</p>
    </div>

    <!-- Timeline -->
    <section v-else class="timeline-section">
      <div class="container">
        <div class="timeline">
          <div
            v-for="(item, index) in timelineData"
            :key="item.year"
            :class="['timeline-item', { 'timeline-right': index % 2 === 0 }]"
          >
            <div class="timeline-marker">
              <div class="marker-dot"></div>
              <div class="marker-line" v-if="index < timelineData.length - 1"></div>
            </div>

            <div class="timeline-content">
              <!-- Year Header -->
              <div class="year-header">
                <div class="year-badge">
                  {{ item.year }}
                  <span class="ceremony-badge">{{ item.ceremony }}ª Cerimônia</span>
                </div>
              </div>
              
              <!-- Main Card: Best Picture -->
              <div class="timeline-card main-card" v-if="item.bestPicture">
                <div class="card-poster">
                  <img
                    v-if="item.bestPicture.poster_path"
                    :src="imageBase + item.bestPicture.poster_path"
                    :alt="item.bestPicture.title"
                    loading="lazy"
                  />
                  <div v-else class="no-poster">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                </div>

                <div class="card-details">
                  <div class="oscar-badge">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>Melhor Filme</span>
                  </div>

                  <h3>{{ item.bestPicture.title }}</h3>

                  <div class="movie-stats">
                    <span class="stat" v-if="item.bestPicture.vote_average">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      {{ item.bestPicture.vote_average.toFixed(1) }}
                    </span>
                    <span class="stat" v-if="item.bestPicture.release_date">
                      <img class="decade-icon2" src="/imgs/calendar.png" alt=""> {{ new Date(item.bestPicture.release_date).getFullYear() }}
                    </span>
                    <span class="stat" v-if="item.bestPicture.runtime">
                      <img class="decade-icon2" src="/imgs/time.png" alt=""> {{ item.bestPicture.runtime }}min
                    </span>
                  </div>

                  <p class="movie-description" v-if="item.bestPicture.overview">
                    {{ item.bestPicture.overview.substring(0, 200) }}...
                  </p>

                  <!-- Genres -->
                  <div class="genres" v-if="item.bestPicture.genres && item.bestPicture.genres.length > 0">
                    <span
                      v-for="genre in item.bestPicture.genres.slice(0, 3)"
                      :key="genre.id"
                      class="genre-tag"
                    >
                      {{ genre.name }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Secondary Winners -->
              <div class="secondary-winners">
                <!-- Director -->
                <div class="winner-chip" v-if="item.director">
                  <div class="chip-avatar">
                    <img
                      v-if="item.director.profile_path"
                      :src="imageBase + item.director.profile_path"
                      :alt="item.director.oscarData.name"
                    />
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div class="chip-info">
                    <span class="chip-label">Melhor Diretor</span>
                    <span class="chip-name">{{ item.director.oscarData.name }}</span>
                    <span class="chip-movie">{{ item.director.movieTitle }}</span>
                  </div>
                </div>

                <!-- Actor -->
                <div class="winner-chip" v-if="item.actor">
                  <div class="chip-avatar">
                    <img
                      v-if="item.actor.profile_path"
                      :src="imageBase + item.actor.profile_path"
                      :alt="item.actor.oscarData.name"
                    />
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div class="chip-info">
                    <span class="chip-label">Melhor Ator</span>
                    <span class="chip-name">{{ item.actor.oscarData.name }}</span>
                    <span class="chip-movie">{{ item.actor.movieTitle }}</span>
                  </div>
                </div>

                <!-- Actress -->
                <div class="winner-chip" v-if="item.actress">
                  <div class="chip-avatar">
                    <img
                      v-if="item.actress.profile_path"
                      :src="imageBase + item.actress.profile_path"
                      :alt="item.actress.oscarData.name"
                    />
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div class="chip-info">
                    <span class="chip-label">Melhor Atriz</span>
                    <span class="chip-name">{{ item.actress.oscarData.name }}</span>
                    <span class="chip-movie">{{ item.actress.movieTitle }}</span>
                  </div>
                </div>

                <!-- Animation -->
                <div class="winner-chip" v-if="item.animation">
                  <div class="chip-poster">
                    <img
                      v-if="item.animation.poster_path"
                      :src="imageBase + item.animation.poster_path"
                      :alt="item.animation.title"
                    />
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    </svg>
                  </div>
                  <div class="chip-info">
                    <span class="chip-label">Melhor Animação</span>
                    <span class="chip-name">{{ item.animation.title }}</span>
                    <span class="chip-rating" v-if="item.animation.vote_average">
                      ⭐ {{ item.animation.vote_average.toFixed(1) }}
                    </span>
                  </div>
                </div>

                <!-- Cinematography -->
                <div class="winner-chip technical-chip" v-if="item.cinematography">
                  <div class="chip-poster">
                    <img
                      v-if="item.cinematography.poster_path"
                      :src="imageBase + item.cinematography.poster_path"
                      :alt="item.cinematography.title"
                    />
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    </svg>
                  </div>
                  <div class="chip-info">
                    <span class="chip-label">Melhor Cinematografia</span>
                    <span class="chip-name">{{ item.cinematography.title }}</span>
                    <span class="chip-professional" v-if="item.cinematography.professionalName">
                      📷 {{ item.cinematography.professionalName }}
                    </span>
                  </div>
                </div>

                <!-- Original Score -->
                <div class="winner-chip technical-chip" v-if="item.originalScore">
                  <div class="chip-poster">
                    <img
                      v-if="item.originalScore.poster_path"
                      :src="imageBase + item.originalScore.poster_path"
                      :alt="item.originalScore.title"
                    />
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    </svg>
                  </div>
                  <div class="chip-info">
                    <span class="chip-label">Melhor Trilha Sonora</span>
                    <span class="chip-name">{{ item.originalScore.title }}</span>
                    <span class="chip-professional" v-if="item.originalScore.professionalName">
                      🎵 {{ item.originalScore.professionalName }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.timeline-page {
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

/* Decades Section */
.decades-section {
  padding: 3rem 0;
  background: rgba(212, 175, 55, 0.03);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.decades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.decade-card {
  background: var(--oscar-card-bg);
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.decade-card:hover {
  border-color: var(--oscar-gold);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);
}

.decade-card.active {
  background: var(--oscar-gradient);
  border-color: transparent;
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.4);
}

.decade-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  max-width: 50px;
}

.decade-icon2 {
  max-width: 20px;
}

.decade-card h3 {
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: #fff;
}

.decade-card p {
  font-size: 0.9rem;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
}

.decade-card.active h3,
.decade-card.active p {
  color: var(--oscar-black);
}

/* Decade Stats */
.decade-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  padding: 2rem;
  background: rgba(212, 175, 55, 0.05);
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
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

/* No Results */
.no-results {
  text-align: center;
  padding: 5rem 2rem;
  color: var(--oscar-text-secondary);
}

.no-results svg {
  opacity: 0.3;
  margin-bottom: 2rem;
}

.no-results h3 {
  font-size: 1.8rem;
  color: #fff;
  margin-bottom: 1rem;
}

.no-results p {
  font-size: 1.1rem;
  font-family: 'Montserrat', sans-serif;
}

/* Timeline Section */
.timeline-section {
  padding: 5rem 0;
}

.timeline {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.timeline-item {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 3rem;
  margin-bottom: 5rem;
  position: relative;
}

.timeline-item.timeline-right {
  direction: rtl;
}

.timeline-item.timeline-right .timeline-content {
  direction: ltr;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.marker-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--oscar-gradient);
  border: 4px solid var(--oscar-dark-bg);
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.3);
  z-index: 2;
}

.marker-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(
    to bottom,
    var(--oscar-gold) 0%,
    rgba(212, 175, 55, 0.2) 100%
  );
  margin-top: 1rem;
}

.timeline-content {
  position: relative;
}

.year-header {
  margin-bottom: 1.5rem;
}

.year-badge {
  background: var(--oscar-gradient);
  color: var(--oscar-black);
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 1.3rem;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
  letter-spacing: 0.05em;
}

.ceremony-badge {
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.35rem 0.8rem;
  border-radius: 15px;
  font-weight: 600;
}

/* Main Card */
.timeline-card {
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  gap: 2rem;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.timeline-card.main-card {
  border: 2px solid rgba(212, 175, 55, 0.3);
}

.timeline-card:hover {
  border-color: var(--oscar-gold);
  box-shadow: 0 10px 40px rgba(212, 175, 55, 0.25);
  transform: translateX(5px);
}

.card-poster {
  width: 180px;
  flex-shrink: 0;
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

.timeline-card:hover .card-poster img {
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

.card-details {
  padding: 1.5rem 1.5rem 1.5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.oscar-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: var(--oscar-gold);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  width: fit-content;
  margin-bottom: 1rem;
  font-family: 'Montserrat', sans-serif;
}

.oscar-badge svg {
  fill: var(--oscar-gold);
}

.card-details h3 {
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #fff;
  line-height: 1.2;
}

.movie-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  font-family: 'Montserrat', sans-serif;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--oscar-gold);
  font-weight: 700;
  font-size: 0.95rem;
}

.stat svg {
  fill: var(--oscar-gold);
}

.movie-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--oscar-text-secondary);
  margin-bottom: 1rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
}

.genres {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.genre-tag {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--oscar-text-secondary);
  padding: 0.4rem 0.9rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
}

/* Secondary Winners */
.secondary-winners {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.winner-chip {
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  transition: all 0.3s ease;
}

.winner-chip:hover {
  border-color: var(--oscar-gold);
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(212, 175, 55, 0.2);
}

.technical-chip {
  background: rgba(212, 175, 55, 0.05);
}

.chip-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chip-avatar svg {
  color: rgba(212, 175, 55, 0.3);
}

.chip-poster {
  width: 50px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chip-poster svg {
  color: rgba(212, 175, 55, 0.3);
}

.chip-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.chip-label {
  font-size: 0.75rem;
  color: var(--oscar-gold);
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
}

.chip-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-movie,
.chip-rating {
  font-size: 0.8rem;
  color: var(--oscar-text-secondary);
  font-family: 'Montserrat', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-professional {
  font-size: 0.8rem;
  color: var(--oscar-gold);
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive */
@media (max-width: 1024px) {
  .secondary-winners {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

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

  .decades-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .decade-stats {
    gap: 1.5rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .timeline-item {
    grid-template-columns: auto 1fr;
    gap: 1.5rem;
  }

  .timeline-item.timeline-right {
    direction: ltr;
  }

  .timeline-item > :first-child {
    grid-column: 2;
  }

  .timeline-item > :last-child {
    grid-column: 2;
  }

  .timeline-card {
    flex-direction: column;
  }

  .card-poster {
    width: 100%;
    height: 350px;
  }

  .card-details {
    padding: 1.5rem;
  }

  .year-badge {
    flex-direction: column;
    gap: 0.5rem;
    font-size: 1.1rem;
  }

  .secondary-winners {
    grid-template-columns: 1fr;
  }
}
</style>