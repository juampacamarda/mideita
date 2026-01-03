<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
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
</script>

<template>
  <header id="ideaHeader">
    <div class="container-fluid">
      <nav class="ideaNav navbar">
        <a href="#" @click.prevent class="navbar-brand ideaLogo">
          <span>Mideita</span>
        </a>
        <ul class="nav">
          <li class="nav-item">
            <a href="#" class="nav-link" @click.prevent>Home</a>
          </li>
          <li class="nav-item">
            <a href="#" class="nav-link" @click.prevent>Qué es Mideita</a>
          </li>

          <!-- Si NO está logueado: mostrar botón Login -->
          <li class="nav-item" v-if="!authStore.isLoggedIn">
            <button
              class="nav-link btn btn-link"
              @click="handleLogin"
              :disabled="authStore.loading"
            >
              {{ authStore.loading ? 'Cargando...' : '🔐 Inicia Sesión' }}
            </button>
          </li>

          <!-- Si ESTÁ logueado: mostrar menú de usuario -->
          <li class="nav-item dropdown" v-else>
            <button
              class="nav-link btn btn-link d-flex align-items-center gap-2"
              @click="showUserMenu = !showUserMenu"
            >
              <span>👤 {{ authStore.user?.displayName?.split(' ')[0] }}</span>
              <span>{{ showUserMenu ? '▲' : '▼' }}</span>
            </button>

            <!-- Menú desplegable -->
            <div v-if="showUserMenu" class="dropdown-menu show">
              <a href="#" class="dropdown-item" @click.prevent>
                📧 {{ authStore.user?.email }}
              </a>
              <hr class="dropdown-divider">
              <a href="#" class="dropdown-item" @click.prevent>
                🔒 Mis Ideas
              </a>
              <button
                class="dropdown-item text-danger w-100 text-start"
                @click="handleLogout"
                :disabled="authStore.loading"
              >
                {{ authStore.loading ? 'Cerrando sesión...' : '🚪 Logout' }}
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>

#ideaHeader {
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  padding: 0.5rem 0;
}

.navbar-brand {
  font-weight: bold;
  cursor: pointer;
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
</style>