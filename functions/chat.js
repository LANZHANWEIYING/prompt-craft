// functions/chat.js
export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { messages } = await context.request.json()
  if (!messages || !Array.isArray(messages)) {
    return new Response('Bad request: messages required', { status: 400 })
  }

  const MY_API_KEY = context.env.MY_API_KEY
  const MY_MODEL_ID = context.env.MY_MODEL_ID

  if (!MY_API_KEY || !MY_MODEL_ID) {
    console.error('Missing environment variables')
    return new Response('Server configuration error', { status: 500 })
  }

  const upstreamUrl =
    'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
  const response = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MY_API_KEY}`
    },
    body: JSON.stringify({
      model: MY_MODEL_ID,
      messages,
      stream: true
    })
  })

  if (!response.ok) {
    console.error('Upstream error:', response.status)
    return new Response('API request failed', { status: response.status })
  }

  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  ;(async () => {
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            await writer.write(encoder.encode(line + '\n\n'))
          }
        }
      }
    } catch (err) {
      console.error('Stream error:', err)
    } finally {
      writer.close()
    }
  })()

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  })
}
