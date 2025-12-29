<script setup lang="ts">
import { ref } from 'vue'
import { useIdeasStore } from '../stores/ideaStore'

const ideaStore = useIdeasStore()
const showReferenceModal = ref(false)
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8">

        <!-- PASO 01: Estado inicial - Solo botón generar -->
        <div v-if="ideaStore.appState === 'initial'" class="text-center" style="min-height: 60vh; display: flex; align-items: center; justify-content: center;">
          <button 
            class="btn btn-lg rounded-pill text-white"
            style="background-color: #FF9500; border: none; padding: 12px 30px; font-size: 18px;"
            @click="ideaStore.generateIdea"
          >
            💡 Generar idea
          </button>
        </div>

        <!-- PASO 02: Idea generada - Idea + Botones + Referencias -->
        <div v-else-if="ideaStore.appState === 'generated'" class="text-center">
          <h2 class="mb-4">{{ ideaStore.currentIdea }}</h2>
          
          <!-- Botón referencias -->
          <button 
            class="btn btn-sm rounded-pill mb-4"
            style="background-color: #FF9500; color: white; border: none; padding: 8px 12px;"
            @click="showReferenceModal = true"
          >
            🔄
          </button>

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
              @click="ideaStore.saveIdea"
            >
              Elegir idea
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
            <p class="mb-0" style="font-size: 18px; max-width: 500px;">{{ ideaStore.savedIdeas[ideaStore.savedIdeas.length - 1] }}</p>
          </div>

          <div class="p-4 rounded" style="background-color: #FFD700;">
            <p style="color: #666; margin: 0;">Gracias por elegir esta idea, mañana podrás venir a buscar otra!</p>
          </div>

          <button 
            class="btn btn-lg rounded-pill text-white"
            style="background-color: #1DB5A0; border: none; padding: 12px 30px; font-size: 18px;"
            @click="ideaStore.goToMyIdeas"
          >
            ↗️ Subir idea
          </button>
        </div>

        <!-- PASO 04: Mis ideas - Últimas 7 ideas + Upload -->
        <div v-else-if="ideaStore.appState === 'myIdeas'" class="text-center">
          <h3 class="mb-4">🔒 Ideas Guardadas</h3>

          <div v-if="ideaStore.getRecentIdeas.length > 0" class="list-group mb-4">
            <div 
              v-for="(idea, index) in ideaStore.getRecentIdeas" 
              :key="index" 
              class="list-group-item border-0 border-bottom py-3"
            >
              <div class="d-flex align-items-center gap-3">
                <div 
                  class="rounded-pill text-white d-flex align-items-center justify-content-center flex-shrink-0" 
                  style="background-color: #FF9500; width: 40px; height: 40px;"
                >
                  ✓
                </div>
                <span>{{ idea }}</span>
              </div>
            </div>
          </div>

          <p class="text-muted mb-4">{{ ideaStore.getTimeUntilNextIdea }}</p>

          <button 
            class="btn btn-lg rounded-pill text-white"
            style="background-color: #FF9500; border: none; padding: 12px 30px; font-size: 18px;"
            disabled
          >
            📤 Subir idea
          </button>
        </div>

        <!-- PASO 05: Esperando 24h - Botón generar + Lista colapsable -->
        <div v-else-if="ideaStore.appState === 'waitingNextIdea'" class="text-center">
          <button 
            class="btn btn-lg rounded-pill text-white mb-5"
            style="background-color: #FF9500; border: none; padding: 12px 30px; font-size: 18px;"
            disabled
          >
            💡 Generar idea
          </button>

          <div class="mb-4">
            <button 
              class="btn btn-link text-dark text-decoration-none d-inline-flex align-items-center gap-2"
              @click="ideaStore.toggleListCollapse"
            >
              <span>🔒 Ideas Guardadas</span>
              <span>{{ ideaStore.isListCollapsed ? '▼' : '▲' }}</span>
            </button>
          </div>

          <div v-if="!ideaStore.isListCollapsed && ideaStore.getRecentIdeas.length > 0" class="list-group">
            <div 
              v-for="(idea, index) in ideaStore.getRecentIdeas" 
              :key="index" 
              class="list-group-item border-0 border-bottom py-3"
            >
              <div class="d-flex align-items-center gap-3">
                <div 
                  class="rounded-pill text-white d-flex align-items-center justify-content-center flex-shrink-0" 
                  style="background-color: #FF9500; width: 40px; height: 40px;"
                >
                  ✓
                </div>
                <span>{{ idea }}</span>
              </div>
            </div>
          </div>

          <p class="text-muted mt-4">{{ ideaStore.getTimeUntilNextIdea }}</p>
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