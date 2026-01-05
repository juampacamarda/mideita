<script setup lang="ts">
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <Header />
    <main id="IdeaWrapper" class="flex-grow-1">
      <RouterView />
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

#IdeaWrapper {
  flex: 1;
  min-height:calc(100dvh - 230px);
}
</style>
