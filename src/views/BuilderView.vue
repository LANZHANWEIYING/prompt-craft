<script setup>
import { ref, onMounted } from 'vue'
import MaterialList from '../components/MaterialList.vue'
import BlockEditor from '../components/BlockEditor.vue'
import JsonOutput from '../components/JsonOutput.vue'
import { usePersist } from '../composables/usePersist'
import { ElMessage } from 'element-plus'

const materials = [
  { type: 'role', label: '角色定义' },
  { type: 'task', label: '任务描述' },
  { type: 'format', label: '输出格式' },
  { type: 'example', label: '少样本示例' }
]

// 使用持久化管理，key 为 'prompt-craft-builder'
const {
  data: blocks,
  save,
  clear,
  exportJson,
  importJson
} = usePersist('prompt-craft-builder', [])

const currentBlock = ref(null)
const editingBackup = ref(null)

// 拖拽添加
const dragStart = (e, item) => {
  e.dataTransfer.setData('text/plain', JSON.stringify(item))
}

const canvasRef = ref(null)

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.addEventListener('dragover', (e) => e.preventDefault())
  canvas.addEventListener('drop', (e) => {
    e.preventDefault()
    const rawData = e.dataTransfer.getData('text/plain')
    if (!rawData) return
    const material = JSON.parse(rawData)
    const newBlock = {
      id: Date.now(),
      type: material.type,
      label: material.label,
      content: ''
    }
    blocks.value.push(newBlock)
  })
})

// 编辑、删除、更新
const editBlock = (block) => {
  editingBackup.value = JSON.parse(JSON.stringify(block))
  currentBlock.value = block
}

const removeBlock = (block) => {
  blocks.value = blocks.value.filter((b) => b.id !== block.id)
  if (currentBlock.value?.id === block.id) {
    currentBlock.value = null
    editingBackup.value = null
  }
}

const updateBlock = () => {
  editingBackup.value = null
  currentBlock.value = null
}

const cancelEdit = () => {
  if (editingBackup.value && currentBlock.value) {
    Object.assign(currentBlock.value, editingBackup.value)
  }
  currentBlock.value = null
  editingBackup.value = null
}

// 上下移动排序
const moveUp = (index) => {
  if (index > 0) {
    const temp = blocks.value[index]
    blocks.value[index] = blocks.value[index - 1]
    blocks.value[index - 1] = temp
  }
}
const moveDown = (index) => {
  if (index < blocks.value.length - 1) {
    const temp = blocks.value[index]
    blocks.value[index] = blocks.value[index + 1]
    blocks.value[index + 1] = temp
  }
}

// 导入文件触发
const fileInputRef = ref(null)
const handleImport = () => {
  fileInputRef.value.click()
}
const onFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    importJson(file)
  }
  fileInputRef.value.value = '' // 清空，允许重复导入同一文件
}
</script>

<template>
  <div class="builder">
    <div class="sidebar">
      <MaterialList :materials="materials" @dragstart="dragStart" />
    </div>

    <div class="canvas" ref="canvasRef">
      <div class="canvas-header">
        <h3>编排画布</h3>
        <div class="persist-buttons">
          <el-button size="small" @click="save">保存</el-button>
          <el-button size="small" @click="clear" type="danger">清空</el-button>
          <el-button size="small" @click="exportJson">导出</el-button>
          <el-button size="small" @click="handleImport">导入</el-button>
          <input
            type="file"
            ref="fileInputRef"
            style="display: none"
            accept=".json"
            @change="onFileChange"
          />
        </div>
      </div>
      <div class="canvas-list">
        <div v-for="(block, idx) in blocks" :key="block.id" class="block">
          <div class="block-header">
            <strong>{{ block.label }}</strong>
            <el-button size="small" @click="editBlock(block)">编辑</el-button>
            <el-button size="small" @click="removeBlock(block)">删除</el-button>
            <el-button size="small" @click="moveUp(idx)" :disabled="idx === 0"
              >↑</el-button
            >
            <el-button
              size="small"
              @click="moveDown(idx)"
              :disabled="idx === blocks.length - 1"
              >↓</el-button
            >
          </div>
          <div class="block-content">
            {{ block.content || '点击编辑内容' }}
          </div>
        </div>
      </div>
    </div>

    <div class="property-panel">
      <h3>属性</h3>
      <BlockEditor
        :block="currentBlock"
        @update="updateBlock"
        @cancel="cancelEdit"
      />
      <el-divider />
      <JsonOutput :data="blocks" />
    </div>
  </div>
</template>

<style scoped>
.builder {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 200px;
  border-right: 1px solid #ccc;
}
.canvas {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.canvas-list {
  min-height: 400px;
}
.block {
  background: white;
  border: 1px solid #ddd;
  margin-bottom: 12px;
  border-radius: 8px;
}
.block-header {
  padding: 8px;
  background: #f5f5f5;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 8px;
  align-items: center;
}
.block-content {
  padding: 12px;
  color: #666;
}
.property-panel {
  width: 300px;
  border-left: 1px solid #ccc;
  padding: 16px;
  overflow-y: auto;
}
.persist-buttons {
  display: flex;
  gap: 8px;
}
</style>
