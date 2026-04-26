<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'send'])

const inputText = ref(props.modelValue)

const handleInput = (e) => {
  const val = e.target.value
  inputText.value = val
  emit('update:modelValue', val)
}
const sendMessage = () => {
  if (!inputText.value.trim() || props.disabled) return
  emit('send')
}
const handleKeyDown = (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault()
    sendMessage()
  }
}
watch(
  () => props.modelValue,
  (nv) => {
    inputText.value = nv
  }
)
</script>

<template>
  <div class="input-area">
    <textarea
      v-model="inputText"
      @input="handleInput"
      @keydown="handleKeyDown"
      :disabled="disabled"
      placeholder="这里输入你想问的，Ctrl+Enter发送哦"
    ></textarea>
    <button @click="sendMessage" :disabled="!inputText.trim() || disabled">
      发送
    </button>
  </div>
</template>

<style scoped>
.input-area {
  display: flex;
  flex-shrink: 0; /* 关键：防止被压缩，固定在底部 */
  padding: 12px 20px;
  background-color: #fff;
  border-top: 1px solid #e4e6eb;
  gap: 12px;
}
textarea {
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid #ddd;
  resize: none;
  height: 42px;
  font-family: inherit;
}
button {
  padding: 0 24px;
  background: #1b83f2;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
}
button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
