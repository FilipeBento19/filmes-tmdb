<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header :class="{ scrolled: isScrolled }" class="oscar-header">
    <div class="container">
      <div class="logo">
        <svg class="oscar-statue" width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L9 8H15L12 2Z" fill="url(#gold-gradient)"/>
          <circle cx="12" cy="10" r="2" fill="url(#gold-gradient)"/>
          <path d="M12 12L10 18H14L12 12Z" fill="url(#gold-gradient)"/>
          <rect x="8" y="18" width="8" height="2" fill="url(#gold-gradient)"/>
          <rect x="7" y="20" width="10" height="2" fill="url(#gold-gradient)"/>
          <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FFD700"/>
              <stop offset="100%" style="stop-color:#B8941F"/>
            </linearGradient>
          </defs>
        </svg>
        <div class="logo-text">
          <h1 class="branco">OSCARIZADOS</h1>
          <span class="subtitle">O Cinema dos Vencedores</span>
        </div>
      </div>
      
      <nav>
        <router-link to="/" class="nav-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          Início
        </router-link>
        <router-link to="/winners" class="nav-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="8" r="7"/>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
          </svg>
          Vencedores
        </router-link>
        <router-link to="/categories" class="nav-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
          </svg>
          Categorias
        </router-link>
        <router-link to="/timeline" class="nav-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Linha do Tempo
        </router-link>
      </nav>

      <div class="user-section">
        <button class="search-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.oscar-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(180deg, rgba(10, 10, 10, 0.98) 0%, rgba(10, 10, 10, 0.95) 100%);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.oscar-header.scrolled {
  background: rgba(10, 10, 10, 0.98);
  box-shadow: 0 4px 30px rgba(212, 175, 55, 0.15);
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.container {
  max-width: 1920px;
  margin: 0 auto;
  padding: 1rem 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.oscar-statue {
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

.logo-text h1 {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  background: var(--oscar-gradient);
  background-clip: text;
  margin: 0;
  line-height: 1;
}

.subtitle {
  font-size: 0.65rem;
  color: var(--oscar-text-secondary);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  padding-left:5px;
}

nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.branco {
    color: white;
}

.nav-link {
  color: var(--oscar-text-secondary);
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Montserrat', sans-serif;
}

.nav-link:hover {
  color: var(--oscar-gold);
  background: rgba(212, 175, 55, 0.1);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 70%;
  height: 2px;
  background: var(--oscar-gradient);
  transition: transform 0.3s ease;
}

.nav-link.router-link-active {
  color: var(--oscar-gold);
}

.nav-link.router-link-active::after {
  transform: translateX(-50%) scaleX(1);
}

.user-section {
  display: flex;
  align-items: center;
}

.search-btn {
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: var(--oscar-gold);
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--oscar-gold);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .container {
    padding: 1rem 1.5rem;
  }

  .logo-text h1 {
    font-size: 1.2rem;
  }

  .subtitle {
    font-size: 0.5rem;
  }

  nav {
    gap: 0.2rem;
  }

  .nav-link {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
  }

  .nav-link span {
    display: none;
  }
}
</style>