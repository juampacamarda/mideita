<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  show: boolean
  idea: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  upload: [file: File]
}>()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const preview = ref<string>('')
const loading = ref(false)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // Validar tipo y tamaño
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona una imagen')
    return
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    alert('La imagen no puede pesar más de 5MB')
    return
  }
  
  selectedFile.value = file
  
  // Crear preview
  const reader = new FileReader()
  reader.onload = (e) => {
    preview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    alert('Selecciona una imagen')
    return
  }
  
  loading.value = true
  try {
    emit('upload', selectedFile.value)
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  selectedFile.value = null
  preview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('close')
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h5>📤 Subir imagen de la idea</h5>
        <button class="btn-close" @click="handleClose">✕</button>
      </div>
      
      <div class="modal-body">
        <!-- Mostrar idea -->
        <div class="mb-4">
          <label class="form-label fw-bold">Tu idea:</label>
          <p class="text-muted">{{ idea }}</p>
        </div>

        <!-- Área de carga -->
        <div class="upload-area">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            class="d-none"
          />
          
          <!-- Si no hay preview -->
          <div v-if="!preview" class="upload-placeholder" @click="fileInput?.click()">
            <p>📸 Haz click o arrastra una imagen aquí</p>
            <small class="text-muted">Máximo 5MB - JPG, PNG, WebP</small>
          </div>
          
          <!-- Si hay preview -->
          <div v-else class="preview-container">
            <img :src="preview" :alt="idea" class="preview-image" />
            <button 
              type="button"
              class="btn btn-sm btn-secondary mt-2"
              @click="fileInput?.click()"
            >
              Cambiar imagen
            </button>
          </div>
        </div>

        <!-- Botones -->
        <div class="d-flex gap-2 mt-4 justify-content-end">
          <button 
            class="btn btn-secondary rounded-pill"
            @click="handleClose"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button 
            class="btn btn-primary rounded-pill text-white"
            style="background-color: #FF9500; border: none;"
            @click="handleUpload"
            :disabled="!selectedFile || loading"
          >
            {{ loading ? '⏳ Subiendo...' : '✅ Subir imagen' }}
          </button>
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
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
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
}

.btn-close:hover {
  color: #000;
}

.modal-body {
  padding: 20px;
}

.upload-area {
  border: 2px dashed #FF9500;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: #fff9f0;
}

.upload-placeholder {
  cursor: pointer;
  padding: 40px 20px;
}

.upload-placeholder p {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
}

.upload-placeholder small {
  display: block;
}

.preview-container {
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: cover;
}

.d-none {
  display: none;
}

.form-label {
  margin-bottom: 8px;
  display: block;
}

.fw-bold {
  font-weight: 600;
}

.text-muted {
  color: #6c757d;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #ccc;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #bbb;
}

.btn-primary {
  background-color: #FF9500;
  color: white;
}

.text-white {
  color: white;
}

.rounded-pill {
  border-radius: 50px;
}

.gap-2 {
  gap: 8px;
}

.mt-2 {
  margin-top: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.justify-content-end {
  justify-content: flex-end;
}

.d-flex {
  display: flex;
}
</style>