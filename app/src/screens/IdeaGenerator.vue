<script setup lang="ts">
import { ref } from 'vue'
import { useIdeasStore } from '../stores/ideaStore'
import { useAuthStore } from '../stores/authStore'
import IdeaList from '../components/IdeaList.vue'
import ImageReferenceModal from '../components/ImageReferenceModal.vue'
import IdeaUploadModal from '../components/IdeaUploadModal.vue'

const ideaStore = useIdeasStore()
const authStore = useAuthStore()

// Modal de referencias
const showModal = ref(false)
const modalQuery = ref('')
const modalTitle = ref('')

const regenerateIdea = () => {
  ideaStore.generateIdea(true)
}

const handleSaveIdea = async () => {
  await ideaStore.saveIdea()
}






const goBack = () => {
  if (ideaStore.appState === 'thankYou') {
    ideaStore.appState = 'generated'
  } else if (ideaStore.appState === 'myIdeas') {
    ideaStore.appState = 'thankYou'
  }
}

// Función para abrir modal de referencias
const openReferenceModal = (type: 'animal' | 'caracterizacion' | 'accion') => {
  const idea = ideaStore.currentIdea || ideaStore.lastSavedIdea
  if (!idea) return
  
  const parts = idea.split(' ')

  if (type === 'animal') {
    const animal = parts[1] || 'animal'
    modalTitle.value = `Imágenes de: ${animal}`
    modalQuery.value = animal
  } else if (type === 'caracterizacion') {
    const deIndex = parts.indexOf('de')
    let caracterizacion = ''
    for (let i = deIndex + 1; i < parts.length; i++) {
      const part = parts[i]
      if (part && !/ando|iendo$/.test(part) && part !== '.') {
        caracterizacion += (caracterizacion ? ' ' : '') + part
      } else {
        break
      }
    }
    if (!caracterizacion) caracterizacion = 'caracterización'
    modalTitle.value = `Imágenes de: ${caracterizacion}`
    modalQuery.value = caracterizacion
  } else if (type === 'accion') {
    const accionStart = parts.findIndex(p => p && /ando|iendo$/.test(p))
    // No usar -1 en slice, tomar toda la acción y quitar el punto
    const accion = accionStart >= 0 ? parts.slice(accionStart).join(' ').replace('.', '') : 'acción'
    modalTitle.value = `Imágenes de: ${accion}`
    modalQuery.value = accion
  }

  showModal.value = true
}

// Funciones auxiliares para extraer partes de la idea
const extractCaracterizacion = (idea: string) => {
  if (!idea) return ''
  const parts = idea.split(' ')
  const deIndex = parts.indexOf('de')
  if (deIndex === -1) return ''
  
  let result = ''
  for (let i = deIndex + 1; i < parts.length; i++) {
    const part = parts[i]
    if (part && !/ando|iendo$/.test(part) && part !== '.') {
      result += (result ? ' ' : '') + part
    } else {
      break
    }
  }
  return result
}

const extractAccion = (idea: string) => {
  if (!idea) return ''
  const parts = idea.split(' ')
  const accionStart = parts.findIndex(p => p && /ando|iendo$/.test(p))
  if (accionStart === -1) return ''
  // No quitar el último elemento (-1), solo eliminar el punto
  return parts.slice(accionStart).join(' ').replace('.', '')
}

const showUploadModal = ref(false)
const uploadSuccess = ref(false)

const handleUploadIdea = async (file: File) => {
  const success = await ideaStore.uploadIdeaWithImage(file)
  if (success) {
    showUploadModal.value = false
    uploadSuccess.value = true
  }
}

