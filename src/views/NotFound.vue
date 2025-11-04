<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <div class="content">
      <div class="oscar-icon">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="url(#gold-stroke)" stroke-width="2">
          <path d="M12 2L9 8H15L12 2Z"/>
          <circle cx="12" cy="10" r="2"/>
          <path d="M12 12L10 18H14L12 12Z"/>
          <rect x="8" y="18" width="8" height="2"/>
          <rect x="7" y="20" width="10" height="2"/>
          <defs>
            <linearGradient id="gold-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FFD700"/>
              <stop offset="100%" style="stop-color:#B8941F"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h1>404</h1>
      <h2>Página Não Encontrada</h2>
      <p>Parece que este filme não está em nosso catálogo de vencedores.</p>

      <button @click="goHome" class="home-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
        Voltar ao Início
      </button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--oscar-dark-bg);
  color: var(--oscar-text);
  text-align: center;
  padding: 2rem;
}

.content {
  max-width: 600px;
}

.oscar-icon {
  margin-bottom: 2rem;
  filter: drop-shadow(0 0 40px rgba(255, 215, 0, 0.4));
  opacity: 0.5;
}

h1 {
  font-size: 8rem;
  font-weight: 900;
  background: var(--oscar-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  line-height: 1;
}

h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #fff;
}

p {
  font-size: 1.1rem;
  color: var(--oscar-text-secondary);
  margin-bottom: 3rem;
  font-family: 'Montserrat', sans-serif;
}

.home-btn {
  background: var(--oscar-gradient);
  color: var(--oscar-black);
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Montserrat', sans-serif;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
}

.home-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.5);
}
</style>