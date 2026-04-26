<script setup>
import { onMounted } from 'vue'
import { useTemplateStore } from './stores/templates'

const templateStore = useTemplateStore()
onMounted(() => {
  templateStore.loadFromLocal()
})
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Prompt Craft</h1>
      <nav class="app-nav">
        <router-link to="/">聊天</router-link>
        <router-link to="/builder">构建器</router-link>
        <router-link to="/templates">模板</router-link>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* 禁止全局滚动，让各组件自己管理滚动 */
}
</style>

<style scoped>
/* 组件内部样式 */
.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.app-header {
  height: 60px;
  flex-shrink: 0;
  background-color: #fff;
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.app-nav {
  display: flex;
  gap: 20px;
}
.app-nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
}
.app-nav a:hover {
  background-color: #f0f0f0;
}
.app-nav a.router-link-active {
  color: #1b83f2;
  background-color: #e6f0ff;
}
.app-main {
  flex: 1;
  overflow: auto; /* 如果组件内部不需要滚动，这里可以 auto，但 ChatView 会自己管理 */
  padding: 0; /* 确保没有内边距 */
}
</style>
