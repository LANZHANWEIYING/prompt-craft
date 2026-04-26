import { defineStore } from 'pinia'

const STORAGE_KEY = 'prompt-craft-templates'

export const useTemplateStore = defineStore('templates', {
  state: () => ({
    templates: []
  }),
  actions: {
    loadFromLocal() {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.templates = JSON.parse(stored)
      } else {
        // 默认模板
        this.templates = [
          {
            id: 1,
            name: '代码解释',
            prompt: '请解释以下代码:\n{{code}}',
            category: '编程'
          },
          {
            id: 2,
            name: '文章总结',
            prompt: '请用三句话总结:\n{{text}}',
            category: '写作'
          }
        ]
        this.saveToLocal()
      }
    },
    saveToLocal() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.templates))
    },
    addTemplate(template) {
      this.templates.push({ id: Date.now(), ...template })
      this.saveToLocal()
    },
    deleteTemplate(id) {
      this.templates = this.templates.filter((t) => t.id !== id)
      this.saveToLocal()
    },
    updateTemplate(id, data) {
      const index = this.templates.findIndex((t) => t.id === id)
      if (index !== -1) {
        this.templates[index] = { ...this.templates[index], ...data }
        this.saveToLocal()
      }
    }
  }
})
