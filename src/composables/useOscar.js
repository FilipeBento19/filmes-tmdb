// src/composables/useOscar.js

import { ref } from 'vue'
import api from '@/plugins/axios'
import { 
  oscarWinners, 
  getWinnersByCategory,
  getWinnersByYear,
  getAllBestPictureWinners,
  getWinnersByDecade,
  bestPictureTmdbIds
} from '@/data/oscarWinners'

export function useOscar() {
  const loading = ref(false)
  const error = ref(null)

  // Filtro de segurança para evitar conteúdo adulto
  const isValidMovie = (movie) => {
    if (!movie) return false
    
    // Verificar se é conteúdo adulto
    if (movie.adult === true) return false
    
    // Verificar se tem gêneros inadequados
    const adultGenreIds = [10749] // Romance pode ter conteúdo inadequado às vezes
    const hasAdultGenre = movie.genre_ids?.some(id => adultGenreIds.includes(id))
    
    // Verificar se tem poster (filmes sem poster podem ser suspeitos)
    if (!movie.poster_path) return false
    
    // Verificar se tem título
    if (!movie.title && !movie.name) return false
    
    return true
  }

  // Buscar detalhes de um vencedor do TMDB
  const fetchMovieDetails = async (tmdbId) => {
    try {
      const response = await api.get(`movie/${tmdbId}?language=pt-BR&append_to_response=credits,videos`)
      
      // FILTRO DE SEGURANÇA
      if (response.data.adult === true) {
        console.warn(`Filme ${tmdbId} bloqueado: conteúdo adulto`)
        return null
      }
      
      return response.data
    } catch (err) {
      console.error('Erro ao buscar filme:', tmdbId, err)
      return null
    }
  }

  // Buscar múltiplos filmes vencedores
  const fetchWinnersDetails = async (tmdbIds) => {
    loading.value = true
    error.value = null

    try {
      const promises = tmdbIds.map(id => fetchMovieDetails(id))
      const results = await Promise.all(promises)
      
      // Filtrar resultados nulos e conteúdo adulto
      return results.filter(movie => movie !== null && isValidMovie(movie))
    } catch (err) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Buscar vencedores de Melhor Filme com detalhes
  const fetchBestPictureWinners = async () => {
    const winners = getAllBestPictureWinners()
    const tmdbIds = winners.map(w => w.tmdbId).filter(Boolean)
    const details = await fetchWinnersDetails(tmdbIds)
    
    // Combinar dados do Oscar com dados do TMDB
    return details.map((movie) => {
      const oscarData = winners.find(w => w.tmdbId === movie.id)
      return {
        ...movie,
        oscarData
      }
    }).filter(Boolean)
  }

  // Buscar vencedores de uma categoria específica
  const fetchCategoryWinners = async (category) => {
    const winners = getWinnersByCategory(category)
    const tmdbIds = winners.map(w => w.tmdbId).filter(Boolean)
    const details = await fetchWinnersDetails(tmdbIds)
    
    return details.map((movie) => {
      const oscarData = winners.find(w => w.tmdbId === movie.id)
      return {
        ...movie,
        oscarData
      }
    }).filter(Boolean)
  }

  // Buscar vencedores de um ano específico
  const fetchYearWinners = async (year) => {
    const yearData = getWinnersByYear(year)
    
    if (!yearData) return null

    const enrichedCategories = {}

    // Processar cada categoria
    for (const [category, data] of Object.entries(yearData.categories)) {
      if (data.winner?.tmdbId) {
        const movieDetails = await fetchMovieDetails(data.winner.tmdbId)
        
        // Só adicionar se for válido
        if (movieDetails && isValidMovie(movieDetails)) {
          enrichedCategories[category] = {
            ...data,
            movieDetails
          }
        }
      }
    }

    return {
      ...yearData,
      categories: enrichedCategories
    }
  }

  // Buscar vencedores de uma década
  const fetchDecadeWinners = async (startYear, endYear) => {
    const winners = getWinnersByDecade(startYear, endYear)
    
    const enrichedWinners = []
    
    for (const yearData of winners) {
      const bestPicture = yearData.categories?.bestPicture?.winner
      if (bestPicture?.tmdbId) {
        const details = await fetchMovieDetails(bestPicture.tmdbId)
        
        // Só adicionar se for válido
        if (details && isValidMovie(details)) {
          enrichedWinners.push({
            ...yearData,
            bestPictureDetails: details
          })
        }
      }
    }

    return enrichedWinners
  }

  return {
    loading,
    error,
    oscarWinners,
    fetchMovieDetails,
    fetchWinnersDetails,
    fetchBestPictureWinners,
    fetchCategoryWinners,
    fetchYearWinners,
    fetchDecadeWinners,
    getWinnersByCategory,
    getWinnersByYear,
    getAllBestPictureWinners,
    getWinnersByDecade,
    bestPictureTmdbIds
  }
}