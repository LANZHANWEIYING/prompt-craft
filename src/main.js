import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router' // 确保路径正确

const app = createApp(App)
app.use(createPinia())
app.use(router) // 必须 use
app.use(ElementPlus)
app.mount('#app')
