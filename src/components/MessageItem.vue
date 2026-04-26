<script setup>
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  }
})

const props = defineProps({
  message: { type: Object, required: true }
})

const renderMarkdown = (text) => marked.parse(text)
</script>

<template>
  <div :class="['message', message.role]">
    <div class="avatar">{{ message.role === 'user' ? '👤' : '🤖' }}</div>
    <div class="content" v-html="renderMarkdown(message.content)"></div>
  </div>
</template>

<style scoped>
.message {
  display: flex;
  margin-bottom: 8px;
}
.message.user {
  justify-content: flex-end; /* 整体靠右 */
}
.message.assistant {
  justify-content: flex-start; /* 整体靠左 */
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e4e6eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 12px;
  font-size: 20px;
  flex-shrink: 0;
}
.content {
  max-width: 70%;
  padding: 10px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

/* 用户消息：内容在左（绿色），头像在右（通过 order） */
.message.user .avatar {
  order: 2;
}
.message.user .content {
  order: 1;
  background-color: #dcf8c5;
  border-bottom-right-radius: 4px;
}

/* 助手消息：头像在左，内容在右（白色） */
.message.assistant .avatar {
  order: 1;
}
.message.assistant .content {
  order: 2;
  background-color: #ffffff;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
