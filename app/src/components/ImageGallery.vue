<script setup lang="ts">
import { ref, computed } from 'vue'
import type { StoredIdea } from '../stores/ideaStore'

interface Props {
  ideas: StoredIdea[]
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 12
})

const selectedIdea = ref<StoredIdea | null>(null)
const showModal = ref(false)
const currentPage = ref(1)

// Filtrar solo ideas con imagen
const ideasWithImages = computed(() => {
  return props.ideas.filter(idea => idea.imageUrl)
})

// Paginar
const totalPages = computed(() => {
  return Math.ceil(ideasWithImages.value.length / props.itemsPerPage)
})

const paginatedIdeas = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return ideasWithImages.value.slice(start, end)
})

const openIdeaModal = (idea: StoredIdea) => {
  selectedIdea.value = idea
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedIdea.value = null
}

const goToPage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (date: any) => {
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('es-AR')
}

const formatDateTime = (date: any) => {
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleString('es-AR')
}
</script>

<template>
  <!-- Galería de imágenes -->
  <div v-if="ideasWithImages.length > 0">
    <div class="row g-4 mb-5">
      <div 
        v-for="idea in paginatedIdeas" 
        :key="idea.id"
        class="col-md-6 col-lg-4"
      >
        <div class="card gallery-card h-100 cursor-pointer" @click="openIdeaModal(idea)">
          <img 
            :src="idea.imageUrl" 
            :alt="idea.idea"
            class="card-img-top gallery-image"
          />
          <div class="card-body">
            <p class="card-text text-truncate idea-preview">{{ idea.idea }}</p>
            <small class="text-muted idea-date">
              {{ formatDate(idea.createdAt) }}
            </small>
            <small class="text-muted idea-author">
              &nbsp;|&nbsp; {{ idea.authorName || idea.userEmail || 'Anónimo' }}
            </small>

          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="d-flex justify-content-center gap-2 mb-4">
      <button 
        v-for="page in totalPages"
        :key="page"
        class="btn"
        :class="{ 'btn-primary': currentPage === page, 'btn-outline-primary': currentPage !== page }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
    </div>
  </div>

  <!-- Mensaje cuando no hay imágenes -->
  <div v-else class="text-center py-5">
    <p class="text-muted fs-5">No hay imágenes disponibles</p>
  </div>

  <!-- Modal para ver la idea completa -->
  <div v-if="showModal && selectedIdea" class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ selectedIdea.idea }}</h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="closeModal"
          ></button>
        </div>
        <div class="modal-body">
          <img 
            :src="selectedIdea.imageUrl" 
            :alt="selectedIdea.idea"
            class="img-fluid w-100 rounded mb-3"
          />
          <div class="alert alert-info">
            <strong>Idea:</strong> {{ selectedIdea.idea }}
          </div>
          <p class="text-muted">
            <small>Subida: {{ formatDateTime(selectedIdea.createdAt) }}</small>
            <br />
            <small>Por: {{ selectedIdea.authorName || selectedIdea.userEmail || 'Anónimo' }}</small>
          </p>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary"
            @click="closeModal"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e0e0e0;
}

.gallery-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gallery-image {
  height: 250px;
  object-fit: cover;
}

.idea-preview {
  color: #333;
  font-weight: 500;
}

.cursor-pointer {
  cursor: pointer;
}

.modal {
  display: block;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.modal-dialog-centered {
  display: flex;
  align-items: center;
  min-height: 100%;
}

.btn-primary {
  background-color: #FF9500;
  border-color: #FF9500;
}

.btn-primary:hover {
  background-color: #e68a00;
  border-color: #e68a00;
}

.btn-outline-primary {
  color: #FF9500;
  border-color: #FF9500;
}

.btn-outline-primary:hover {
  background-color: #FF9500;
  color: white;
}
</style>