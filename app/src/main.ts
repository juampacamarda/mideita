import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.css' 
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inicializar autenticación antes de montar la app
console.log('🎯 Esperando inicialización completa de auth...')
const authStore = useAuthStore()

authStore.initializeAuth().then(() => {
  console.log('🚀 Montando aplicación Vue')
  app.mount('#app')
}).catch(err => {
  console.error('❌ Error inicializando auth:', err)
  app.mount('#app') // Montar de todas formas
})