<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}

</script>

<template>

  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <!-- Encabezado -->
        <div class="d-flex flex-wrap align-items-center gap-3 mb-5">
          <button 
            class="btn btn-sm btn-outline-dark rounded-pill"
            @click="goBack"
          >
            <i class="fas fa-arrow-left"></i> <span class="d-none d-md-block">Atrás</span>
          </button>
          <h2 class="mb-0 text-center d-block" style="width: 84%;">Qué Es Mideita</h2>
        </div>
        <div class="row align-items-center">
          <div class="col-md-4">
            <img src="../assets/llamitafull.png" class="llamalg img-fluid d-none d-md-block mx-auto" alt="Logo de Mideita" />
            <img src="../assets/llamita02.png" class="llamamobile img-fluid d-block d-md-none mx-auto mb-3" alt="Logo de Mideita" style="height: 300px;" />
          </div>
          <div class="col-md-8 d-flex flex-column align-items-center">
            <p class="about"> Mideita te ayuda a encontrar ideas creativas y divertidas en segundos. Con un clic generas combinaciones originales (animal + caracterización + acción), las guardas si te gustan y puedes subir imágenes para acompañarlas. 
              <br><br> Inspirado en nuestra fauna autóctona: usamos animales emblemáticos de Argentina —llamas, yaguaretés, carpinchos, tucanes y muchas especies más— para darle identidad y color local a cada idea. Cada combinación celebra nuestra naturaleza y te invita a imaginar con sabor propio. 
              <br><br> Perfecto para ilustradores: si eres ilustrador o amante del diseño, Mideita es una herramienta pensada para disparar tu creatividad: genera personajes, escenas y retos visuales en segundos para que los desarrolles como bocetos, series o proyectos personales.
               <br><br> Para subir imágenes a una idea debes iniciar sesión con Google. 
               <br><br> Usa el botón "Generar idea" para inspirarte, guarda las que prefieras y explora tu galería personal o la comunidad para ver ideas de otros usuarios. Inicia sesión con Google para sincronizar tus ideas entre dispositivos; si no quieres, las ideas también se guardan localmente en tu navegador. 
               <br><br> Es una herramienta pensada para jugar, crear y compartir — simple, rápida y lista para inspirarte. ¡A generar! 
          
          </p>




          </div>

        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
  .llamalg {
    width: auto;
    max-width: 300px;
    height: 450px;
  }
  p.about{
    font-size: 18px;
  }
</style>