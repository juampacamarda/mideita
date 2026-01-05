<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useIdeasStore } from '../stores/ideaStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const ideaStore = useIdeasStore()
const router = useRouter()
const showUserMenu = ref(false)

const handleLogin = async () => {
  try {
    await authStore.loginWithGoogle()
  } catch (error) {
    console.error('Error en login:', error)
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    showUserMenu.value = false
  } catch (error) {
    console.error('Error en logout:', error)
  }
}

const goToGallery = () => {
  router.push('/galeria')
  showUserMenu.value = false
}

// Watcher para cargar ideas cuando cambia el estado de login
watch(() => authStore.isLoggedIn, async (isLoggedIn) => {
  if (isLoggedIn) {
    console.log('🔄 Usuario logueado, cargando ideas desde Firestore...')
    await ideaStore.loadIdeasFromFirestore()
  } else {
    console.log('🔄 Usuario deslogueado, cargando ideas desde localStorage...')
    ideaStore.loadIdeasFromLocalStorage()
  }
})
</script>

<template>
  <header id="ideaHeader">
    <div class="container-fluid">
      <nav class="navbar navbar-expand-lg">
        <RouterLink to="/" class="navbar-brand ideaLogo">
          <img src="../assets/logoheader.png" alt="" class="img-fluid">
          <span class="d-none">Mideita</span>
        </RouterLink>
        
        <!-- Botón hamburguesa para móvil -->
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Contenido colapsable -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <RouterLink to="/" class="nav-link">Home</RouterLink>
            </li>
            <li class="nav-item">
            <RouterLink to="/about" class="nav-link">Qué es Mideita</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/comunidad" class="nav-link">Explorar Ideas</RouterLink>
            </li>

            <!-- Si NO está logueado: mostrar botón Login -->
            <li class="nav-item" v-if="!authStore.isLoggedIn">
              <button
                class="nav-link"
                @click="handleLogin"
                :disabled="authStore.loading"
                style="color: blue;"
              >
                <i class="fa-solid fa-lock"></i>
                {{ authStore.loading ? 'Cargando...' : 'Inicia Sesión' }}
              </button>
            </li>

            <!-- Si ESTÁ logueado: mostrar menú de usuario -->
            <li class="nav-item dropdown" v-else>
              <button
                class="nav-link btn btn-link d-flex align-items-center gap-2 dropdown-toggle"
                @click="showUserMenu = !showUserMenu"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span><i class="fas fa-user"></i> {{ authStore.user?.displayName?.split(' ')[0] }}</span>
                <i :class="showUserMenu ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
              </button>

              <!-- Menú desplegable -->
              <ul class="dropdown-menu" :class="{ show: showUserMenu }">
                <li>
                  <a href="#" class="dropdown-item" @click.prevent>
                    <i class="fas fa-envelope"></i> {{ authStore.user?.email }}
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
            <li>
                  <a
                    href="#"
                    class="dropdown-item"
                    @click.prevent="goToGallery"
                  >
                    <i class="fas fa-image"></i> Mi Galería
                  </a>
                </li>
                <li>
                  <Router-link to="/admin-ideas" class="dropdown-item">
                    <i class="fas fa-list"></i> Ideas Guardadas
                  </Router-link>
                </li>
                <li>
                  <button
                    class="dropdown-item text-danger w-100 text-start"
                    @click="handleLogout"
                    :disabled="authStore.loading"
                  >
                    <i class="fas fa-door-open"></i>
                    {{ authStore.loading ? 'Cerrando sesión...' : ' Logout' }}
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.dropdown-toggle::after{
  display:none;
}
#ideaHeader {
  background-color: #fff;
  border-bottom: 1px solid #ddd;
}

.navbar-brand {
  font-weight: bold;
  cursor: pointer;
}

.navbar-brand img {
  height: 80px;
}

.nav-link{
  color:#FF9500;
  font-size: 18px;
  font-weight:400;
  letter-spacing: 1px;

}

.nav-link.btn {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.nav-link.btn:hover {
  color: #FF9500;
}

.nav-link.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  padding: 0.5rem 0;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.dropdown-item {
  display: block;
  padding: 0.5rem 1rem;
  color: #333;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
  color: #FF9500;
}

.dropdown-item.text-danger:hover {
  background-color: #fee;
  color: #d32f2f;
}

.dropdown-divider {
  margin: 0.5rem 0;
  border: 0;
  border-top: 1px solid #ddd;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}

.w-100 {
  width: 100%;
}

.text-start {
  text-align: left;
}

.text-danger {
  color: #d32f2f;
}

.nav-link:hover,
a.router-link-active.nav-link {
    color: #397397;
    font-weight: 700;
}

@media (min-width: 991px) {
  .navbar-expand-lg .navbar-nav .dropdown-menu {
    right: unset !important;
    left: -50px!important;
  }
}
</style>