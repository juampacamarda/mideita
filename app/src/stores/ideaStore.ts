import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, auth } from './firebase'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { useAuthStore } from './authStore'

const animales = [
  "llama", "aguará guazú", "carpincho", "puma", "yaguareté", "guanaco", "tatú carreta", "huemul",
  "vicuña", "zorrito de monte", "tapir", "monito de monte", "coendú", "ñandú", "mará", "zorro colorado",
  "coatí", "margay", "ocelote", "paca", "cuis", "yacaré", "huillín", "hurón menor", "mulita",
  "chinchillón", "lobito de río", "tucán", "cardenal amarillo", "ciervo de los pantanos"
]

const caracterizaciones = [
  "guerrero medieval", "policía", "oficinista", "jugador de fútbol", "albañil", "músico", "científico",
  "bombero", "astronauta", "superhéroe", "pirata", "chef", "pintor", "payaso", "bailarín", "mago",
  "detective", "explorador", "ninja", "repartidor", "profesor", "doctor", "ingeniero", "cazador",
  "vendedor ambulante", "granadero", "campesino", "artista", "jardinero", "escultor"
]

const acciones = [
  "comprando en el supermercado", "trabajando en una oficina", "caminando por el bosque", "leyendo un libro",
  "nadando en un lago", "cocinando una comida", "jugando al ajedrez", "tocando la guitarra", "pintando un cuadro",
  "escribiendo una carta", "arreglando un coche", "jugando con amigos", "cazando mariposas", "plantando un árbol",
  "paseando por el parque", "escalando una montaña", "durmiendo en una hamaca", "construyendo una casa",
  "volando una cometa", "sacando fotos", "cantando en un karaoke", "dibujando en un cuaderno", "bailando en una fiesta",
  "lavando los platos", "limpiando la casa", "haciendo yoga", "pescando en un río", "tomando un café",
  "haciendo ejercicio", "andando en bicicleta"
]

// Modo desarrollo: cambiar a true para saltarse la restricción de 24h
const SKIP_24H_RESTRICTION = false

