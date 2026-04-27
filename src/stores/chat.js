import { defineStore } from 'pinia'

// 会话数据结构
// {
//   id: string,
//   name: string,
//   messages: Array<{role, content}>,
//   createdAt: number,
//   updatedAt: number
// }

export const useChatStore = defineStore('chat', {
  state: () => ({
    sessions: [], // 所有会话列表
    currentSessionId: null // 当前激活的会话ID
  }),
  getters: {
    // 当前会话的消息数组
    currentMessages: (state) => {
      const session = state.sessions.find(
        (s) => s.id === state.currentSessionId
      )
      return session ? session.messages : []
    }
  },
  actions: {
    // 初始化：从 localStorage 加载会话列表
    loadSessions() {
      const stored = localStorage.getItem('chat-sessions')
      if (stored) {
        this.sessions = JSON.parse(stored)
        // 兼容处理：确保每个会话的 name 为字符串
        this.sessions = this.sessions.map((s) => ({ ...s, name: s.name || '' }))

        // 尝试恢复上次打开的会话
        const lastId = this._getLastSessionId()
        const lastSession = this.sessions.find((s) => s.id === lastId)
        if (lastSession) {
          this.currentSessionId = lastId
        } else if (this.sessions.length > 0) {
          // 如果上次会话不存在（例如已被删除），则选中第一个
          this.currentSessionId = this.sessions[0].id
        } else {
          this.createNewSession()
        }
      } else {
        this.createNewSession()
      }
      this._saveToLocal()
    },
    // 创建新会话
    createNewSession(name = '') {
      const newSession = {
        id: Date.now().toString(),
        name: name || '',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      this.sessions.unshift(newSession) // 最新在最前
      this.currentSessionId = newSession.id
      this._saveToLocal()
      this._saveLastSessionId()
      return newSession.id
    },
    // 切换到指定会话
    switchSession(sessionId) {
      if (this.sessions.find((s) => s.id === sessionId)) {
        this.currentSessionId = sessionId
        this._saveLastSessionId()
      }
    },
    // 删除会话
    deleteSession(sessionId) {
      const index = this.sessions.findIndex((s) => s.id === sessionId)
      if (index !== -1) {
        this.sessions.splice(index, 1)
        if (this.currentSessionId === sessionId) {
          // 如果删除的是当前会话，则切换到第一个会话或创建新会话
          if (this.sessions.length > 0) {
            this.currentSessionId = this.sessions[0].id
          } else {
            this.createNewSession()
          }
        }
        this._saveToLocal()
      }
    },
    // 更新会话名称
    updateSessionName(sessionId, newName) {
      const session = this.sessions.find((s) => s.id === sessionId)
      if (session) {
        session.name = newName
        session.updatedAt = Date.now()
        this._saveToLocal()
      }
    },
    // 向当前会话添加消息（用户或助手）
    addMessage(role, content) {
      const session = this.sessions.find((s) => s.id === this.currentSessionId)
      if (session) {
        session.messages.push({ role, content })
        session.updatedAt = Date.now()
        // 重要：不在这里保存，等所有流式结束后统一保存（或切换时保存）
        // 但为了用户体验，可以防抖保存，或者让用户手动保存。
        // 我们改为在流式结束时显式调用 saveCurrentSession
      }
    },
    // 更新最后一条消息的内容（流式更新用）
    updateLastMessage(content) {
      const session = this.sessions.find((s) => s.id === this.currentSessionId)
      if (session && session.messages.length > 0) {
        const lastMsg = session.messages[session.messages.length - 1]
        if (lastMsg.role === 'assistant') {
          lastMsg.content = content
        } else {
          // 如果最后一条不是 assistant，则新增（兜底）
          session.messages.push({ role: 'assistant', content })
        }
        session.updatedAt = Date.now()
        // 同样，不自动保存
      }
    },
    // 手动保存当前会话到 localStorage
    saveCurrentSession() {
      this._saveToLocal()
    },
    // 内部保存方法
    _saveToLocal() {
      localStorage.setItem('chat-sessions', JSON.stringify(this.sessions))
    },
    // 清空所有会话（谨慎使用）
    clearAllSessions() {
      this.sessions = []
      this.currentSessionId = null
      localStorage.removeItem('chat-sessions')
      this.createNewSession()
    },
    // 获取对话历史（用于 API）
    getConversationHistory() {
      const session = this.sessions.find((s) => s.id === this.currentSessionId)
      if (!session) return []
      // 返回格式符合 OpenAI 要求
      return session.messages.map((m) => ({ role: m.role, content: m.content }))
    },
    // 保存当前会话 ID 到 localStorage
    _saveLastSessionId() {
      if (this.currentSessionId) {
        localStorage.setItem('last-session-id', this.currentSessionId)
      }
    },

    // 恢复上次打开的会话 ID
    _getLastSessionId() {
      return localStorage.getItem('last-session-id')
    }
  }
})
