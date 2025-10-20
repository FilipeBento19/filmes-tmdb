<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Loading from 'vue-loading-overlay';
import api from '@/plugins/axios';
import { useGenreStore } from '@/stores/genre';

const genreStore = useGenreStore();
const router = useRouter();

const movies = ref([]);
const isLoading = ref(false);

const listMovies = async (genreId) => {
  genreStore.setCurrentGenreId(genreId);
  isLoading.value = true;
  try {
    const response = await api.get('discover/movie', {
      params: {
        with_genres: genreId,
        language: 'pt-BR',
      },
    });
    movies.value = response.data.results;
  } catch (error) {
    console.error('Erro ao buscar filmes:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return 'Data desconhecida';
  return new Date(date).toLocaleDateString('pt-BR');
};

const openMovie = (movieId) => {
  router.push({ name: 'MovieDetails', params: { movieId } });
};

onMounted(async () => {
  isLoading.value = true;
  await genreStore.getAllGenres('movie');
  isLoading.value = false;
});
</script>

<template>
  <div>
    <h1>Filmes</h1>
    
    <ul class="genre-list">
      <li
        v-for="genre in genreStore.genres"
        :key="genre.id"
        @click="listMovies(genre.id)"
        class="genre-item"
        :class="{ active: genre.id === genreStore.currentGenreId }"
      >
        {{ genre.name }}
      </li>
    </ul>

    <loading v-model:active="isLoading" is-full-page />

    <div class="movie-list">
      <div v-for="movie in movies" :key="movie.id" class="movie-card">
        <img
          :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
          :alt="movie.title"
          @click="openMovie(movie.id)"
        />
        <div class="movie-details">
          <p class="movie-title">{{ movie.title }}</p>
          <p class="movie-release-date">{{ formatDate(movie.release_date) }}</p>
          <p class="movie-genres">
            <span
              v-for="genre_id in movie.genre_ids"
              :key="genre_id"
              @click="listMovies(genre_id)"
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
  background-color: #387250;
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  color: #fff;
}

.genre-item:hover {
  cursor: pointer;
  background-color: #4e9e5f;
  box-shadow: 0 0 0.5rem #387250;
}

.genre-item.active {
  background-color: #67b086;
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
  cursor: pointer;
  transition: transform 0.3s;
}

.movie-card img:hover {
  transform: scale(1.05);
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