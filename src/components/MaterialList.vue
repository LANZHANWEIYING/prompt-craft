<script setup>
const props = defineProps({
  materials: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['dragstart'])

const handleDragStart = (event, item) => {
  emit('dragstart', event, item)
}
</script>

<template>
  <div class="material-list">
    <h3>物料</h3>
    <div
      v-for="item in materials"
      :key="item.type"
      class="material"
      draggable="true"
      @dragstart="handleDragStart($event, item)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<style scoped>
.material-list {
  padding: 16px;
}

.material {
  padding: 8px;
  margin: 8px 0;
  background: #f0f0f0;
  cursor: grab;
  border-radius: 4px;
  text-align: center;
}

.material:active {
  cursor: grabbing;
}
</style>
