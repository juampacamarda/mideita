import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db, auth } from './firebase'
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy, limit, updateDoc } from 'firebase/firestore'
// REMOVER ESTA LÍNEA: import { useAuthStore } from './authStore'

// Tipos
export interface StoredIdea {
  id: string
  idea: string
  userId: string
  userEmail: string
  authorName: string
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
// const SKIP_24H_RESTRICTION = true

export const useIdeasStore = defineStore('ideas', () => {
  // Estado para generación de ideas
  const currentIdea = ref<string>('')
  const usedCombinations = ref<Set<string>>(new Set())
  const ideaSaved = ref(true)
  const lastIdeaSaveTime = ref<number>(0)
  const appState = ref<'initial' | 'generated' | 'thankYou' | 'myIdeas' | 'community' | 'userGallery'>('initial')
  const isListCollapsed = ref(true)
  const loading = ref(false)
  const lastSavedIdea = ref<string>('')
  const ideasGeneratedToday = ref<number>(0)

  // Estado para mis ideas (del usuario actual)
  const myIdeas = ref<StoredIdea[]>([])

  // Estado para ideas de la comunidad (todas)
  const communityIdeas = ref<StoredIdea[]>([])

  // Cargar contador de ideas del día
  const loadDailyIdeasCount = () => {
    const today = new Date().toDateString()
    const stored = localStorage.getItem('ideasGeneratedToday')
    const storedDate = localStorage.getItem('ideasGeneratedTodayDate')
    
    if (storedDate === today) {
      ideasGeneratedToday.value = parseInt(stored || '0')
    } else {
      // Nuevo día: reiniciar contador
      ideasGeneratedToday.value = 0
      localStorage.setItem('ideasGeneratedTodayDate', today)
      localStorage.setItem('ideasGeneratedToday', '0')
    }
  }

  const incrementDailyIdeasCount = () => {
    ideasGeneratedToday.value++
    localStorage.setItem('ideasGeneratedToday', ideasGeneratedToday.value.toString())
  }

  // Query: Cargar MIS IDEAS (solo del usuario)
  const loadMyIdeas = async () => {
    const { useAuthStore } = await import('./authStore')
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
    loadDailyIdeasCount()
    
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

  const checkIfCanGenerateNewIdea = async () => {
    const { useAuthStore } = await import('./authStore')
    const authStore = useAuthStore()
    
    // Invitados: sin restricción 24h
    if (!authStore.isLoggedIn) {
      appState.value = 'initial'
      return
    }
    
    // Usuarios logueados: solo validan limite diario (10/día) en saveIdea()
    appState.value = 'initial'
  }

  const canGenerateNewIdea = computed(() => {
    const currentUser = auth.currentUser
    
    // Usuarios logueados: limitan a 10/día
    if (currentUser) {
      return ideasGeneratedToday.value < 10
    }
    
    // Invitados: siempre pueden generar
    return true
  })

  const getRecentIdeas = computed(() => {
    return myIdeas.value.slice(0, 7)
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
    const { useAuthStore } = await import('./authStore')
    const authStore = useAuthStore()
    
    if (!currentIdea.value) return

    // Límite de ideas por día para logueados
    if (authStore.isLoggedIn && ideasGeneratedToday.value >= 10) {
      alert('Has alcanzado el límite de 10 ideas por día. Intenta mañana.')
      return
    }

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

      const ideaData = {
        idea: ideaTrimmed,
        userId: authStore.user?.uid || 'guest',
        userEmail: authStore.user?.email || 'guest@example.com',
        authorName: authStore.user?.displayName || authStore.user?.email || 'Anónimo',
        imageUrl: imageUrl || null,
        createdAt: new Date()
      }

      // Si está logueado: guardar en Firestore
      if (authStore.isLoggedIn) {
        const docRef = await addDoc(collection(db, 'ideas'), ideaData)
        
        myIdeas.value.unshift({
          id: docRef.id,
          ...ideaData
        } as StoredIdea)

        // Incrementar contador diario
        incrementDailyIdeasCount()
      } else {
        // Sin login: guardar solo en localStorage
        const stored = localStorage.getItem('ideasAprobadas')
        const ideas = stored ? JSON.parse(stored) : []
        ideas.push(ideaTrimmed)
        localStorage.setItem('ideasAprobadas', JSON.stringify(ideas))

        myIdeas.value.unshift({
          id: `local_${Date.now()}`,
          ...ideaData
        } as StoredIdea)
      }

      localStorage.setItem('lastIdeaSaveTime', Date.now().toString())
      lastIdeaSaveTime.value = Date.now()

      lastSavedIdea.value = ideaTrimmed
      ideaSaved.value = true
      appState.value = 'thankYou'

      // Después de guardar exitosamente, recarga las ideas para sincronizar
      if (authStore.isLoggedIn) {
        await loadMyIdeas()
      }
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

  // Cargar ideas desde Firestore
  const loadIdeasFromFirestore = async () => {
    const { useAuthStore } = await import('./authStore')
    const authStore = useAuthStore()
    
    loadDailyIdeasCount()

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
      
      await checkIfCanGenerateNewIdea()
    } catch (error) {
      console.error('Error cargando ideas:', error)
      loadIdeasFromLocalStorage()
    } finally {
      loading.value = false
    }
  }

  // Llamar una vez al inicializar
  // loadIdeasFromLocalStorage()

  const discardIdea = () => {
    currentIdea.value = ''
    ideaSaved.value = true
    appState.value = 'initial'
  }

  const clearIdeas = async () => {
    const { useAuthStore } = await import('./authStore')
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

  // SECCIÓN 1: Actualizar uploadIdeaWithImage para agregar tag con ideaId
  const uploadIdeaWithImage = async (file: File): Promise<boolean> => {
    const { useAuthStore } = await import('./authStore')
    const authStore = useAuthStore()
    
    if (!authStore.user) {
      alert('Debes estar logueado para subir imágenes')
      return false
    }

    if (!lastSavedIdea.value) {
      alert('No hay idea guardada')
      return false
    }

    try {
      loading.value = true

      const ideaToUpdate = myIdeas.value.find(idea => idea.idea === lastSavedIdea.value)
      
      // Validar que la idea no tenga ya una imagen
      if (ideaToUpdate?.imageUrl) {
        alert('Esta idea ya tiene una imagen. Solo puedes subir una imagen por idea.')
        loading.value = false
        return false
      }

      // 1. Subir imagen a Cloudinary CON TAG del ideaId
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'mideita_upload')
      // Tag con el ideaId para identificar y limpiar después
      formData.append('tags', `idea_${ideaToUpdate?.id}`)

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dvfrbmxor/image/upload',
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error('Error al subir a Cloudinary')
      }

      const data = await response.json()
      const imageUrl = data.secure_url

      // 2. Actualizar la idea guardada con la URL de la imagen
      if (ideaToUpdate) {
        await updateDoc(doc(db, 'ideas', ideaToUpdate.id), {
          imageUrl: imageUrl
        })

        // Actualizar localmente
        ideaToUpdate.imageUrl = imageUrl
      }

      alert('Imagen subida exitosamente')
      return true

    } catch (error) {
      console.error('Error subiendo imagen:', error)
      alert('Error al subir la imagen')
      return false
    } finally {
      loading.value = false
    }
  }

  // SECCIÓN 2: Actualizar deleteIdea para manejar invitados (localStorage) y usuarios (Firestore)
  const deleteIdea = async (ideaId: string) => {
    try {
      // 1. Obtener la idea a borrar
      const ideaToDelete = myIdeas.value.find(idea => idea.id === ideaId)
      
      // 2. Verificar si es un ID local (invitado)
      if (ideaId.startsWith('local_')) {
        // INVITADOS: Borrar de localStorage
        const stored = localStorage.getItem('ideasAprobadas')
        if (stored) {
          const ideas = JSON.parse(stored)
          // Filtrar la idea por su texto exacto
          const updatedIdeas = ideas.filter((idea: string) => idea !== ideaToDelete?.idea)
          localStorage.setItem('ideasAprobadas', JSON.stringify(updatedIdeas))
        }
        
        // Actualizar array local
        myIdeas.value = myIdeas.value.filter(idea => idea.id !== ideaId)
        console.log('✅ Idea de invitado eliminada de localStorage')
      } else {
        // USUARIOS LOGUEADOS: Borrar de Firestore
        // Si tiene imagen, registrar para limpieza posterior
        if (ideaToDelete?.imageUrl) {
          console.log(`🗑️ Imagen marcada para limpieza (tag: idea_${ideaId})`)
          // La Cloud Function de Firebase se encargará de eliminar
          // todas las imágenes etiquetadas con idea_${ideaId} de Cloudinary
        }
        
        // Borrar la idea de Firestore
        await deleteDoc(doc(db, 'ideas', ideaId))
        myIdeas.value = myIdeas.value.filter(idea => idea.id !== ideaId)
        
        console.log('✅ Idea eliminada correctamente (imagen se limpiará en 24h)')
      }
    } catch (error) {
      console.error('❌ Error eliminando idea:', error)
      alert('Error al eliminar la idea.')
    }
  }

  return {
    // Estados
    currentIdea,
    usedCombinations,
    ideaSaved,
    lastIdeaSaveTime,
    appState,
    isListCollapsed,
    loading,
    lastSavedIdea,
    ideasGeneratedToday,
    myIdeas,
    communityIdeas,

    // Computed
    // getTimeUntilNextIdea,
    getRecentIdeas,
    canGenerateNewIdea,

    // Acciones
    generateIdea,
    saveIdea,
    discardIdea,
    goToMyIdeas,
    goToCommunity,
    deleteIdea,
    clearIdeas,
    toggleListCollapse,
    loadMyIdeas,
    loadCommunityIdeas,
    loadIdeasFromLocalStorage,
    loadIdeasFromFirestore,
    uploadIdeaWithImage,

    // Función de inicialización que llaman los componentes
    initialize: () => {
      loadIdeasFromLocalStorage()
    }
  }
})