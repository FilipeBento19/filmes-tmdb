<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: String,
  items: Array,
  imageBase: {
    type: String,
    default: 'https://image.tmdb.org/t/p/w500'
  }
})

const scrollContainer = ref(null)

const scroll = (direction) => {
  const container = scrollContainer.value
  const scrollAmount = container.clientWidth * 0.8
  
  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

const getRating = (vote) => {
  return vote ? vote.toFixed(1) : 'N/A'
}

const getYear = (date) => {
  return date ? new Date(date).getFullYear() : ''
}
</script>

<template>
  <section class="carousel-section">
    <div class="carousel-header">
      <h2 class="carousel-title">{{ title }}</h2>
      <div class="carousel-controls">
        <button @click="scroll('left')" class="control-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button @click="scroll('right')" class="control-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="carousel-container" ref="scrollContainer">
      <div class="carousel-track">
        <article 
          v-for="item in items" 
          :key="item.id" 
          class="carousel-card"
        >
          <div class="card-image">
            <img 
              v-if="item.poster_path"
              :src="imageBase + item.poster_path" 
              :alt="item.title || item.name"
              loading="lazy"
            />
            <div v-else class="no-image">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            
            <div class="card-overlay">
              <button class="play-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <div class="overlay-content">
                <h3>{{ item.title || item.name }}</h3>
                <div class="meta">
                  <span class="year" v-if="item.release_date || item.first_air_date">
                    {{ getYear(item.release_date || item.first_air_date) }}
                  </span>
                  <span class="rating">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {{ getRating(item.vote_average) }}
                  </span>
                </div>
                <p class="overview" v-if="item.overview">
                  {{ item.overview.substring(0, 100) }}...
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.carousel-section {
  margin-bottom: 3rem;
}

.carousel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 2rem;
}

.carousel-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.carousel-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.carousel-container {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 0 2rem;
}

.carousel-container::-webkit-scrollbar {
  display: none;
}

.carousel-track {
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
}

.carousel-card {
  min-width: 200px;
  max-width: 200px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.carousel-card:hover {
  transform: scale(1.05);
  z-index: 10;
}

.card-image {
  position: relative;
  aspect-ratio: 2/3;
  border-radius: 8px;
  overflow: hidden;
  background: #1a1a1a;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.carousel-card:hover .card-image img {
  transform: scale(1.1);
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

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.6) 60%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.carousel-card:hover .card-overlay {
  opacity: 1;
}

.play-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
}

.play-btn:hover {
  background: #fff;
  transform: scale(1.15);
}

.overlay-content {
  width: 100%;
  color: #fff;
}

.overlay-content h3 {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
}

.year {
  color: #b8b8b8;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #ffd700;
}

.overview {
  font-size: 0.75rem;
  line-height: 1.3;
  color: #ccc;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 768px) {
  .carousel-header {
    padding: 0 1rem;
  }

  .carousel-container {
    padding: 0 1rem;
  }

  .carousel-card {
    min-width: 140px;
    max-width: 140px;
  }

  .carousel-title {
    font-size: 1.2rem;
  }
}
</style>