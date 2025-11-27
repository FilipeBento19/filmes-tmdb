// src/composables/useOscar.js

import { ref } from 'vue'
import api from '@/plugins/axios'
import { oscarWinners } from '@/data/oscarWinners'

// Definir quais categorias são de PESSOA vs FILME
const PERSON_CATEGORIES = ['bestDirector', 'bestActor', 'bestActress', 'bestSupportingActor', 'bestSupportingActress']
const MOVIE_CATEGORIES = ['bestPicture', 'bestAnimatedFeature', 'bestInternationalFilm', 'bestDocumentary']

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

  // Verificar se categoria é de pessoa
  const isPersonCategory = (category) => {
    return PERSON_CATEGORIES.includes(category)
  }

  // Verificar se categoria é de filme
  const isMovieCategory = (category) => {
    return MOVIE_CATEGORIES.includes(category)
  }

  // Filtro de segurança para evitar conteúdo adulto
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

  // 🆕 Buscar detalhes de uma PESSOA do TMDB
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

  // 🆕 Buscar vencedores de um ano - ATUALIZADO para separar filmes e pessoas
  const fetchYearWinners = async (year) => {
    const yearData = getWinnersByYear(year)
    
    if (!yearData) return null

    const movieWinners = []  // Categorias de filme
    const personWinners = [] // Categorias de pessoa

    // Processar cada categoria
    for (const [category, data] of Object.entries(yearData.categories)) {
      if (!data.winner) continue

      if (isPersonCategory(category)) {
        // É categoria de PESSOA - buscar detalhes da pessoa
        if (data.winner.tmdbId) {
          const personDetails = await fetchPersonDetails(data.winner.tmdbId)
          
          // Também buscar detalhes do filme relacionado
          let movieDetails = null
          // Tentar encontrar o filme pelo título na filmografia da pessoa
          // ou buscar pelo ID se disponível
          
          if (personDetails) {
            personWinners.push({
              category,
              categoryName: getCategoryName(category),
              winner: data.winner,
              personDetails,
              movieTitle: data.winner.title // Filme pelo qual ganhou
            })
          }
        } else {
          // Sem tmdbId, criar dados básicos
          personWinners.push({
            category,
            categoryName: getCategoryName(category),
            winner: data.winner,
            personDetails: null,
            movieTitle: data.winner.title
          })
        }
      } else {
        // É categoria de FILME
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
      personWinners
    }
  }

  // Helper para nome das categorias
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
      bestAdaptedScreenplay: 'Melhor Roteiro Adaptado'
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
    bestPictureTmdbIds,
    PERSON_CATEGORIES,
    MOVIE_CATEGORIES
  }
}