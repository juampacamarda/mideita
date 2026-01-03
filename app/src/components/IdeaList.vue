<script setup lang="ts">
import { ref, computed } from 'vue'
import type { StoredIdea } from '../stores/ideaStore'

interface Props {
  ideas: StoredIdea[]  // ← Cambiar de string[] a StoredIdea[]
  maxDisplay?: number        // Cuántas ideas mostrar por página
  showDelete?: boolean       // Mostrar botón de borrar individual
  showBulkDelete?: boolean   // Mostrar checkbox para selección múltiple
  showPagination?: boolean   // Mostrar paginación
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplay: 7,
  showDelete: false,
  showBulkDelete: false,
  showPagination: false
})

const emit = defineEmits<{
  deleteIdea: [index: number]
  deleteSelected: [indices: number[]]
}>()

const currentPage = ref(1)
const selectedIdeas = ref<Set<number>>(new Set())

const totalPages = computed(() => 
  Math.ceil(props.ideas.length / props.maxDisplay)
)

const paginatedIdeas = computed(() => {
  const start = (currentPage.value - 1) * props.maxDisplay
  const end = start + props.maxDisplay
  return props.ideas.slice(start, end)
})

const toggleSelection = (index: number) => {
  if (selectedIdeas.value.has(index)) {
    selectedIdeas.value.delete(index)
  } else {
    selectedIdeas.value.add(index)
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
        class="btn btn-sm btn-danger rounded-pill"
        @click="deleteSelected"
      >
        🗑️ Borrar seleccionadas ({{ selectedIdeas.size }})
      </button>
    </div>

    <!-- Lista de ideas -->
    <div class="list-group">
      <div 
        v-for="(idea, index) in paginatedIdeas" 
        :key="index" 
        class="list-group-item border-0 border-bottom py-3"
      >
        <div class="d-flex align-items-center gap-3">
          <!-- Checkbox de selección -->
          <input 
            v-if="showBulkDelete"
            type="checkbox"
            :checked="selectedIdeas.has(index)"
            @change="toggleSelection(index)"
            class="form-check-input"
          />

          <!-- Ícono de check -->
          <div 
            class="rounded-pill text-white d-flex align-items-center justify-content-center flex-shrink-0" 
            style="background-color: #FF9500; width: 40px; height: 40px;"
          >
            ✓
          </div>

          <!-- Texto de la idea -->
          <span class="flex-grow-1">{{ idea.idea }}</span>

          <!-- Botón de borrar individual -->
          <button 
            v-if="showDelete"
            class="btn btn-sm btn-outline-danger"
            @click="emit('deleteIdea', index)"
            title="Borrar esta idea"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="showPagination && totalPages > 1" class="d-flex justify-content-center gap-2 mt-3">
      <button 
        class="btn btn-sm btn-outline-secondary"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        ← Anterior
      </button>
      <span class="align-self-center">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        class="btn btn-sm btn-outline-secondary"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        Siguiente →
      </button>
    </div>
  </div>
</template>

<style scoped>
.flex-grow-1 {
  flex: 1;
}
</style>