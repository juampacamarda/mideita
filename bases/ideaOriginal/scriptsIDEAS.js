const animales = [
    "llama", "aguará guazú", "carpincho", "puma", "yaguareté", "guanaco", "tatú carreta", "huemul",
    "vicuña", "zorrito de monte", "tapir", "monito de monte", "coendú", "ñandú", "mará", "zorro colorado",
    "coatí", "margay", "ocelote", "paca", "cuis", "yacaré", "huillín", "hurón menor", "mulita",
    "chinchillón", "lobito de río", "tucán", "cardenal amarillo", "ciervo de los pantanos"
];

const caracterizaciones = [
    "guerrero medieval", "policía", "oficinista", "jugador de fútbol", "albañil", "músico", "científico",
    "bombero", "astronauta", "superhéroe", "pirata", "chef", "pintor", "payaso", "bailarín", "mago",
    "detective", "explorador", "ninja", "repartidor", "profesor", "doctor", "ingeniero", "cazador",
    "vendedor ambulante", "granadero", "campesino", "artista", "jardinero", "escultor"
];

const acciones = [
    "comprando en el supermercado", "trabajando en una oficina", "caminando por el bosque", "leyendo un libro",
    "nadando en un lago", "cocinando una comida", "jugando al ajedrez", "tocando la guitarra", "pintando un cuadro",
    "escribiendo una carta", "arreglando un coche", "jugando con amigos", "cazando mariposas", "plantando un árbol",
    "paseando por el parque", "escalando una montaña", "durmiendo en una hamaca", "construyendo una casa",
    "volando una cometa", "sacando fotos", "cantando en un karaoke", "dibujando en un cuaderno", "bailando en una fiesta",
    "lavando los platos", "limpiando la casa", "haciendo yoga", "pescando en un río", "tomando un café",
    "haciendo ejercicio", "andando en bicicleta"
];

const combinacionesUsadas = new Set();
let ultimaIdea = '';
let ideaGuardada = true;

function cargarIdeasAprobadas() {
    const ideasAprobadas = JSON.parse(localStorage.getItem('ideasAprobadas')) || [];
    const smallElement = document.querySelector('.seleccionadas');
    smallElement.innerHTML = ideasAprobadas.map(idea => `<p>${idea}</p>`).join('');
}

function guardarIdeasAprobadas(idea) {
    const ideasAprobadas = JSON.parse(localStorage.getItem('ideasAprobadas')) || [];
    ideasAprobadas.push(idea);
    localStorage.setItem('ideasAprobadas', JSON.stringify(ideasAprobadas));
}

function generarIdea() {
    if (!ideaGuardada) {
        alert("Por favor, guarda o descarta la idea actual antes de generar una nueva.");
        return;
    }

    if (combinacionesUsadas.size === animales.length * caracterizaciones.length * acciones.length) {
        combinacionesUsadas.clear();
    }

    let nuevaCombinacion;
    do {
        const animal = animales[Math.floor(Math.random() * animales.length)];
        const caracterizacion = caracterizaciones[Math.floor(Math.random() * caracterizaciones.length)];
        const accion = acciones[Math.floor(Math.random() * acciones.length)];
        nuevaCombinacion = `Un ${animal} vestido de ${caracterizacion} ${accion}.`;
    } while (combinacionesUsadas.has(nuevaCombinacion));

    combinacionesUsadas.add(nuevaCombinacion);
    ultimaIdea = nuevaCombinacion;
    ideaGuardada = false;
    document.getElementById("idea").innerText = nuevaCombinacion;
}

function guardarIdea() {
    if (ultimaIdea) {
        const smallElement = document.querySelector('.seleccionadas');
        smallElement.innerHTML += `<p>${ultimaIdea}</p>`;
        guardarIdeasAprobadas(ultimaIdea);
        ultimaIdea = '';
        ideaGuardada = true;
        document.getElementById("idea").innerText = '';
    }
}

function descartarIdea() {
    ultimaIdea = '';
    ideaGuardada = true;
    document.getElementById("idea").innerText = '';
}

function borrarIdeas() {
    localStorage.removeItem('ideasAprobadas');
    cargarIdeasAprobadas();
}

// Cargar las ideas aprobadas al iniciar
window.onload = cargarIdeasAprobadas;