export const useIdeasStore = defineStore('ideas', () => {
  const currentIdea = ref<string>('')
  const savedIdeas = ref<string[]>([])
  const usedCombinations = ref<Set<string>>(new Set())
  const ideaSaved = ref(true)
  const lastIdeaSaveTime = ref<number>(0)
  const appState = ref<'initial' | 'generated' | 'thankYou' | 'myIdeas'>('initial')
  const isListCollapsed = ref(true)
  const loading = ref(false)
  const lastSavedIdea = ref<string>('')

  // Cargar ideas desde Firestore
  const loadIdeasFromFirestore = async () => {
    const authStore = useAuthStore()
    
    if (!authStore.user) {
      // Si no está logueado, cargar del localStorage como antes
      loadIdeasFromLocalStorage()
      return
    }

    try {
      loading.value = true
      const q = query(
        collection(db, 'ideas'),
        where('userId', '==', authStore.user.uid)
      )
      const querySnapshot = await getDocs(q)
      
      const ideas: string[] = []
      let latestTime = 0

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        ideas.push(data.idea)
        // Obtener el timestamp más reciente
        if (data.createdAt && data.createdAt.toMillis() > latestTime) {
          latestTime = data.createdAt.toMillis()
        }
      })

      savedIdeas.value = ideas
      if (latestTime > 0) {
        lastIdeaSaveTime.value = latestTime
      }
      
      checkIfCanGenerateNewIdea()
    } catch (error) {
      console.error('Error cargando ideas:', error)
      // En caso de error, cargar del localStorage como fallback
      loadIdeasFromLocalStorage()
    } finally {
      loading.value = false
    }
  }

  // Cargar ideas del localStorage (fallback)
  const loadIdeasFromLocalStorage = () => {
    const stored = localStorage.getItem('ideasAprobadas')
    if (stored) {
      savedIdeas.value = JSON.parse(stored)
    }
    
    const savedTime = localStorage.getItem('lastIdeaSaveTime')
    if (savedTime) {
      lastIdeaSaveTime.value = parseInt(savedTime)
    }

    checkIfCanGenerateNewIdea()
  }

  const checkIfCanGenerateNewIdea = () => {
    const authStore = useAuthStore()
    
    // Los usuarios logueados pueden generar sin restricción
    if (authStore.isLoggedIn) {
      appState.value = 'initial'
      return
    }

    if (lastIdeaSaveTime.value === 0) {
      appState.value = 'initial'
      return
    }

    if (SKIP_24H_RESTRICTION) {
      appState.value = 'initial'
      return
    }

    const now = Date.now()
    const twentyFourHoursMs = 24 * 60 * 60 * 1000
    const timeSinceLastIdea = now - lastIdeaSaveTime.value

    if (timeSinceLastIdea >= twentyFourHoursMs) {
      appState.value = 'initial'
    } else {
      appState.value = 'initial' // Cambiar de 'waitingNextIdea' a 'initial'
    }
  }

  const getTimeUntilNextIdea = computed(() => {
    if (lastIdeaSaveTime.value === 0) return ''
    
    const now = Date.now()
    const twentyFourHoursMs = 24 * 60 * 60 * 1000
    const timeSinceLastIdea = now - lastIdeaSaveTime.value
    const timeRemaining = twentyFourHoursMs - timeSinceLastIdea

    if (timeRemaining <= 0) return ''

    const hours = Math.floor(timeRemaining / (60 * 60 * 1000))
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000)

    return `En ${hours}h ${minutes}min ${seconds}seg podrás generar una nueva idea!`
  })

  const getRecentIdeas = computed(() => {
    return savedIdeas.value.slice(-7).reverse()
  })

  const canGenerateNewIdea = computed(() => {
    const authStore = useAuthStore()
    
    // Los usuarios logueados siempre pueden generar
    if (authStore.isLoggedIn) {
      return true
    }
    
    if (lastIdeaSaveTime.value === 0) return true
    
    const now = Date.now()
    const twentyFourHoursMs = 24 * 60 * 60 * 1000
    const timeSinceLastIdea = now - lastIdeaSaveTime.value
    
    return timeSinceLastIdea >= twentyFourHoursMs || SKIP_24H_RESTRICTION
  })

  const generateIdea = (forceNew = false) => {
    // Si es regenerar y ya hay una idea, no contar como nueva combinación
    if (forceNew) {
      // Regenerar: solo genera nueva, no valida restricciones
      if (usedCombinations.value.size === animales.length * caracterizaciones.length * acciones.length) {
        usedCombinations.value.clear()
      }
    } else {
      // Primera generación: validar si puede generar
      if (!canGenerateNewIdea.value) {
        return
      }
    }

    if (usedCombinations.value.size === animales.length * caracterizaciones.length * acciones.length) {
      usedCombinations.value.clear()
    }

    let newCombination: string
    do {
      const animal = animales[Math.floor(Math.random() * animales.length)]
      const caracterizacion = caracterizaciones[Math.floor(Math.random() * caracterizaciones.length)]
      const accion = acciones[Math.floor(Math.random() * acciones.length)]
      newCombination = `Un ${animal} vestido de ${caracterizacion} ${accion}.`
    } while (usedCombinations.value.has(newCombination))

    usedCombinations.value.add(newCombination)
    currentIdea.value = newCombination
    appState.value = 'generated'
  }

  const saveIdea = async () => {
    const authStore = useAuthStore()
    
    if (!currentIdea.value) return

    // Limitar a 50 ideas máximo por usuario
    if (savedIdeas.value.length >= 50) {
      alert('Has alcanzado el límite de 50 ideas guardadas. Borra algunas para continuar.')
      return
    }

    // Validación
    const ideaTrimmed = currentIdea.value.trim()
    if (ideaTrimmed.length < 5) {
      alert('La idea debe tener al menos 5 caracteres')
      return
    }
    if (ideaTrimmed.length > 200) {
      alert('La idea no puede exceder 200 caracteres')
      return
    }

    try {
      loading.value = true

      // Si está logueado, guardar en Firestore
      if (authStore.user) {
        await addDoc(collection(db, 'ideas'), {
          idea: ideaTrimmed,
          userId: authStore.user.uid,
          userEmail: authStore.user.email,
          createdAt: new Date()
        })
      }

      // También guardar en localStorage como backup
      savedIdeas.value.push(ideaTrimmed)
      lastIdeaSaveTime.value = Date.now()
      localStorage.setItem('ideasAprobadas', JSON.stringify(savedIdeas.value))
      localStorage.setItem('lastIdeaSaveTime', lastIdeaSaveTime.value.toString())

      // Guardar la idea en lastSavedIdea
      lastSavedIdea.value = ideaTrimmed
    
      ideaSaved.value = true
      appState.value = 'thankYou'
    } catch (error) {
      console.error('Error guardando idea:', error)
      alert('Error al guardar la idea. Intenta de nuevo.')
    } finally {
      loading.value = false
    }
  }

  const goToMyIdeas = () => {
    appState.value = 'myIdeas'
  }

  const discardIdea = () => {
    currentIdea.value = ''
    ideaSaved.value = true
    appState.value = 'initial'
  }

  const clearIdeas = async () => {
    const authStore = useAuthStore()
    
    if (!confirm('¿Estás seguro de que quieres borrar todas las ideas?')) return

    try {
      loading.value = true

      // Si está logueado, eliminar de Firestore
      if (authStore.user) {
        const q = query(
          collection(db, 'ideas'),
          where('userId', '==', authStore.user.uid)
        )
        const querySnapshot = await getDocs(q)
        
        for (const document of querySnapshot.docs) {
          await deleteDoc(doc(db, 'ideas', document.id))
        }
      }

      // Limpiar localStorage
      savedIdeas.value = []
      localStorage.removeItem('ideasAprobadas')
      localStorage.removeItem('lastIdeaSaveTime')
      lastIdeaSaveTime.value = 0
    } catch (error) {
      console.error('Error borrando ideas:', error)
      alert('Error al borrar las ideas. Intenta de nuevo.')
    } finally {
      loading.value = false
    }
  }

  const toggleListCollapse = () => {
    isListCollapsed.value = !isListCollapsed.value
  }

  loadIdeasFromLocalStorage()

  return {
    currentIdea,
    savedIdeas,
    ideaSaved,
    appState,
    isListCollapsed,
    loading,
    lastIdeaSaveTime,
    lastSavedIdea,
    canGenerateNewIdea,
    getTimeUntilNextIdea,
    getRecentIdeas,
    generateIdea,
    saveIdea,
    discardIdea,
    clearIdeas,
    goToMyIdeas,
    toggleListCollapse,
    loadIdeasFromFirestore,
    loadIdeasFromLocalStorage,
  }
})
