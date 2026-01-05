<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useIdeasStore } from '../stores/ideaStore'
import ImageGallery from '../components/ImageGallery.vue'

const router = useRouter()
const ideaStore = useIdeasStore()

onMounted(async () => {
  await ideaStore.loadCommunityIdeas()
})

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <!-- Encabezado -->
        <div class="d-flex align-items-center gap-3 mb-5">
          <button 
            class="btn btn-sm btn-outline-dark rounded-pill"
            @click="goBack"
          >
            <i class="fas fa-arrow-left"></i> 
            <span class="d-none d-md-block">Atrás</span>
          </button>
          <h2 class="mb-0"><i class="fas fa-images"></i> Ideas de la comunidad</h2>
        </div>

        <!-- Componente de galería reutilizable -->
        <ImageGallery :ideas="ideaStore.communityIdeas" :items-per-page="12" />
      </div>
    </div>
  </div>
</template>

<style>
.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.gap-3 {
  gap: 1rem;
}

.mb-5 {
  margin-bottom: 3rem;
}
</style>