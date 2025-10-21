<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTvStore } from '@/stores/tv';

const route = useRoute();
const tvStore = useTvStore();

onMounted(async () => {
  await tvStore.getSeriesDetail(route.params.id);
});
</script>

<template>
  <div class="main">
    <div class="content">
      <img
        :src="`https://image.tmdb.org/t/p/w342${tvStore.currentSeries.poster_path}`"
        :alt="tvStore.currentSeries.name"
      />

      <div class="details">
        <h1>{{ tvStore.currentSeries.name }}</h1>
        <p class="tagline" v-if="tvStore.currentSeries.tagline">{{ tvStore.currentSeries.tagline }}</p>
        <p class="overview">{{ tvStore.currentSeries.overview }}</p>
        <p><strong>Avaliação:</strong> {{ tvStore.currentSeries.vote_average?.toFixed(1) }} ⭐</p>
        <p><strong>Data de Estreia:</strong> {{ tvStore.currentSeries.first_air_date }}</p>
        <p v-if="tvStore.currentSeries.number_of_seasons"><strong>Temporadas:</strong> {{ tvStore.currentSeries.number_of_seasons }}</p>
        <p v-if="tvStore.currentSeries.number_of_episodes"><strong>Episódios:</strong> {{ tvStore.currentSeries.number_of_episodes }}</p>
      </div>
    </div>

    <div v-if="tvStore.currentSeries.production_companies?.length">
      <h2>Produtoras</h2>
      <div class="companies">
        <div
          v-for="company in tvStore.currentSeries.production_companies"
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
