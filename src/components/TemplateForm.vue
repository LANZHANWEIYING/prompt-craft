<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  template: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'save'])

const dialogVisible = ref(props.visible)
const form = reactive({ name: '', category: '', prompt: '' })
const editingId = ref(null)

const resetForm = () => {
  editingId.value = null
  form.name = ''
  form.category = ''
  form.prompt = ''
}

// 监听 visible prop 变化
watch(
  () => props.visible,
  (newValue) => {
    dialogVisible.value = newValue
  }
)

// 监听 dialogVisible 变化，向父组件发出事件
watch(dialogVisible, (newValue) => {
  emit('update:visible', newValue)
})

// 监听模板变化，更新表单数据
watch(
  () => props.template,
  (newTemplate) => {
    if (newTemplate) {
      editingId.value = newTemplate.id
      form.name = newTemplate.name
      form.category = newTemplate.category
      form.prompt = newTemplate.prompt
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const saveTemplate = () => {
  emit('save', { id: editingId.value, ...form })
  resetForm()
}

const cancel = () => {
  dialogVisible.value = false
  resetForm()
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="editingId ? '编辑模板' : '新建模板'"
    @close="cancel"
  >
    <el-form :model="form">
      <el-form-item label="模板名称" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-input v-model="form.category"></el-input>
      </el-form-item>
      <el-form-item label="提示词" prop="prompt">
        <el-input v-model="form.prompt" type="textarea" rows="5"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="saveTemplate">保存</el-button>
    </template>
  </el-dialog>
</template>
