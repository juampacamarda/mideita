import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from './firebase'
import { 
  signInWithRedirect,  // ← Cambiar de signInWithPopup
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  getRedirectResult,    // ← Agregar
  type User
} from 'firebase/auth'
import { useIdeasStore } from './ideaStore'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const initializeAuth = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (currentUser) => {
        user.value = currentUser
        
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
      await signInWithRedirect(auth, provider)  // ← Cambiar aquí
      
      // El usuario será redirigido y vuelto, no necesita await
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
      
      const ideasStore = useIdeasStore()
      ideasStore.loadIdeasFromLocalStorage()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

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