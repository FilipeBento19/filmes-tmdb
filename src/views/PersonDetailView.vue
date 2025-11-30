<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/plugins/axios'
import { useOscar } from '@/composables/useOscar'

const route = useRoute()
const router = useRouter()
const { oscarWinners } = useOscar()

const imageBase = 'https://image.tmdb.org/t/p/w500'

const person = ref(null)
const credits = ref([])
const loading = ref(true)
const oscarInfo = ref(null)

// Buscar prêmios Oscar da pessoa
const findOscarInfo = (personId) => {
  const awards = []
  
  Object.entries(oscarWinners).forEach(([year, yearData]) => {
    Object.entries(yearData.categories).forEach(([category, data]) => {
      if (data.winner?.tmdbId === personId) {
        awards.push({
          year: parseInt(year),
          ceremony: yearData.ceremony,
          category: getCategoryName(category),
          categoryKey: category,
          movieTitle: data.winner.title
        })
      }
    })
  })
  
  return awards.length > 0 ? awards : null
}

const getCategoryName = (key) => {
  const map = {
    bestDirector: 'Melhor Diretor',
    bestActor: 'Melhor Ator',
    bestActress: 'Melhor Atriz',
    bestSupportingActor: 'Melhor Ator Coadjuvante',
    bestSupportingActress: 'Melhor Atriz Coadjuvante'
  }
  return map[key] || key
}

const loadPerson = async () => {
  loading.value = true
  
  try {
    const personId = parseInt(route.params.id)
    
    const [personRes, creditsRes] = await Promise.all([
      api.get(`/person/${personId}?language=pt-BR`),
      api.get(`/person/${personId}/movie_credits?language=pt-BR`)
    ])
    
    person.value = personRes.data
    
    // Ordenar por popularidade e pegar os principais
    credits.value = creditsRes.data.cast
      ?.sort((a, b) => b.popularity - a.popularity)
      .slice(0, 12) || []
    
    oscarInfo.value = findOscarInfo(personId)
    
  } catch (error) {
    console.error('Erro ao carregar pessoa:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const calculateAge = (birthday, deathday = null) => {
  if (!birthday) return null
  const birth = new Date(birthday)
  const end = deathday ? new Date(deathday) : new Date()
  let age = end.getFullYear() - birth.getFullYear()
  const m = end.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
    age--
  }
  return age
}

const goToMovie = (movieId) => {
  router.push({ name: 'movie', params: { id: movieId } })
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadPerson()
})
</script>

