<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  data: { type: [Object, Array], default: () => ({}) }
})

const jsonOutput = computed(() => JSON.stringify(props.data, null, 2))

const copyJson = () => {
  const jsonText = jsonOutput.value
  navigator.clipboard
    .writeText(jsonText)
    .then(() => ElMessage.success('JSON 已复制到剪贴板'))
    .catch(() => ElMessage.error('复制失败，请手动复制'))
}
</script>

<template>
  <div class="json-output">
    <h4>生成的 Prompt JSON</h4>
    <pre>{{ jsonOutput }}</pre>
    <el-button @click="copyJson">复制 JSON</el-button>
  </div>
</template>

<style scoped>
.json-output {
  margin-top: 16px;
}
pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  overflow: auto;
  max-height: 200px;
  margin-bottom: 8px;
}
</style>
