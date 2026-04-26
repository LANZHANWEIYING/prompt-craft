<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { useChatStore } from '../stores/chat.js'
import { storeToRefs } from 'pinia'
import { streamChat } from '../api/request'
import { useTemplateStore } from '../stores/templates'
import { ElMessage, ElMessageBox } from 'element-plus'
import MessageItem from '../components/MessageItem.vue'
import ChatInput from '../components/ChatInput.vue'

const templateStore = useTemplateStore()
const { templates } = storeToRefs(templateStore)

const selectTemplate = (prompt) => {
  inputText.value = prompt
}

const chatStore = useChatStore()
const { sessions, currentSessionId, currentMessages } = storeToRefs(chatStore)

const isLoading = ref(false)
const inputText = ref('')
const messageListref = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    const container = messageListref.value
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value) return
  const userMsg = inputText.value
  inputText.value = ''
  scrollToBottom()

  chatStore.addMessage('user', userMsg)

  // 自动命名：如果当前会话没有标题，则用用户消息内容的前20字作为标题
  const currentSession = chatStore.sessions.find(
    (s) => s.id === currentSessionId.value
  )
  if (currentSession && (!currentSession.name || currentSession.name === '')) {
    let title = userMsg.trim()
    if (title.length > 20) title = title.slice(0, 20) + '...'
    chatStore.updateSessionName(currentSessionId.value, title)
  }

  scrollToBottom()
  isLoading.value = true
  chatStore.addMessage('assistant', '')
  const lastIndex = chatStore.currentMessages.length - 1

  try {
    await streamChat(
      chatStore.getConversationHistory(),
      (chunk) => {
        // 获取当前最新的消息内容（因为可能在流式过程中其他操作？这里直接更新 store 中的最后一条）
        const currentMsg = chatStore.currentMessages[lastIndex]
        if (currentMsg && currentMsg.role === 'assistant') {
          const newContent = currentMsg.content + chunk
          chatStore.updateLastMessage(newContent)
        } else {
          // 容错
          chatStore.addMessage('assistant', chunk)
        }
        scrollToBottom()
      },
      (err) => {
        console.error(err)
        ElMessage.error('请求失败：' + err.message)
        chatStore.updateLastMessage('抱歉，出错了>_< ：' + err.message)
      }
    )
  } finally {
    isLoading.value = false
    // 流式结束后，手动保存当前会话（避免频繁保存，只在结束时保存一次）
    chatStore.saveCurrentSession()
    ElMessage.success('会话已自动保存')
  }
}

// 会话操作
const createNewChat = () => {
  chatStore.createNewSession()
  ElMessage.success('已创建新会话')
}
const deleteSession = async (sessionId, sessionName) => {
  try {
    await ElMessageBox.confirm(`确定删除会话「${sessionName}」吗？`, '提示', {
      type: 'warning'
    })
    chatStore.deleteSession(sessionId)
    ElMessage.success('已删除')
  } catch {}
}
const renameSession = async (sessionId, oldName) => {
  const { value: newName } = await ElMessageBox.prompt(
    '请输入新名称',
    '重命名',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: oldName
    }
  )
  if (newName && newName.trim()) {
    chatStore.updateSessionName(sessionId, newName.trim())
    ElMessage.success('重命名成功')
  }
}
const switchSession = (sessionId) => {
  if (sessionId === currentSessionId.value) return
  // 切换前保存当前会话（可选，因为每个会话已经独立保存过了）
  chatStore.switchSession(sessionId)
  scrollToBottom()
}

// 手动保存当前会话
const manualSave = () => {
  chatStore.saveCurrentSession()
  ElMessage.success('当前会话已保存')
}

// 初始化加载会话
onMounted(() => {
  chatStore.loadSessions()
  scrollToBottom()
})

// 监听当前会话变化，滚动到底部
watch(currentSessionId, () => {
  scrollToBottom()
})
</script>

<template>
  <div class="chat-layout">
    <!-- 左侧会话侧边栏 -->
    <aside class="session-sidebar">
      <div class="sidebar-header">
        <h3>历史会话</h3>
        <el-button type="primary" size="small" @click="createNewChat"
          >+ 新会话</el-button
        >
      </div>
      <div class="session-list">
        <div
          v-for="session in sessions"
          :key="session.id"
          :class="['session-item', { active: currentSessionId === session.id }]"
          @click="switchSession(session.id)"
        >
          <div class="session-info">
            <div class="session-name">{{ session.name || '未命名聊天' }}</div>
            <div class="session-time">
              {{ new Date(session.updatedAt).toLocaleString() }}
            </div>
          </div>
          <div class="session-actions">
            <el-button
              size="small"
              text
              @click.stop="renameSession(session.id, session.name)"
              >✏️</el-button
            >
            <el-button
              size="small"
              text
              @click.stop="deleteSession(session.id, session.name)"
              >🗑️</el-button
            >
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧聊天区域 -->
    <div class="chat-container">
      <div class="chat-header">
        <div class="header-left">
          <el-select
            placeholder="选择模板"
            style="width: 200px"
            @change="selectTemplate"
          >
            <el-option
              v-for="t in templates"
              :key="t.id"
              :label="`[${t.category}] ${t.name}`"
              :value="t.prompt"
            />
          </el-select>
        </div>
        <div class="header-right">
          <el-button size="small" @click="manualSave">保存会话</el-button>
        </div>
      </div>
      <div class="message-list" ref="messageListref">
        <MessageItem
          v-for="(msg, idx) in currentMessages"
          :key="idx"
          :message="msg"
        />
        <div v-if="isLoading" class="loading-indicator">正在思考...</div>
      </div>
      <ChatInput
        v-model="inputText"
        :disabled="isLoading"
        @send="sendMessage"
      />
    </div>
  </div>
</template>

<style scoped>
.chat-layout {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
.session-sidebar {
  width: 260px;
  background-color: #f9fafb;
  border-right: 1px solid #e4e6eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e4e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
}
.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.session-item:hover {
  background-color: #eef2f6;
}
.session-item.active {
  background-color: #e6f0ff;
  border-left: 3px solid #1b83f2;
}
.session-info {
  flex: 1;
  overflow: hidden;
}
.session-name {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.session-time {
  font-size: 11px;
  color: #8a8f99;
  margin-top: 4px;
}
.session-actions {
  display: none;
  gap: 4px;
}
.session-item:hover .session-actions {
  display: flex;
}
.chat-container {
  flex: 1;
  max-width: 800px; /* 或 width: 50%; 根据需要选择 */
  margin: 0 auto; /* 居中显示 */
  display: flex;
  flex-direction: column;
  background-color: #fff;
  overflow: hidden;
}
.chat-header {
  flex-shrink: 0;
  padding: 12px 20px;
  background-color: #fff;
  /* border-bottom: 1px solid #e4e6eb; */
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #fff;
  /* 隐藏滚动条（WebKit 浏览器：Chrome, Safari, Edge） */
  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }

  /* 隐藏滚动条（Firefox） */
  scrollbar-width: none;
}
.loading-indicator {
  text-align: center;
  color: #8a8f99;
  font-size: 13px;
  padding: 8px;
}
</style>
