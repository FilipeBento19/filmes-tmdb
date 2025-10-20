<script setup>
</script>

<template>
  <header>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/filmes">Filmes</router-link>
      <router-link to="/tv">Programas de TV</router-link>
    </nav>
  </header>
  <main>
    <router-view />
  </main>
</template>

<style scoped>
header {
  height: 3rem;
  display: flex;
  background-color: black;
  color: #fff;
  font-size: 1.2rem;
  justify-content: center;
}

nav {
  column-gap: 2rem;
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

nav a {
  text-decoration: none;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}

nav a:hover {
  background-color: #333;
  height: 30px;
  padding-top: 0.5px;
}

nav a.router-link-active {
  background-color: #ff2600;
  height: 30px;
  padding-top: 2px;
}


main {
  padding: 2rem;
}
</style>