import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'
import BuilderView from '../views/BuilderView.vue'
import TemplatesView from '../views/TemplatesView.vue'

const routes = [
  { path: '/', name: 'Chat', component: ChatView },
  { path: '/builder', name: 'Builder', component: BuilderView },
  { path: '/templates', name: 'Templates', component: TemplatesView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