const resetUploadSuccess = () => {
  uploadSuccess.value = false
}
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8">

        <!-- PASO 01: Estado inicial - Solo botón generar (o deshabilitado si esperando 24h) -->
        <div v-if="ideaStore.appState === 'initial'" class="text-center" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px;">
          <div v-if="!authStore.isLoggedIn && ideaStore.lastIdeaSaveTime > 0 && !ideaStore.canGenerateNewIdea" class="alert alert-warning w-100 mb-4">
            <p class="mb-0">⏳ Debes esperar para generar otra idea</p>
            <p class="text-muted mb-0">{{ ideaStore.getTimeUntilNextIdea }}</p>
          </div>

          <button 
            class="btn text-white btn-principalIdeaBtn"
            style="background-color: #FF9500; border: none; padding: 12px 30px; font-size: 18px;"
            @click="() => ideaStore.generateIdea(false)"
            :disabled="!authStore.isLoggedIn && ideaStore.lastIdeaSaveTime > 0 && !ideaStore.canGenerateNewIdea"
          >
            <img src="../assets/llamita02.png" alt="" class="img-fluid">
            <span> Generar idea </span>
          </button>

          <div v-if="ideaStore.getRecentIdeas.length > 0" class="w-100">
            <hr>
            <button 
              class="btn btn-link text-dark text-decoration-none d-inline-flex justify-content-center align-items-center gap-2 mb-3"
              @click="ideaStore.toggleListCollapse"
            >
              <span><i class="fas fa-save"></i> Ideas Guardadas</span>
              <i :class="ideaStore.isListCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"></i>
            </button>

            <div v-if="!ideaStore.isListCollapsed" class="mb-4">
              <IdeaList 
                :ideas="ideaStore.getRecentIdeas"
                :max-display="5"
                :show-pagination="true"
              />
              <button 
                class="btn btn-sm btn-outline-danger rounded-pill mt-3"
                @click="ideaStore.clearIdeas"
              >
                <i class="fas fa-trash"></i> Borrar ideas
              </button>
            </div>
          </div>
        </div>

        <!-- PASO 02: Idea generada - Idea + Botones + Referencias -->
        <div v-else-if="ideaStore.appState === 'generated'" class="text-center">
          <div class="suggestedIdead d-flex justify-content-between align-items-start flex-wrap">
            <h2 class="mb-4 ideaGenerated mr-2">{{ ideaStore.currentIdea || ideaStore.lastSavedIdea }}</h2>
          
            <button 
              class="btn btn-sm regeneratebtn rounded-pill mb-4"
              style="background-color: #FF9500; color: white; border: none; padding: 8px 12px;"
              @click="regenerateIdea()"
            >
              <i class="fa-solid fa-arrow-rotate-right"></i>
            </button>
          </div>

          <div class="d-flex justify-content-center flex-wrap gap-3 mt-4">
            <button 
              class="btn btn-danger"
              @click="ideaStore.discardIdea"
            >
              <i class="fas fa-times"></i> Descartar idea
            </button>
            <button 
              class="btn text-white"
              style="background-color: #1DB5A0;"
              @click="handleSaveIdea"
              :disabled="ideaStore.loading"
            >
              <i class="fas fa-check"></i>
              {{ ideaStore.loading ? 'Guardando...' : 'Elegir idea' }}
            </button>
          </div>
        </div>

        <!-- PASO 03: Mensaje de agradecimiento -->
        <div v-else-if="ideaStore.appState === 'thankYou'" class="text-center" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px;">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div 
              class="rounded-pill text-white d-flex align-items-center justify-content-center" 
              style="background-color: #FF9500; width: 50px; height: 50px; font-size: 24px;"
            >
              ✓
            </div>
            <p class="mb-0 idea-text" style="font-size: 18px; max-width: 800px;">
              <!-- Animal -->
              <span 
                class="idea-part"
                @click="openReferenceModal('animal')"
                title="Click para ver imágenes"
              >
                {{ (ideaStore.currentIdea || ideaStore.lastSavedIdea).split(' ').slice(0, 2).join(' ') }}
              </span>

              <!-- Texto fijo -->
              <span> vestido de </span>

              <!-- Caracterización -->
              <span 
                class="idea-part"
                @click="openReferenceModal('caracterizacion')"
                title="Click para ver imágenes"
              >
                {{ extractCaracterizacion(ideaStore.currentIdea || ideaStore.lastSavedIdea) }}
              </span>

              <!-- Acción -->
              <span 
                class="idea-part"
                @click="openReferenceModal('accion')"
                title="Click para ver imágenes"
              >
                {{ extractAccion(ideaStore.currentIdea || ideaStore.lastSavedIdea) }}
              </span>
            </p>
          </div>

          <!-- Modal de referencias -->
          <ImageReferenceModal
            :show="showModal"
            :title="modalTitle"
            :query="modalQuery"
            @close="showModal = false"
          />

          <div class="p-4 rounded" style="background-color: #FFD700;">
            <p style="color: #666; margin: 0;">Gracias por elegir esta idea, mañana podrás venir a buscar otra!</p>
          </div>

          <div class="d-flex gap-3 flex-wrap mt-4">
            <button 
              class="btn btn-lg text-white"
              style="background-color: #1DB5A0; border: none; padding: 12px 30px; font-size: 18px;"
              @click="ideaStore.goToMyIdeas"
            >
              <i class="fas fa-arrow-up-right-from-square"></i> Ver ideas guardadas
            </button>
            <button 
              class="btn btn-lg text-white"
              style="background-color: #ccc; border: none; padding: 12px 30px; font-size: 18px;"
              @click="goBack"
            >
              <i class="fas fa-arrow-left"></i> Atrás
            </button>
          </div>
        </div>

        <!-- PASO 04: Mis ideas -->
        <div v-else-if="ideaStore.appState === 'myIdeas'" class="text-center">
          <h3 class="mb-4"><i class="fas fa-save"></i> Ideas Guardadas</h3>

          <div v-if="ideaStore.myIdeas.length > 0" class="mb-4">
            <IdeaList 
              :ideas="ideaStore.myIdeas"
              :max-display="5"
              :show-pagination="true"
            />
          </div>

          <!-- Mensaje de éxito después de subir imagen -->
          <div v-if="uploadSuccess" class="alert alert-success d-flex justify-content-between align-items-center mt-4">
            <div>
              <strong>✓ ¡Imagen subida correctamente!</strong>
              <p class="mb-0 mt-2">Tu idea con imagen ya está guardada.</p>
              <button 
                class="btn btn-sm btn-success mt-3"
                @click="resetUploadSuccess"
              >
                <i class="fas-fa-image"></i> Ver mis imágenes subidas
              </button>
            </div>
            <button 
              class="btn btn-sm btn-outline-success"
              @click="resetUploadSuccess"
            >
              <i class="fas fa-time"></i>
            </button>
          </div>

          <!-- Botones: mostrar solo si NO hay mensaje de éxito -->
          <div v-if="!uploadSuccess" class="d-flex flex-wrap gap-3 justify-content-center mt-4">
            <button 
              v-if="authStore.isLoggedIn"
              class="btn btn-lg rounded-pill text-white"
              style="background-color: #FF9500; border: none; padding: 12px 30px; font-size: 18px;"
              @click="showUploadModal = true"
              :disabled="ideaStore.loading"
            >
              {{ ideaStore.loading ? '⏳ Subiendo...' : '📤 Subir idea' }}
            </button>

            <button 
              class="btn btn-lg text-white"
              style="background-color: #ccc; border: none; padding: 12px 30px; font-size: 18px;"
              @click="goBack"
            >
              <i class="fas fa-arrow-left"></i> Atrás
            </button>
          </div>

          <!-- Modal de upload -->
          <IdeaUploadModal
            :show="showUploadModal"
            :idea="ideaStore.lastSavedIdea"
            @upload="handleUploadIdea"
            @close="showUploadModal = false"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>

