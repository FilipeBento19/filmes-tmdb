import { reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/plugins/axios';

export const useTvStore = defineStore('tv', () => {
  const state = reactive({
    currentSeries: {},
  });

  const currentSeries = computed(() => state.currentSeries);

  const getSeriesDetail = async (seriesId) => {
    const response = await api.get(`tv/${seriesId}?language=pt-BR`);
    state.currentSeries = response.data;
  };

  return { currentSeries, getSeriesDetail };
});
