import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, auth } from './firebase'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy, limit } from 'firebase/firestore'
import { useAuthStore } from './authStore'

// Tipos
export interface StoredIdea {
  id: string
  idea: string
  userId: string
  userEmail: string
  imageUrl?: string
  createdAt: Date
}

const animales = [
  { nombre: "llama", articulo: "Una", participio: "vestida" },
  { nombre: "aguará guazú", articulo: "Un", participio: "vestido" },
  { nombre: "carpincho", articulo: "Un", participio: "vestido" },
  { nombre: "puma", articulo: "Un", participio: "vestido" },
  { nombre: "yaguareté", articulo: "Un", participio: "vestido" },
  { nombre: "guanaco", articulo: "Un", participio: "vestido" },
  { nombre: "tatú carreta", articulo: "Un", participio: "vestido" },
  { nombre: "huemul", articulo: "Un", participio: "vestido" },
  { nombre: "vicuña", articulo: "Una", participio: "vestida" },
  { nombre: "zorrito de monte", articulo: "Un", participio: "vestido" },
  { nombre: "tapir", articulo: "Un", participio: "vestido" },
  { nombre: "monito de monte", articulo: "Un", participio: "vestido" },
  { nombre: "coendú", articulo: "Un", participio: "vestido" },
  { nombre: "ñandú", articulo: "Un", participio: "vestido" },
  { nombre: "mará", articulo: "Una", participio: "vestida" },
  { nombre: "zorro colorado", articulo: "Un", participio: "vestido" },
  { nombre: "coatí", articulo: "Un", participio: "vestido" },
  { nombre: "margay", articulo: "Un", participio: "vestido" },
  { nombre: "ocelote", articulo: "Un", participio: "vestido" },
  { nombre: "paca", articulo: "Una", participio: "vestida" },
  { nombre: "cuis", articulo: "Un", participio: "vestido" },
  { nombre: "yacaré", articulo: "Un", participio: "vestido" },
  { nombre: "huillín", articulo: "Un", participio: "vestido" },
  { nombre: "hurón menor", articulo: "Un", participio: "vestido" },
  { nombre: "mulita", articulo: "Una", participio: "vestida" },
  { nombre: "chinchillón", articulo: "Un", participio: "vestido" },
  { nombre: "lobito de río", articulo: "Un", participio: "vestido" },
  { nombre: "tucán", articulo: "Un", participio: "vestido" },
  { nombre: "cardenal amarillo", articulo: "Un", participio: "vestido" },
  { nombre: "ciervo de los pantanos", articulo: "Un", participio: "vestido" }
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
const SKIP_24H_RESTRICTION = true

export const useIdeasStore = defineStore('ideas', () => {
  // Estado para generación de ideas
  const currentIdea = ref<string>('')
  const usedCombinations = ref<Set<string>>(new Set())
  const ideaSaved = ref(true)
  const lastIdeaSaveTime = ref<number>(0)
  const appState = ref<'initial' | 'generated' | 'thankYou' | 'myIdeas' | 'community'>('initial')
  const isListCollapsed = ref(true)
  const loading = ref(false)
  const lastSavedIdea = ref<string>('')

  // Estado para mis ideas (del usuario actual)
  const myIdeas = ref<StoredIdea[]>([])

  // Estado para ideas de la comunidad (todas)
  const communityIdeas = ref<StoredIdea[]>([])

  // Query: Cargar MIS IDEAS (solo del usuario)
  const loadMyIdeas = async () => {
    const authStore = useAuthStore()
    
    if (!authStore.user) return

    try {
      loading.value = true
      const q = query(
        collection(db, 'ideas'),
        where('userId', '==', authStore.user.uid),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      myIdeas.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StoredIdea))
    } catch (error) {
      console.error('Error cargando mis ideas:', error)
    } finally {
      loading.value = false
    }
  }

  // Query: Cargar TODAS LAS IDEAS (comunidad)
  const loadCommunityIdeas = async () => {
    try {
      loading.value = true
      const q = query(
        collection(db, 'ideas'),
        orderBy('createdAt', 'desc'),
        limit(50) // Limitar a las últimas 50 para performance
      )
      const querySnapshot = await getDocs(q)
      
      communityIdeas.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StoredIdea))
    } catch (error) {
      console.error('Error cargando ideas de comunidad:', error)
    } finally {
      loading.value = false
    }
  }

  // Cargar mis ideas del localStorage (fallback)
  const loadIdeasFromLocalStorage = () => {
    const stored = localStorage.getItem('ideasAprobadas')
    if (stored) {
      const ideas = JSON.parse(stored)
      myIdeas.value = ideas.map((idea: string, index: number) => ({
        id: `local_${index}`,
        idea,
        userId: 'local',
        userEmail: 'local',
        createdAt: new Date(localStorage.getItem('lastIdeaSaveTime') || Date.now())
      }))
    }
    
    const savedTime = localStorage.getItem('lastIdeaSaveTime')
    if (savedTime) {
      lastIdeaSaveTime.value = parseInt(savedTime)
    }

    checkIfCanGenerateNewIdea()
  }

  const checkIfCanGenerateNewIdea = () => {
    const authStore = useAuthStore()
    
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
      appState.value = 'initial'
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
    return myIdeas.value.slice(-7).reverse()
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

    let newCombination = ''
    do {
      const animalObj = animales[Math.floor(Math.random() * animales.length)]
      const caracterizacion = caracterizaciones[Math.floor(Math.random() * caracterizaciones.length)]
      const accion = acciones[Math.floor(Math.random() * acciones.length)]
      
      // Validar que todos los elementos existan
      if (!animalObj || !caracterizacion || !accion) continue
    
      newCombination = `${animalObj.articulo} ${animalObj.nombre} ${animalObj.participio} de ${caracterizacion} ${accion}.`
    } while (usedCombinations.value.has(newCombination) || newCombination === '')

    usedCombinations.value.add(newCombination)
    currentIdea.value = newCombination
    appState.value = 'generated'
  }

  const saveIdea = async (imageUrl?: string) => {
    const authStore = useAuthStore()
    
    if (!currentIdea.value) return

    if (myIdeas.value.length >= 50) {
      alert('Has alcanzado el límite de 50 ideas guardadas.')
      return
    }

    const ideaTrimmed = currentIdea.value.trim()
    if (ideaTrimmed.length < 5 || ideaTrimmed.length > 200) {
      alert('La idea debe tener entre 5 y 200 caracteres')
      return
    }

    try {
      loading.value = true

      // Guardar en Firestore (siempre, aunque sea guest)
      const ideaData = {
        idea: ideaTrimmed,
        userId: authStore.user?.uid || 'guest',
        userEmail: authStore.user?.email || 'guest@example.com',
        imageUrl: imageUrl || null,
        createdAt: new Date() // Firestore lo convierte automáticamente a Timestamp
      }

      const docRef = await addDoc(collection(db, 'ideas'), ideaData)

      // Actualizar lista de mis ideas
      myIdeas.value.unshift({
        id: docRef.id,
        ...ideaData
      } as StoredIdea)

      // También guardar en localStorage
      localStorage.setItem('lastIdeaSaveTime', Date.now().toString())
      lastIdeaSaveTime.value = Date.now()

      lastSavedIdea.value = ideaTrimmed
      ideaSaved.value = true
      appState.value = 'thankYou'
    } catch (error) {
      console.error('Error guardando idea:', error)
      alert('Error al guardar la idea.')
    } finally {
      loading.value = false
    }
  }

  const goToMyIdeas = async () => {
    await loadMyIdeas()
    appState.value = 'myIdeas'
  }

  const goToCommunity = async () => {
    await loadCommunityIdeas()
    appState.value = 'community'
  }

  const deleteIdea = async (ideaId: string) => {
    try {
      await deleteDoc(doc(db, 'ideas', ideaId))
      myIdeas.value = myIdeas.value.filter(idea => idea.id !== ideaId)
    } catch (error) {
      console.error('Error eliminando idea:', error)
      alert('Error al eliminar la idea.')
    }
  }

  // Cargar ideas desde Firestore
  const loadIdeasFromFirestore = async () => {
    const authStore = useAuthStore()
    
    if (!authStore.user) {
      loadIdeasFromLocalStorage()
      return
    }

    try {
      loading.value = true
      const q = query(
        collection(db, 'ideas'),
        where('userId', '==', authStore.user.uid),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      let latestTime = 0
      
      // Mapear directamente a StoredIdea[]
      myIdeas.value = querySnapshot.docs.map(doc => {
        const data = doc.data()
        if (data.createdAt && data.createdAt.toMillis() > latestTime) {
          latestTime = data.createdAt.toMillis()
        }
        return {
          id: doc.id,
          idea: data.idea,
          userId: data.userId,
          userEmail: data.userEmail,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt.toDate()
        } as StoredIdea
      })
      
      if (latestTime > 0) {
        lastIdeaSaveTime.value = latestTime
      }
      
      checkIfCanGenerateNewIdea()
    } catch (error) {
      console.error('Error cargando ideas:', error)
      loadIdeasFromLocalStorage()
    } finally {
      loading.value = false
    }
  }

  loadIdeasFromLocalStorage()

  const discardIdea = () => {
    currentIdea.value = ''
    ideaSaved.value = true
    appState.value = 'initial'
  }

  // Agregar esta función antes del return
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

      // Limpiar myIdeas
      myIdeas.value = []
      localStorage.removeItem('ideasAprobadas')
      localStorage.removeItem('lastIdeaSaveTime')
      lastIdeaSaveTime.value = 0
    } catch (error) {
      console.error('Error borrando ideas:', error)
      alert('Error al borrar las ideas.')
    } finally {
      loading.value = false
    }
  }

  const toggleListCollapse = () => {
    isListCollapsed.value = !isListCollapsed.value
  }

  return {
  // Estado - Generación
  currentIdea,
  ideaSaved,
  appState,
  loading,
  lastSavedIdea,
  isListCollapsed,
  lastIdeaSaveTime,
  
  // Estado - Computed (esto elimina los warnings)
  canGenerateNewIdea,
  getTimeUntilNextIdea,
  getRecentIdeas,
  
  // Estado - Datos
  myIdeas,
  communityIdeas,
  
  // Métodos
  generateIdea,
  saveIdea,
  loadMyIdeas,
  loadCommunityIdeas,
  loadIdeasFromFirestore,  // ← Esto elimina el warning
  loadIdeasFromLocalStorage,
  goToMyIdeas,
  goToCommunity,
  deleteIdea,
  discardIdea,
  clearIdeas,
  toggleListCollapse,
}
})
