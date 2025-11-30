// src/composables/useOscar.js

import { ref } from 'vue'
import api from '@/plugins/axios'
import { oscarWinners } from '@/data/oscarWinners'

// Definir tipos de categorias
const PERSON_CATEGORIES = ['bestDirector', 'bestActor', 'bestActress', 'bestSupportingActor', 'bestSupportingActress']
const MOVIE_CATEGORIES = ['bestPicture', 'bestAnimatedFeature', 'bestInternationalFilm', 'bestDocumentary']
const TECHNICAL_CATEGORIES = ['bestCinematography', 'bestOriginalScore'] // NOVO: categorias técnicas (filme + pessoa)

const getWinnersByCategory = (category) => {
  return Object.values(oscarWinners)
    .filter(yearData => yearData.categories[category]?.winner)
    .map(yearData => yearData.categories[category].winner);
}

const getWinnersByYear = (year) => {
  return oscarWinners[year];
}

const getAllBestPictureWinners = () => {
  return Object.values(oscarWinners)
    .filter(yearData => yearData.categories.bestPicture?.winner)
    .map(yearData => yearData.categories.bestPicture.winner);
}

const getWinnersByDecade = (startYear, endYear) => {
  return Object.values(oscarWinners)
    .filter(yearData => yearData.year >= startYear && yearData.year <= endYear);
}

const bestPictureTmdbIds = Object.values(oscarWinners).reduce((acc, yearData) => {
  if (yearData.categories.bestPicture?.winner?.tmdbId) {
    acc[yearData.year] = yearData.categories.bestPicture.winner.tmdbId;
  }
  return acc;
}, {});

export function useOscar() {
  const loading = ref(false)
  const error = ref(null)

  // Verificar tipo de categoria
  const isPersonCategory = (category) => {
    return PERSON_CATEGORIES.includes(category)
  }

  const isMovieCategory = (category) => {
    return MOVIE_CATEGORIES.includes(category)
  }

  const isTechnicalCategory = (category) => {
    return TECHNICAL_CATEGORIES.includes(category)
  }

  // Filtro de segurança
  const isValidMovie = (movie) => {
    if (!movie) return false
    if (movie.adult === true) return false
    if (!movie.poster_path) return false
    if (!movie.title && !movie.name) return false
    return true
  }

  // Buscar detalhes de um filme do TMDB
  const fetchMovieDetails = async (tmdbId) => {
    try {
      const response = await api.get(`movie/${tmdbId}?language=pt-BR&append_to_response=credits,videos`)
      
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

  // Buscar detalhes de uma PESSOA do TMDB
  const fetchPersonDetails = async (personId) => {
    try {
      const response = await api.get(`person/${personId}?language=pt-BR&append_to_response=images,movie_credits`)
      return response.data
    } catch (err) {
      console.error('Erro ao buscar pessoa:', personId, err)
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

  // 🆕 Buscar vencedores de um ano - ATUALIZADO para categorias técnicas
  const fetchYearWinners = async (year) => {
    const yearData = getWinnersByYear(year)
    
    if (!yearData) return null

    const movieWinners = []  // Categorias de filme
    const personWinners = [] // Categorias de pessoa
    const technicalWinners = [] // NOVO: categorias técnicas

    for (const [category, data] of Object.entries(yearData.categories)) {
      if (!data.winner) continue

      if (isPersonCategory(category)) {
        // Categoria de PESSOA
        if (data.winner.tmdbId) {
          const personDetails = await fetchPersonDetails(data.winner.tmdbId)
          
          if (personDetails) {
            personWinners.push({
              category,
              categoryName: getCategoryName(category),
              winner: data.winner,
              personDetails,
              movieTitle: data.winner.title
            })
          }
        }
      } else if (isTechnicalCategory(category)) {
        // NOVO: Categoria TÉCNICA (filme + pessoa)
        if (data.winner.tmdbId) {
          const movieDetails = await fetchMovieDetails(data.winner.tmdbId)
          
          if (movieDetails && isValidMovie(movieDetails)) {
            technicalWinners.push({
              category,
              categoryName: getCategoryName(category),
              winner: data.winner,
              movieDetails,
              professionalName: data.winner.cinematographer || data.winner.composer || null
            })
          }
        }
      } else {
        // Categoria de FILME
        if (data.winner.tmdbId) {
          const movieDetails = await fetchMovieDetails(data.winner.tmdbId)
          
          if (movieDetails && isValidMovie(movieDetails)) {
            movieWinners.push({
              category,
              categoryName: getCategoryName(category),
              winner: data.winner,
              movieDetails
            })
          }
        }
      }
    }

    return {
      year: yearData.year,
      ceremony: yearData.ceremony,
      date: yearData.date,
      movieWinners,
      personWinners,
      technicalWinners // NOVO
    }
  }

  // Helper para nome das categorias - ATUALIZADO
  const getCategoryName = (key) => {
    const categoryMap = {
      bestPicture: 'Melhor Filme',
      bestActor: 'Melhor Ator',
      bestActress: 'Melhor Atriz',
      bestDirector: 'Melhor Diretor',
      bestSupportingActor: 'Melhor Ator Coadjuvante',
      bestSupportingActress: 'Melhor Atriz Coadjuvante',
      bestAnimatedFeature: 'Melhor Animação',
      bestInternationalFilm: 'Melhor Filme Internacional',
      bestDocumentary: 'Melhor Documentário',
      bestOriginalScreenplay: 'Melhor Roteiro Original',
      bestAdaptedScreenplay: 'Melhor Roteiro Adaptado',
      bestCinematography: 'Melhor Cinematografia', // NOVO
      bestOriginalScore: 'Melhor Trilha Sonora Original' // NOVO
    }
    return categoryMap[key] || 'Vencedor'
  }

  // Buscar vencedores de uma década
  const fetchDecadeWinners = async (startYear, endYear) => {
    const winners = getWinnersByDecade(startYear, endYear)
    
    const enrichedWinners = []
    
    for (const yearData of winners) {
      const bestPicture = yearData.categories?.bestPicture?.winner
      if (bestPicture?.tmdbId) {
        const details = await fetchMovieDetails(bestPicture.tmdbId)
        
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
    fetchPersonDetails,
    fetchWinnersDetails,
    fetchBestPictureWinners,
    fetchCategoryWinners,
    fetchYearWinners,
    fetchDecadeWinners,
    getWinnersByCategory,
    getWinnersByYear,
    getAllBestPictureWinners,
    getWinnersByDecade,
    getCategoryName,
    isPersonCategory,
    isMovieCategory,
    isTechnicalCategory,
    bestPictureTmdbIds,
    PERSON_CATEGORIES,
    MOVIE_CATEGORIES,
    TECHNICAL_CATEGORIES
  }
}