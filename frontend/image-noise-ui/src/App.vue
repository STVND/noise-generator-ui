<script setup lang="ts">

</script>

<template>
  <nav>
    <ul>
      <li>
        <RouterLink to="/">Home</RouterLink>
      </li>
      <li>
        <RouterLink to="/noise-generator">Noise Generator</RouterLink>
      </li>
      <li>
        <RouterLink to="/pigment-mixer">Pigment Mixer</RouterLink>
      </li>
    </ul>
  </nav>

  <main class="main">
    <RouterView />
  </main>
  
</template>

<style scoped>
.main {
  display: table;
  width: auto;
  margin: auto;
  padding: 10px;
}

nav {
  width: 100%;
  padding-block: 10px;
}

nav ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

nav ul li a {
  display: block;
  padding: 10px 15px;
  min-width: 15ch;
  text-align: center;
  font-size: larger;
  color: #e0e0e0;
  background-color: #191919;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

nav ul li a:hover {
  background-color: #333333; 
}

nav ul li a.router-link-exact-active {
  font-weight: bold;
  color: #deeeed;
  text-decoration: underline;
  background-color: #444444;
}
</style>