<template>
  <div class="person-detail">
    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Carregando informações...</p>
    </div>

    <template v-else-if="person">
      <!-- Header -->
      <section class="person-header">
        <div class="container">
          <button class="back-btn" @click="goBack">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Voltar
          </button>

          <div class="header-content">
            <!-- Photo -->
            <div class="photo-section">
              <div class="photo">
                <img
                  v-if="person.profile_path"
                  :src="imageBase + person.profile_path"
                  :alt="person.name"
                />
                <div v-else class="no-photo">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>

              <!-- Oscar Badges -->
              <div class="oscar-awards" v-if="oscarInfo && oscarInfo.length > 0">
                <div class="oscar-title">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Vencedor do Oscar
                </div>
                <div 
                  v-for="award in oscarInfo" 
                  :key="award.year + award.categoryKey"
                  class="oscar-award"
                >
                  <div class="award-details">
                    <span class="award-category">{{ award.category }}</span>
                    <span class="award-movie">{{ award.movieTitle }}</span>
                  </div>
                  <span class="award-year">{{ award.year }}</span>
                </div>
              </div>
            </div>

            <!-- Info -->
            <div class="info-section">
              <h1 class="person-name">{{ person.name }}</h1>
              
              <div class="person-meta">
                <span class="department" v-if="person.known_for_department">
                  {{ person.known_for_department === 'Acting' ? 'Atuação' : person.known_for_department }}
                </span>
              </div>

              <!-- Personal Info -->
              <div class="personal-info">
                <div class="info-item" v-if="person.birthday">
                  <span class="info-label">📅 Nascimento</span>
                  <span class="info-value">
                    {{ formatDate(person.birthday) }}
                    <span v-if="!person.deathday"> ({{ calculateAge(person.birthday) }} anos)</span>
                  </span>
                </div>

                <div class="info-item" v-if="person.deathday">
                  <span class="info-label">🕊️ Falecimento</span>
                  <span class="info-value">
                    {{ formatDate(person.deathday) }} ({{ calculateAge(person.birthday, person.deathday) }} anos)
                  </span>
                </div>

                <div class="info-item" v-if="person.place_of_birth">
                  <span class="info-label">📍 Local</span>
                  <span class="info-value">{{ person.place_of_birth }}</span>
                </div>
              </div>

              <!-- Biography -->
              <div class="biography" v-if="person.biography">
                <h3>Biografia</h3>
                <p>{{ person.biography }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Filmography -->
      <section class="filmography-section" v-if="credits.length > 0">
        <div class="container">
          <h2>Filmografia</h2>
          <div class="films-grid">
            <article 
              v-for="movie in credits" 
              :key="movie.id"
              class="film-card"
              @click="goToMovie(movie.id)"
            >
              <div class="film-poster">
                <img
                  v-if="movie.poster_path"
                  :src="imageBase + movie.poster_path"
                  :alt="movie.title"
                  loading="lazy"
                />
                <div v-else class="no-poster">🎬</div>
              </div>
              <div class="film-info">
                <h4>{{ movie.title }}</h4>
                <p class="character" v-if="movie.character">{{ movie.character }}</p>
                <div class="film-meta">
                  <span class="rating" v-if="movie.vote_average">
                    ⭐ {{ movie.vote_average.toFixed(1) }}
                  </span>
                  <span class="year" v-if="movie.release_date">
                    {{ new Date(movie.release_date).getFullYear() }}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.person-detail {
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

/* Container */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

/* Header */
.person-header {
  padding: 6rem 0 4rem;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.back-btn {
  background: rgba(212, 175, 55, 0.1);
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
  margin-bottom: 2rem;
}

.back-btn:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: var(--oscar-gold);
}

.header-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 3rem;
}

/* Photo */
.photo-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.photo {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(212, 175, 55, 0.3);
}

.photo img {
  width: 100%;
  display: block;
}

.no-photo {
  aspect-ratio: 3/4;
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

.award-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.award-category {
  color: #fff;
  font-weight: 600;
}

.award-movie {
  color: var(--oscar-text-secondary);
  font-size: 0.85rem;
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
  padding-top: 1rem;
}

.person-name {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1rem;
  background: var(--oscar-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.person-meta {
  margin-bottom: 2rem;
}

.department {
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: var(--oscar-gold);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Personal Info */
.personal-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  color: var(--oscar-text-secondary);
  font-size: 0.9rem;
}

.info-value {
  color: #fff;
  font-size: 1.05rem;
  font-weight: 500;
}

/* Biography */
.biography h3 {
  color: var(--oscar-gold);
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.biography p {
  color: var(--oscar-text-secondary);
  line-height: 1.7;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
}

/* Filmography */
.filmography-section {
  padding: 4rem 0;
}

.filmography-section h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 2rem;
  color: #fff;
}

.films-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.film-card {
  background: var(--oscar-card-bg);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.film-card:hover {
  transform: translateY(-8px);
  border-color: var(--oscar-gold);
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);
}

.film-poster {
  aspect-ratio: 2/3;
  overflow: hidden;
}

.film-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.film-card:hover .film-poster img {
  transform: scale(1.1);
}

.no-poster {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: rgba(255, 255, 255, 0.05);
}

.film-info {
  padding: 1rem;
}

.film-info h4 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #fff;
  line-height: 1.2;
}

.character {
  color: var(--oscar-gold);
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  font-family: 'Montserrat', sans-serif;
}

.film-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
}

.film-meta .rating {
  color: var(--oscar-gold);
  font-weight: 600;
}

.film-meta .year {
  color: var(--oscar-text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 1.5rem;
  }

  .header-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .photo-section {
    max-width: 220px;
    margin: 0 auto;
  }

  .person-name {
    font-size: 2rem;
    text-align: center;
  }

  .person-meta {
    text-align: center;
  }

  .films-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>