<script setup>
import { ref } from 'vue'
import { useTemplateStore } from '../stores/templates'
import { storeToRefs } from 'pinia'
import TemplateForm from '../components/TemplateForm.vue'

const templateStore = useTemplateStore()
const { templates } = storeToRefs(templateStore)

//dialogVisible: 控制弹窗显示
//currentTemplate:当前正在编辑的模板（null = 新增）
const dialogVisible = ref(false)
const currentTemplate = ref(null)

//编辑表单
const editTemplate = (row) => {
  currentTemplate.value = row
  dialogVisible.value = true
}

//新增模板
const addTemplate = () => {
  currentTemplate.value = null
  dialogVisible.value = true
}

//删除
const deleteTemplate = (row) => {
  templateStore.deleteTemplate(row.id)
}

//保存模板
const saveTemplate = (templateData) => {
  if (templateData.id) {
    templateStore.updateTemplate(templateData.id, {
      name: templateData.name,
      category: templateData.category,
      prompt: templateData.prompt
    })
  } else {
    templateStore.addTemplate({
      name: templateData.name,
      category: templateData.category,
      prompt: templateData.prompt
    })
  }
  dialogVisible.value = false
}
</script>
<template>
  <div class="templates">
    <el-button type="primary" @click="addTemplate">新增模板</el-button>
    <el-table :data="templates" style="width: 100%; margin-top: 20px">
      <el-table-column prop="name" label="模板名称" width="200" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column
        prop="prompt"
        label="提示词"
        width="300"
        show-overflow-tooltip
      />
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="primary" size="mini" link @click="editTemplate(row)"
            >编辑</el-button
          >
          <el-button type="danger" size="mini" link @click="deleteTemplate(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <TemplateForm
      v-model:visible="dialogVisible"
      :template="currentTemplate"
      @save="saveTemplate"
    />
  </div>
</template>
