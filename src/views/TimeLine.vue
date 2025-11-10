<script setup>
import { ref, onMounted } from 'vue'
import { useOscar } from '@/composables/useOscar'

const imageBase = 'https://image.tmdb.org/t/p/w500'

const { fetchDecadeWinners } = useOscar()

const decades = [
  { id: '2020s', name: 'Anos 2020', years: '2020-2024', start: 2020, end: 2024 },
  { id: '2010s', name: 'Anos 2010', years: '2010-2019', start: 2010, end: 2019 },
  { id: '2000s', name: 'Anos 2000', years: '2000-2009', start: 2000, end: 2009 },
  { id: '1990s', name: 'Anos 1990', years: '1990-1999', start: 1990, end: 1999 },
]

const selectedDecade = ref(decades[0])
const timelineMovies = ref([])
const loading = ref(false)

const loadDecadeMovies = async () => {
  loading.value = true
  try {
    const winners = await fetchDecadeWinners(
      selectedDecade.value.start, 
      selectedDecade.value.end
    )
    
    // Filtrar apenas os que têm bestPictureDetails
    timelineMovies.value = winners
      .filter(w => w.bestPictureDetails)
      .sort((a, b) => b.year - a.year) // Mais recentes primeiro
      
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    loading.value = false
  }
}

const selectDecade = (decade) => {
  selectedDecade.value = decade
  loadDecadeMovies()
}

onMounted(() => {
  loadDecadeMovies()
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
            <div class="decade-icon">📅</div>
            <h3>{{ decade.name }}</h3>
            <p>{{ decade.years }}</p>
          </button>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando linha do tempo...</p>
    </div>

    <!-- No Results -->
    <div v-else-if="timelineMovies.length === 0" class="no-results">
      <p>Nenhum vencedor encontrado para esta década 😕</p>
    </div>

    <!-- Timeline -->
    <section v-else class="timeline-section">
      <div class="container">
        <div class="timeline">
          <div
            v-for="(item, index) in timelineMovies"
            :key="item.year"
            :class="['timeline-item', { 'timeline-right': index % 2 === 0 }]"
          >
            <div class="timeline-marker">
              <div class="marker-dot"></div>
              <div class="marker-line" v-if="index < timelineMovies.length - 1"></div>
            </div>

            <div class="timeline-content">
              <div class="year-badge">
                {{ item.year }}
                <span class="ceremony-badge">{{ item.ceremony }}ª Cerimônia</span>
              </div>
              
              <div class="timeline-card">
                <div class="card-poster">
                  <img
                    v-if="item.bestPictureDetails.poster_path"
                    :src="imageBase + item.bestPictureDetails.poster_path"
                    :alt="item.bestPictureDetails.title"
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
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
                    <span>Melhor Filme</span>
                  </div>

                  <h3>{{ item.bestPictureDetails.title }}</h3>

                  <div class="movie-stats">
                    <span class="stat">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      {{ item.bestPictureDetails.vote_average?.toFixed(1) || 'N/A' }}
                    </span>
                    <span class="stat">
                      📅 {{ new Date(item.bestPictureDetails.release_date).getFullYear() }}
                    </span>
                  </div>

                  <p class="movie-description">
                    {{ item.bestPictureDetails.overview?.substring(0, 150) || 'Vencedor do Oscar de Melhor Filme' }}...
                  </p>

                  <button class="details-btn">
                    Ver Detalhes
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
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
  color: var(--oscar-black);
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.4);
}

.decade-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.decade-card h3 {
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.decade-card p {
  font-size: 0.9rem;
  opacity: 0.8;
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
  padding: 4rem 2rem;
  font-size: 1.2rem;
  color: var(--oscar-text-secondary);
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
  margin-bottom: 4rem;
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
  width: 20px;
  height: 20px;
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
    rgba(212, 175, 55, 0.3) 100%
  );
  margin-top: 1rem;
}

.timeline-content {
  position: relative;
}

.year-badge {
  background: var(--oscar-gradient);
  color: var(--oscar-black);
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
  letter-spacing: 0.05em;
}

.ceremony-badge {
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.3rem 0.7rem;
  border-radius: 15px;
  font-weight: 600;
}

.timeline-card {
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.timeline-card:hover {
  border-color: var(--oscar-gold);
  box-shadow: 0 10px 40px rgba(212, 175, 55, 0.2);
  transform: scale(1.02);
}

.card-poster {
  width: 150px;
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
  font-size: 0.8rem;
  font-weight: 700;
  width: fit-content;
  margin-bottom: 1rem;
  font-family: 'Montserrat', sans-serif;
}

.card-details h3 {
  font-size: 1.5rem;
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
  margin-bottom: 1.5rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  flex: 1;
}

.details-btn {
  background: transparent;
  border: 1px solid var(--oscar-gold);
  color: var(--oscar-gold);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
  font-family: 'Montserrat', sans-serif;
}

.details-btn:hover {
  background: var(--oscar-gradient);
  border-color: transparent;
  color: var(--oscar-black);
  transform: translateX(5px);
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

  .decades-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
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
    height: 300px;
  }

  .card-details {
    padding: 1.5rem;
  }

  .year-badge {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>