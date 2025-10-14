import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3/',
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MzI0OWI1ZWRiYWM2MzE5MDYwZGJiNmJiYjM4ZDQ1OSIsIm5iZiI6MTc2MDQ0MDE0MS4zNTgsInN1YiI6IjY4ZWUyZjRkODcyNTNiZjczNTBkODMwOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nzoCIBohLXU5E_N5LsMOlRB9L6TZ6SMY0vM7cwMGJxs`,
  },
});

export default api;