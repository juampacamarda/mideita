import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

export const useIdeasStore = defineStore('ideas', () => {
  const currentIdea = ref<string>('')
  const savedIdeas = ref<string[]>([])
  const usedCombinations = ref<Set<string>>(new Set())
  const ideaSaved = ref(true)
  const lastIdeaSaveTime = ref<number>(0)
  const appState = ref<'initial' | 'generated' | 'thankYou' | 'myIdeas' | 'waitingNextIdea'>('initial')
  const isListCollapsed = ref(true)

  // Load saved ideas from localStorage
  const loadIdeas = () => {
    const stored = localStorage.getItem('ideasAprobadas')
    if (stored) {
      savedIdeas.value = JSON.parse(stored)
    }
    
    const savedTime = localStorage.getItem('lastIdeaSaveTime')
    if (savedTime) {
      lastIdeaSaveTime.value = parseInt(savedTime)
    }

    // Verificar si puede generar nueva idea
    checkIfCanGenerateNewIdea()
  }

  const checkIfCanGenerateNewIdea = () => {
    if (lastIdeaSaveTime.value === 0) {
      appState.value = 'initial'
      return
    }

    const now = Date.now()
    const twentyFourHoursMs = 24 * 60 * 60 * 1000
    const timeSinceLastIdea = now - lastIdeaSaveTime.value

    if (timeSinceLastIdea >= twentyFourHoursMs) {
      appState.value = 'initial'
    } else {
      appState.value = 'waitingNextIdea'
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

  const generateIdea = () => {
    if (!ideaSaved.value) {
      alert('Por favor, guarda o descarta la idea actual antes de generar una nueva.')
      return
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
    ideaSaved.value = false
    appState.value = 'generated'
  }

  const saveIdea = () => {
    if (currentIdea.value) {
      savedIdeas.value.push(currentIdea.value)
      lastIdeaSaveTime.value = Date.now()
      localStorage.setItem('ideasAprobadas', JSON.stringify(savedIdeas.value))
      localStorage.setItem('lastIdeaSaveTime', lastIdeaSaveTime.value.toString())
      currentIdea.value = ''
      ideaSaved.value = true
      appState.value = 'thankYou'
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

  const clearIdeas = () => {
    if (confirm('¿Estás seguro de que quieres borrar todas las ideas?')) {
      savedIdeas.value = []
      localStorage.removeItem('ideasAprobadas')
    }
  }

  const toggleListCollapse = () => {
    isListCollapsed.value = !isListCollapsed.value
  }

  loadIdeas()

  return {
    currentIdea,
    savedIdeas,
    appState,
    isListCollapsed,
    getTimeUntilNextIdea,
    getRecentIdeas,
    generateIdea,
    saveIdea,
    discardIdea,
    clearIdeas,
    goToMyIdeas,
    toggleListCollapse
  }
})
