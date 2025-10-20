<script setup>
import { ref, onMounted } from 'vue';
import Loading from 'vue-loading-overlay';
import api from '@/plugins/axios';
import { useGenreStore } from '@/stores/genre';

const genreStore = useGenreStore();

const tvShows = ref([]);
const isLoading = ref(false);

const listTvShows = async (genreId) => {
  genreStore.setCurrentGenreId(genreId);
  isLoading.value = true;
  try {
    const response = await api.get('discover/tv', {
      params: {
        with_genres: genreId,
        language: 'pt-BR',
      },
    });
    tvShows.value = response.data.results;
  } catch (error) {
    console.error('Erro ao buscar programas de TV:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return 'Data desconhecida';
  return new Date(date).toLocaleDateString('pt-BR');
};

onMounted(async () => {
  isLoading.value = true;
  await genreStore.getAllGenres('tv');
  isLoading.value = false;
});
</script>

<template>
  <div>
    <h1>Programas de TV</h1>
    
    <ul class="genre-list">
      <li
        v-for="genre in genreStore.genres"
        :key="genre.id"
        @click="listTvShows(genre.id)"
        class="genre-item"
        :class="{ active: genre.id === genreStore.currentGenreId }"
      >
        {{ genre.name }}
      </li>
    </ul>

    <loading v-model:active="isLoading" is-full-page />

    <div class="movie-list">
      <div v-for="show in tvShows" :key="show.id" class="movie-card">
        <img
          :src="`https://image.tmdb.org/t/p/w500${show.poster_path}`"
          :alt="show.name"
        />
        <div class="movie-details">
          <p class="movie-title">{{ show.name }}</p>
          <p class="movie-release-date">{{ formatDate(show.first_air_date) }}</p>
          <p class="movie-genres">
            <span
              v-for="genre_id in show.genre_ids"
              :key="genre_id"
              @click="listTvShows(genre_id)"
              :class="{ active: genre_id === genreStore.currentGenreId }"
            >
              {{ genreStore.getGenreName(genre_id) }}
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.genre-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  list-style: none;
  margin-bottom: 2rem;
  padding: 0;
}

.genre-item {
  background-color: #5d6424;
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  color: #fff;
}

.genre-item:hover {
  cursor: pointer;
  background-color: #7d8a2e;
  box-shadow: 0 0 0.5rem #5d6424;
}

.genre-item.active {
  background-color: #abc322;
  color: #000;
  font-weight: bolder;
}

.movie-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-evenly
}

.movie-card {
  width: 15rem;
  height: 30rem;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0 0.5rem #000;
}

.movie-card img {
  width: 100%;
  height: 20rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 0.5rem #000;
}

.movie-details {
  padding: 0 0.5rem;
}

.movie-title {
  font-size: 1.1rem;
  font-weight: bold;
  line-height: 1.3rem;
  height: 3.2rem;
}

.movie-genres {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
  gap: 0.2rem;
}

.movie-genres span {
  background-color: #748708;
  border-radius: 0.5rem;
  padding: 0.2rem 0.5rem;
  color: #fff;
  font-size: 0.8rem;
  font-weight: bold;
}

.movie-genres span:hover {
  cursor: pointer;
  background-color: #455a08;
  box-shadow: 0 0 0.5rem #748708;
}

.movie-genres span.active {
  background-color: #abc322;
  color: #000;
  font-weight: bolder;
}
</style>