.btn.btn-principalIdeaBtn{
  font-size: 42px!important;
  padding: 20px 100px!important;
  border-radius: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  transition: all 0.3s ease;
}

.btn-principalIdeaBtn:hover{
  box-shadow: 0px 50px 15px -20px #FF9500;
  transform: translateY(-3px);
  background-color: #fff!important;
  color: #71bae8!important;
}

.btn-principalIdeaBtn img{
  height: 70px;
  margin: 0 10px;
  transition: all 0.3s ease;
}

.btn-principalIdeaBtn:hover img{
  filter: drop-shadow(0 0 5px rgba(255, 149, 0, 0.7));
  height: 90px;
}

/*  */
.btn{
 font-size: 18px!important;
 font-weight: 600!important; 
 letter-spacing: 1px!important;
}

/*  */

.idea-part {
  font-weight: bold;
  color: #FF9500;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.idea-part:hover {
  background-color: rgba(255, 149, 0, 0.15);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 767px) {
  .btn{
    width: 100%!important;
  }

  .btn.btn-principalIdeaBtn{
    font-size: 32px!important;
    padding: 15px 30px!important;
    max-width: 80%!important;
  }

  .btn-principalIdeaBtn img{
  height: 170px;
  margin-bottom: 20px;
  }

  .btn.regeneratebtn{
    width: 40px!important;
    height: 40px!important;
    font: 10px!important;
    padding: 0!important;
    display: block;
  }

  .ideaGenerated{
    max-width: 80%;
    font-size: 18px;
  }

}
</style>