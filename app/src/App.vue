<script setup lang="ts">
import Header from './components/Header.vue'
import IdeaGenerator from './components/IdeaGenerator.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <Header />
    <main class="flex-grow-1">
    <IdeaGenerator />
    </main>
    <Footer />
  </div>
</template>

<style>
body {
  background-color: #f9f9f9;
}

.min-vh-100 {
  min-height: 100vh;
}

.flex-grow-1 {
  flex: 1;
}
</style>
