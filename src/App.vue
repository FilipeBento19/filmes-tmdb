<script setup>
import OscarHeader from './components/HeaderComponent.vue'
</script>

<template>
  <div id="app" class="oscar-theme">
    <OscarHeader />
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
@import './assets/theme/oscar.css';

#app {
  min-height: 100vh;
}

main {
  padding-top: 80px;
  min-height: 100vh;
}
</style>