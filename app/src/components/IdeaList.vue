<script setup lang="ts">
import { ref, computed } from 'vue'
import type { StoredIdea } from '../stores/ideaStore'

interface Props {
  ideas: StoredIdea[]
  maxDisplay?: number
  showDelete?: boolean
  showBulkDelete?: boolean
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplay: 7,
  showDelete: false,
  showBulkDelete: false,
  showPagination: false
})

const emit = defineEmits<{
  deleteIdea: [ideaId: string]
  deleteSelected: [ideaIds: string[]]
}>()

const currentPage = ref(1)
const selectedIdeas = ref<Set<string>>(new Set())

const totalPages = computed(() => 
  Math.ceil(props.ideas.length / props.maxDisplay)
)

const paginatedIdeas = computed(() => {
  const start = (currentPage.value - 1) * props.maxDisplay
  const end = start + props.maxDisplay
  return props.ideas.slice(start, end)
})

const toggleSelection = (ideaId: string) => {
  if (selectedIdeas.value.has(ideaId)) {
    selectedIdeas.value.delete(ideaId)
  } else {
    selectedIdeas.value.add(ideaId)
  }
}

const deleteSelected = () => {
  if (selectedIdeas.value.size === 0) {
    alert('Selecciona al menos una idea')
    return
  }
  emit('deleteSelected', Array.from(selectedIdeas.value))
  selectedIdeas.value.clear()
}
</script>

<template>
  <div class="idea-list">
    <!-- Botón de borrado múltiple -->
    <div v-if="showBulkDelete && selectedIdeas.size > 0" class="mb-3">
      <button 
        class="btn btn-danger"
        @click="deleteSelected"
      >
        <i class="fas fa-trash"></i> Borrar seleccionadas ({{ selectedIdeas.size }})
      </button>
    </div>

    <!-- Lista de ideas -->
    <div class="list-group">
      <div 
        v-for="idea in paginatedIdeas" 
        :key="idea.id"
        class="list-group-item border-0 border-bottom py-3"
      >
        <div class="d-flex align-items-center gap-3">
          <!-- Checkbox de selección -->
          <input 
            v-if="showBulkDelete"
            type="checkbox"
            :checked="selectedIdeas.has(idea.id)"
            @change="toggleSelection(idea.id)"
            class="form-check-input"
          />

          <!-- Ícono de check -->
          <div 
            class="rounded-pill text-white d-flex align-items-center justify-content-center flex-shrink-0" 
            style="background-color: #FF9500; width: 40px; height: 40px;"
          >
            <i class="fas fa-check"></i>
          </div>

          <!-- Texto de la idea -->
          <div class="flex-grow-1 d-flex align-items-center gap-2">
            <span 
              v-if="showBulkDelete && idea.imageUrl" 
              class="text-primary" 
              title="Esta idea tiene imagen asociada"
            >
              <i class="fas fa-image"></i>
            </span>
            <span>{{ idea.idea }}</span>
          </div>

          <!-- Botón de borrar individual -->
          <button 
            v-if="showDelete"
            class="btn btn-sm btn-outline-danger"
            @click="emit('deleteIdea', idea.id)"
            title="Borrar esta idea"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="showPagination && totalPages > 1" class="d-flex justify-content-center gap-2 mt-3">
      <button 
        class="btn btn-outline-secondary"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        <i class="fas fa-arrow-left"></i> Anterior
      </button>
      <span class="align-self-center">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        class="btn btn-outline-secondary"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        Siguiente <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.flex-grow-1 {
  flex: 1;
}
</style>