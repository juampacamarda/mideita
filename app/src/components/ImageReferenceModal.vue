<script setup lang="ts">
import { ref, watch } from 'vue'
import { getImageReferences, type UnsplashImage } from '../services/imageService'

interface Props {
  show: boolean
  title: string
  query: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const images = ref<UnsplashImage[]>([])
const loading = ref(false)

const loadImages = async () => {
  if (images.value.length > 0 || !props.query) return
  
  loading.value = true
  images.value = await getImageReferences(props.query)
  loading.value = false
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    images.value = [] // Limpiar para recargar
    loadImages()
  }
})
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h5>{{ title }}</h5>
        <button class="btn-close" @click="emit('close')">✕</button>
      </div>
      
      <div class="modal-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border" role="status" style="color: #FF9500;">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        
        <div v-else-if="images.length > 0" class="image-grid">
          <div v-for="image in images" :key="image.id" class="image-item">
            <a :href="image.urls.regular" target="_blank" rel="noopener noreferrer">
              <img 
                :src="image.urls.small" 
                :alt="image.alt_description"
                class="img-fluid rounded"
              />
            </a>
            <small class="text-muted mt-2 d-block">
              📷 {{ image.user.name }}
            </small>
          </div>
        </div>
        
        <div v-else class="text-center text-muted py-5">
          No se encontraron imágenes
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
  position: sticky;
  top: 0;
}

.modal-header h5 {
  margin: 0;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #000;
}

.modal-body {
  padding: 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
}

.image-item {
  text-align: center;
}

.image-item img {
  cursor: pointer;
  transition: transform 0.2s;
  max-height: 140px;
  object-fit: cover;
  width: 100%;
}

.image-item img:hover {
  transform: scale(1.05);
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>