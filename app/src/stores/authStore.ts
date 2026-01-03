import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from './firebase'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { useIdeasStore } from './ideaStore'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Detectar si el usuario ya está logueado
  const initializeAuth = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (currentUser) => {
        user.value = currentUser
        
        // Si hay usuario logueado, cargar sus ideas desde Firestore
        if (currentUser) {
          const ideasStore = useIdeasStore()
          await ideasStore.loadIdeasFromFirestore()
        }
        
        resolve(currentUser)
      })
    })
  }

  const isLoggedIn = computed(() => {
    return user.value !== null
  })

  const loginWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      user.value = result.user
      
      // Cargar ideas del usuario desde Firestore
      const ideasStore = useIdeasStore()
      await ideasStore.loadIdeasFromFirestore()
      
      return result.user
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      await signOut(auth)
      user.value = null
      
      // Al cerrar sesión, recargar desde localStorage
      const ideasStore = useIdeasStore()
      ideasStore.loadIdeasFromLocalStorage()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Inicializar la autenticación cuando se carga la app
  initializeAuth()

  return {
    user,
    loading,
    error,
    isLoggedIn,
    loginWithGoogle,
    logout
  }
})