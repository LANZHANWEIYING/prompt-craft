// api/chat.js
export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages required" });
  }

  const MY_API_KEY = process.env.MY_API_KEY;
  const MY_MODEL_ID = process.env.MY_MODEL_ID;

  if (!MY_API_KEY || !MY_MODEL_ID) {
    console.error("Missing env variables");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const response = await fetch(
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MY_API_KEY}`,
        },
        body: JSON.stringify({
          model: MY_MODEL_ID,
          messages,
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upstream API error:", errorText);
      return res.status(response.status).json({ error: "API request failed" });
    }

    // 设置 SSE 响应头
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            // 将原始数据逐块发送给前端
            res.write(line + "\n\n");
          }
        }
      }
      res.end();
    } catch (streamError) {
      console.error("Stream error:", streamError);
      res.end();
    }
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
