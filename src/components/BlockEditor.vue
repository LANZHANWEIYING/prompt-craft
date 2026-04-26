<script setup>
const props = defineProps({
  block: { type: Object, default: null }
})
const emit = defineEmits(['update', 'cancel'])

const updateBlock = () => {
  emit('update', props.block)
}
const cancelEdit = () => {
  emit('cancel')
}
</script>

<template>
  <div class="block-editor" v-if="block">
    <h4>{{ block.label }}</h4>
    <el-input
      type="textarea"
      v-model="block.content"
      rows="5"
      placeholder="输入内容，支持变量 {{variable}}"
    />
    <div class="editor-actions">
      <el-button @click="updateBlock">保存</el-button>
      <el-button @click="cancelEdit">取消</el-button>
    </div>
  </div>
  <div class="no-selection" v-else>点击画布中的块进行编辑</div>
</template>

<style scoped>
.block-editor {
  margin-bottom: 16px;
}
.editor-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.no-selection {
  color: #999;
  padding: 16px 0;
}
</style>
