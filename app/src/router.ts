import { createRouter, createWebHistory } from 'vue-router'
import IdeaGenerator from './screens/IdeaGenerator.vue'
import UserGallery from './screens/UserGallery.vue'
import GlobalGallery from './screens/GlobalGallery.vue'
import UserIdeaList from './screens/UserIdeaList.vue'

const routes = [
  {
    path: '/',
    component: IdeaGenerator,
    name: 'Home'
  },
  {
    path: '/comunidad',
    component: GlobalGallery,
    name: 'GlobalGallery'
  },
  {
    path: '/galeria',
    component: UserGallery,
    name: 'UserGallery'
  },
  {
    path: '/admin-ideas',
    component: UserIdeaList,
    name: 'UserIdeaList'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router