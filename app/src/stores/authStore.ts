import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from './firebase'
import { 
  
  signInWithPopup,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  getRedirectResult,
  type User
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  let unsubscribeAuth: (() => void) | null = null

  const initializeAuth = () => {
    return new Promise<void>((resolve) => {
      console.log('🚀 INICIANDO AUTH - URL actual:', window.location.href)
      
      let resolved = false
      
      // Configurar listener PRIMERO
      unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        console.log('🔄 onAuthStateChanged:', currentUser?.email || 'null')
        
        user.value = currentUser
        loading.value = false

        if (currentUser) {
          console.log('✅ USUARIO DETECTADO:', currentUser.email)
        }

        // Resolver inmediatamente después del primer onAuthStateChanged
        if (!resolved) {
          resolved = true
          console.log('✅ AUTH INICIALIZADO - resolviendo promesa')
          resolve()
        }
      })

      // Procesar redirect en paralelo (sin bloquear)
      setTimeout(async () => {
        try {
          console.log('🔍 PROCESANDO REDIRECT...')
          const result = await getRedirectResult(auth)
          
          if (result?.user) {
            console.log('✅ REDIRECT EXITOSO:', result.user.email)
          } else {
            console.log('ℹ️ SIN REDIRECT')
          }
          
        } catch (err) {
          console.error('❌ ERROR EN REDIRECT:', err)
        }
      }, 100)
    })
  }

  const isLoggedIn = computed(() => {
    return user.value !== null
  })

  const loginWithGoogle = async () => {
    try {
      loading.value = true
      console.log('🔵 Iniciando login con Google (popup)...')
      
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      provider.addScope('email')
      provider.addScope('profile')
      
      const result = await signInWithPopup(auth, provider)
      
      console.log('✅ Login exitoso:', result.user.email)
      user.value = result.user
    } catch (error: any) {
      console.error('❌ Error en login:', error.message)
      alert('Error al iniciar sesión: ' + error.message)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      console.log('🚪 Logout...')
      loading.value = true
      await signOut(auth)
    } catch (err: any) {
      console.error('❌ Error logout:', err.message)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const cleanup = () => {
    if (unsubscribeAuth) {
      unsubscribeAuth()
      unsubscribeAuth = null
    }
  }

  return {
    user,
    loading,
    error,
    isLoggedIn,
    loginWithGoogle,
    logout,
    initializeAuth,
    cleanup
  }
})