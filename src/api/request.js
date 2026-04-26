import axios from 'axios'
const request = axios.create({
  baseURL: '/api', //代理后指向OpenAI
  timeout: 50000
})
//流式请求（用于ai对话）
// 参数说明：
// messages：对话消息数组（历史+当前提问）
// onChunk：每接收到一小段AI返回内容时的回调函数（实时渲染文字）
// onError：请求出错时的回调函数
// axios 不支持原生流式读取响应体
//fetch 是浏览器原生 API，可以逐段接收数据，不需要等待全部数据返回再渲染。
//Content-Type:发数据的格式，这里是json格式。
//Authorization:OpenAI API的密钥，需要在.env文件中配置。
//body：请求体，包含对话消息数组和是否流式请求。
export const streamChat = async (messages, onChunk, onError) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6)
          if (jsonStr === '[DONE]') continue
          try {
            const json = JSON.parse(jsonStr)
            const content = json.choices[0]?.delta?.content || ''
            if (content) onChunk(content)
          } catch (e) {
            console.warn('Parse error:', e)
          }
        }
      }
    }
  } catch (error) {
    onError(error)
  }
}
