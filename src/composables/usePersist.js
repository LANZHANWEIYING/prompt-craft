// composables/usePersist.js
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 通用持久化管理
 * @param {string} key localStorage 键名
 * @param {any} defaultValue 默认值
 * @param {boolean} autoSave 是否自动监听变化保存
 * @returns {object} { data, save, load, clear, exportJson, importJson }
 */
export function usePersist(key, defaultValue = null, autoSave = true) {
  const data = ref(defaultValue)

  // 加载数据
  const load = () => {
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        data.value = JSON.parse(stored)
      } catch (e) {
        console.error(`解析 localStorage 键 "${key}" 失败`, e)
        data.value = defaultValue
      }
    } else {
      data.value = defaultValue
    }
  }

  // 保存数据
  const save = () => {
    localStorage.setItem(key, JSON.stringify(data.value))
    ElMessage.success(`已保存到本地`)
  }

  // 清除数据
  const clear = () => {
    data.value = defaultValue
    localStorage.removeItem(key)
    ElMessage.success(`已清空本地数据`)
  }

  // 导出为 JSON 文件
  const exportJson = () => {
    const jsonStr = JSON.stringify(data.value, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${key}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success(`导出成功`)
  }

  // 导入 JSON 文件
  const importJson = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)
        data.value = imported
        save() // 导入后自动保存
        ElMessage.success(`导入成功`)
      } catch (err) {
        ElMessage.error(`解析 JSON 失败：${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  // 自动保存监听
  if (autoSave) {
    watch(
      data,
      () => {
        localStorage.setItem(key, JSON.stringify(data.value))
      },
      { deep: true }
    )
  }

  // 初始化加载
  load()

  return {
    data,
    save,
    load,
    clear,
    exportJson,
    importJson
  }
}
