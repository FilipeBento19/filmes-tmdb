import { reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/plugins/axios';

export const useGenreStore = defineStore('genre', () => {
  const state = reactive({
    genres: [],
    currentGenreId: null,
  });

  const genres = computed(() => state.genres);
  const currentGenreId = computed(() => state.currentGenreId);

  const getGenreName = (id) =>
    state.genres.find((genre) => genre.id === id)?.name || 'Desconhecido';

  const getAllGenres = async (type) => {
    const response = await api.get(`genre/${type}/list?language=pt-BR`);
    state.genres = response.data.genres;
  };

  const setCurrentGenreId = (genreId) => {
    state.currentGenreId = genreId;
  };

  return { 
    genres, 
    getAllGenres, 
    getGenreName, 
    currentGenreId, 
    setCurrentGenreId 
  };
});