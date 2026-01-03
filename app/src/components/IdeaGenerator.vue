<script setup lang="ts">
import { ref } from 'vue'
import { useIdeasStore } from '../stores/ideaStore'
import { useAuthStore } from '../stores/authStore'
import IdeaList from './IdeaList.vue'
import ImageReferenceModal from './ImageReferenceModal.vue'

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

const handleLogin = async () => {
  try {
    await authStore.loginWithGoogle()
  } catch (error) {
    console.error('Error en login:', error)
  }
}

const handleUploadIdea = () => {
  if (!authStore.isLoggedIn) {
    alert('Debes iniciar sesión para subir ideas')
    return
  }
  console.log('Subiendo idea...')
}

const handleThankYouButton = async () => {
  if (authStore.isLoggedIn) {
    ideaStore.goToMyIdeas()
  } else {
    await handleLogin()
  }
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
            class="btn btn-lg rounded-pill text-white"
            style="background-color: #FF9500; border: none; padding: 12px 30px; font-size: 18px;"
            @click="() => ideaStore.generateIdea(false)"
            :disabled="!authStore.isLoggedIn && ideaStore.lastIdeaSaveTime > 0 && !ideaStore.canGenerateNewIdea"
          >
            💡 Generar idea
          </button>

          <div v-if="ideaStore.getRecentIdeas.length > 0" class="w-100">
            <button 
              class="btn btn-link text-dark text-decoration-none d-inline-flex align-items-center gap-2 mb-3"
              @click="ideaStore.toggleListCollapse"
            >
              <span>🔒 Ideas Guardadas</span>
              <span>{{ ideaStore.isListCollapsed ? '▼' : '▲' }}</span>
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
                🗑️ Borrar ideas
              </button>
            </div>
          </div>
        </div>

        <!-- PASO 02: Idea generada - Idea + Botones + Referencias -->
        <div v-else-if="ideaStore.appState === 'generated'" class="text-center">
          <div class="suggestedIdead d-flex justify-content-between align-items-start flex wrap">
            <h2 class="mb-4 mr-2">{{ ideaStore.currentIdea || ideaStore.lastSavedIdea }}</h2>
          
            <button 
              class="btn btn-sm rounded-pill mb-4"
              style="background-color: #FF9500; color: white; border: none; padding: 8px 12px;"
              @click="regenerateIdea()"
            >
              🔄
            </button>
          </div>

          <div class="d-flex justify-content-center gap-3 mt-4">
            <button 
              class="btn btn-danger rounded-pill"
              @click="ideaStore.discardIdea"
            >
              Descartar idea
            </button>
            <button 
              class="btn rounded-pill text-white"
              style="background-color: #1DB5A0;"
              @click="handleSaveIdea"
              :disabled="ideaStore.loading"
            >
              {{ ideaStore.loading ? '⏳ Guardando...' : 'Elegir idea' }}
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
            <p class="mb-0 idea-text" style="font-size: 18px; max-width: 500px;">
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

          <div class="d-flex gap-3 mt-4">
            <button 
              class="btn btn-lg rounded-pill text-white"
              style="background-color: #1DB5A0; border: none; padding: 12px 30px; font-size: 18px;"
              @click="ideaStore.goToMyIdeas"
            >
              ↗️ Ver ideas guardadas
            </button>
            <button 
              class="btn btn-lg rounded-pill text-white"
              style="background-color: #ccc; border: none; padding: 12px 30px; font-size: 18px;"
              @click="goBack"
            >
              ← Atrás
            </button>
          </div>
        </div>

        <!-- PASO 04: Mis ideas - Últimas 7 ideas + Upload -->
        <div v-else-if="ideaStore.appState === 'myIdeas'" class="text-center">
          <h3 class="mb-4">🔒 Ideas Guardadas</h3>

          <div v-if="ideaStore.getRecentIdeas.length > 0" class="mb-4">
            <IdeaList 
              :ideas="ideaStore.getRecentIdeas"
              :max-display="5"
              :show-pagination="true"
            />
          </div>

          <p v-if="!authStore.isLoggedIn" class="text-muted mb-4">{{ ideaStore.getTimeUntilNextIdea }}</p>

          <div class="d-flex gap-3 justify-content-center mt-4">
            <button 
              v-if="authStore.isLoggedIn"
              class="btn btn-lg rounded-pill text-white"
              style="background-color: #FF9500; border: none; padding: 12px 30px; font-size: 18px;"
              @click="handleUploadIdea"
              :disabled="ideaStore.loading"
            >
              {{ ideaStore.loading ? '⏳ Subiendo...' : '📤 Subir idea' }}
            </button>

            <button 
              class="btn btn-lg rounded-pill text-white"
              style="background-color: #ccc; border: none; padding: 12px 30px; font-size: 18px;"
              @click="goBack"
            >
              ← Atrás
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>