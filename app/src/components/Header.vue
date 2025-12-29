<script setup lang="ts">
import { ref } from 'vue'

const currentPage = ref('Home')
</script>

<template>
  <header>
    <nav class="ideaNav navbar">
      <a href="#" @click.prevent="currentPage = 'home'"  class="navbar-brand ideaLogo">
        <span>
          Mideita
        </span>
      </a>
      <ul class="nav">
        <li class="nav-item" :class="{ active: currentPage === 'Home' }">
          <a href="#" class="nav-link" @click.prevent="currentPage = 'Home'">Home</a>
        </li>
        <li class="nav-item" :class="{ active: currentPage === 'About' }">
          <a href="#" class="nav-link" @click.prevent="currentPage = 'About'">Qué es Mideita</a>
        </li>
        <li class="nav-item" :class="{ active: currentPage === 'Login' }">
          <a href="#" class="nav-link" @click.prevent="currentPage = 'Login'">Login</a>
        </li>
        <li class="nav-item" :class="{ active: currentPage === 'Perfil' }">
          <a href="#" class="nav-link" @click.prevent="currentPage = 'Perfil'">Mis Ideas</a>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.navbar-brand {
  font-weight: bold;
}
</style>