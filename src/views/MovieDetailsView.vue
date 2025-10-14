<script setup>
import { onMounted } from 'vue';
import { useMovieStore } from '@/stores/movie';

const movieStore = useMovieStore();

const props = defineProps({
  movieId: {
    type: Number,
    required: true,
  },
});

onMounted(async () => {
  await movieStore.getMovieDetail(props.movieId);
});
</script>

<template>
  <div class="main">
    <div class="content">
      <img
        :src="`https://image.tmdb.org/t/p/w342${movieStore.currentMovie.poster_path}`"
        :alt="movieStore.currentMovie.title"
      />

      <div class="details">
        <h1>{{ movieStore.currentMovie.title }}</h1>
        <p class="tagline">{{ movieStore.currentMovie.tagline }}</p>
        <p class="overview">{{ movieStore.currentMovie.overview }}</p>
        <p><strong>Orçamento:</strong> ${{ movieStore.currentMovie.budget?.toLocaleString() }}</p>
        <p><strong>Avaliação:</strong> {{ movieStore.currentMovie.vote_average?.toFixed(1) }} ⭐</p>
        <p><strong>Data de Lançamento:</strong> {{ movieStore.currentMovie.release_date }}</p>
      </div>
    </div>

    <div v-if="movieStore.currentMovie.production_companies?.length">
      <h2>Produtoras</h2>
      <div class="companies">
        <div
          v-for="company in movieStore.currentMovie.production_companies"
          :key="company.id"
          class="company"
        >
          <img
            v-if="company.logo_path"
            :src="`https://image.tmdb.org/t/p/w92${company.logo_path}`"
            :alt="company.name"
          />
          <p v-else>{{ company.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main {
  padding: 2rem;
}

.content {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.content img {
  border-radius: 0.5rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
}

.details {
  flex: 1;
}

.details h1 {
  margin-bottom: 0.5rem;
}

.tagline {
  font-style: italic;
  color: #666;
  margin-bottom: 1rem;
}

.overview {
  margin: 1rem 0;
  line-height: 1.8;
}

.companies {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
  margin-top: 1rem;
}

.company {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  min-width: 100px;
  text-align: center;
}

.company img {
  max-width: 92px;
  max-height: 50px;
  object-fit: contain;
}
</style>