<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useIdeasStore } from '../stores/ideaStore'
import { useAuthStore } from '../stores/authStore'
import IdeaList from '../components/IdeaList.vue'

const router = useRouter()
const ideaStore = useIdeasStore()
const authStore = useAuthStore()

const goBack = () => {
  router.push('/')
}

// Cargar las ideas del usuario cuando se monta el componente
onMounted(async () => {
  if (authStore.isLoggedIn) {
    await ideaStore.loadMyIdeas() // Cargar TODAS las ideas del usuario
  } else {
    ideaStore.loadIdeasFromLocalStorage()
  }
})

// Manejar borrado individual
const handleDeleteIdea = async (index: number) => {
  const idea = ideaStore.myIdeas[index]
  if (idea && confirm('¿Estás seguro de que quieres eliminar esta idea?')) {
    await ideaStore.deleteIdea(idea.id)
  }
}

// Manejar borrado múltiple
const handleDeleteSelected = async (indices: number[]) => {
  if (confirm(`¿Estás seguro de que quieres eliminar ${indices.length} ideas?`)) {
    // Obtener los IDs de las ideas seleccionadas, filtrando las que existen
    const ideaIds = indices
      .map(index => ideaStore.myIdeas[index])
      .filter(idea => idea !== undefined)
      .map(idea => idea.id)
    
    // Borrar una por una
    for (const ideaId of ideaIds) {
      await ideaStore.deleteIdea(ideaId)
    }
  }
}
</script>

<template>
  <div id="UserIdeas" class="container IdeasList py-5">
    <!-- Encabezado -->
    <div class="d-flex align-items-center gap-3 mb-5">
      <button 
        class="btn btn-sm btn-outline-dark rounded-pill"
        @click="goBack"
      >
        <i class="fas fa-arrow-left"></i> <span class="d-none d-md-block">Atrás</span>
      </button>
      <h2 class="mb-0"> <i class="fa-solid fa-lightbulb"></i> Mis Ideas ({{ ideaStore.myIdeas.length }})</h2>
    </div>
    
    <div class="userlist ">
      <!-- Loading -->
      <div v-if="ideaStore.loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando ideas...</span>
        </div>
      </div>
      
      <!-- Lista usando el componente IdeaList -->
      <div v-else-if="ideaStore.myIdeas.length > 0" class="mb-4">
        <IdeaList 
          :ideas="ideaStore.myIdeas"
          :max-display="10"
          :show-pagination="true"
          :show-delete="true"
          :show-bulk-delete="true"
          @delete-idea="handleDeleteIdea"
          @delete-selected="handleDeleteSelected"
        />
        
        <!-- Botón para eliminar todas -->
        <div class="text-center mt-4">
          <button 
            class="btn btn-outline-danger"
            @click="ideaStore.clearIdeas()"
          >
            <div class="fas fa-trash"></div> Eliminar todas las ideas
          </button>
        </div>
      </div>
      
      <!-- Sin ideas -->
      <div v-else class="text-center py-5">
        <h4>No tienes ideas guardadas</h4>
        <p class="text-muted mb-4">¡ve al inicio y genera tu primera idea!</p>
        <button 
          class="btn btn-primary btn-lg"
          @click="goBack"
        >
          ✨ Generar Ideas
        </button>
      </div>
    </div>
  </div>
</template>


<style>

</style>