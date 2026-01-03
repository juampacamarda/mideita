<script setup lang="ts">
import { ref } from 'vue'
import { useIdeasStore } from '../stores/ideaStore'
import { useAuthStore } from '../stores/authStore'
import IdeaList from './IdeaList.vue'

const ideaStore = useIdeasStore()
const authStore = useAuthStore()
const showReferenceModal = ref(false)

const regenerateIdea = () => {
  ideaStore.generateIdea(true) // true = forceNew
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
  // Aquí iría la lógica de subir imagen
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
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8">

        <!-- PASO 01: Estado inicial - Solo botón generar (o deshabilitado si esperando 24h) -->
        <div v-if="ideaStore.appState === 'initial'" class="text-center" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 30px;">
          <!-- Mensaje de espera si NO está logueado y debe esperar 24h -->
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

          <!-- Ideas guardadas - Solo si existen -->
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
          
            <!-- Botón referencias -->
            <button 
              class="btn btn-sm rounded-pill mb-4"
              style="background-color: #FF9500; color: white; border: none; padding: 8px 12px;"
              @click="regenerateIdea()"
            >
              🔄
            </button>
          </div>

          <!-- Botones Descartar / Elegir -->
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
            <p class="mb-0" style="font-size: 18px; max-width: 500px;">{{ ideaStore.currentIdea }}</p>
          </div>

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
            <!-- Botón subir idea - SOLO si está logueado -->
            <button 
              v-if="authStore.isLoggedIn"
              class="btn btn-lg rounded-pill text-white"
              style="background-color: #FF9500; border: none; padding: 12px 30px; font-size: 18px;"
              @click="handleUploadIdea"
              :disabled="ideaStore.loading"
            >
              {{ ideaStore.loading ? '⏳ Subiendo...' : '📤 Subir idea' }}
            </button>

            <!-- Botón login si NO está logueado -->
            <button 
              v-else
              class="btn btn-lg rounded-pill text-white"
              style="background-color: #FF9500; border: none; padding: 12px 30px; font-size: 18px;"
              @click="handleLogin"
              :disabled="authStore.loading"
            >
              {{ authStore.loading ? '⏳ Iniciando sesión...' : '🔐 Inicia sesión' }}
            </button>

            <!-- Botón Atrás -->
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
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>