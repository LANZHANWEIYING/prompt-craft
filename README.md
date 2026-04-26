# Prompt Craft

> 一个可视化的 AI 提示词编排工具 + 智能聊天应用，支持流式对话、模板管理、会话持久化。

🌐 **在线体验**：[https://prompt-craft.pages.dev](https://prompt-craft.pages.dev)  
📦 **GitHub 仓库**：[LANZHANWEIYING/prompt-craft](https://github.com/LANZHANWEIYING/prompt-craft)

---

## ✨ 功能特性

- **🤖 AI 聊天**：基于火山引擎 API 的流式对话，实时打字机效果。
- **🧩 可视化 Prompt 编排**：拖拽构建结构化的 AI 提示词（角色、任务、格式、示例），实时生成 JSON 配置。
- **📋 提示词模板**：内置常用模板（代码解释、文章总结），支持增删改查，持久化存储。
- **💬 会话管理**：
  - 自动根据第一条提问命名会话
  - 新建/重命名/删除会话
  - 聊天记录自动保存到 localStorage，刷新页面不丢失
  - 支持导出/导入会话 JSON 文件
- **✨ 用户体验优化**：
  - 流式响应结束后自动保存会话
  - 消息列表自动滚动到底部
  - 隐藏滚动条，提升视觉整洁度
- **🔒 安全部署**：API 密钥通过 Cloudflare Pages 环境变量注入，前端不暴露任何敏感信息。

---

## 🛠 技术栈

| 分类          | 技术                                     |
| ------------- | ---------------------------------------- |
| 前端框架      | Vue 3 + Composition API                  |
| 构建工具      | Vite                                     |
| 状态管理      | Pinia + 持久化插件（localStorage）       |
| UI 组件库     | Element Plus                             |
| 路由          | Vue Router 4（History 模式）             |
| 拖拽排序      | vuedraggable（仅 Builder 模块）          |
| Markdown 渲染 | marked + highlight.js                    |
| 后端（代理）  | Cloudflare Pages Functions（Serverless） |
| AI 接口       | 火山引擎（豆包大模型）                   |
| 部署平台      | Cloudflare Pages（国内可访问）           |

---

## 🚀 本地运行

### 1. 克隆仓库

```bash
git clone https://github.com/LANZHANWEIYING/prompt-craft.git
cd prompt-craft
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 API 密钥（火山方舟（豆包大模型）API Key 申请）

#### 1.打开官网控制台地址

`https://console.volcengine.com/`,注册并登录火山引擎,实名，

#### 2.进入火山方舟（豆包大模型）

控制台左上角点击产品与服务
搜索框输入：火山方舟，点击进入产品控制台
进入左侧菜单栏：模型推理 → 在线推理

#### 3.点击页面创建接入点

模型选择：Doubao-Seed-2.0-Pro（豆包旗舰通用模型）
计费选择按量付费（新用户有免费额度，够用开发）
接入方式默认 API 调用，其他保持默认
点击确定，等待接入点创建完成

#### 4.创建后记录两个关键信息

接入点 ID：以 ep- 开头字符串
接口请求地址：固定地址
`https://ark.cn-beijing.volces.com/api/v3/chat/completions`

#### 5.创建 API Key 密钥

控制台右上角头像 → 密钥管理
选择 API Key 管理 → 点击新建 API Key
密钥名称自定义（如vue-chat-项目测试）
点击确定，生成 sk- 开头的密钥(立即复制保存：密钥只显示一次，关闭后无法再次查看)

## 📦 构建与部署

### 构建生产版本

```bash
npm run build
```

产物生成在 `dist/` 目录。

### 部署到 Cloudflare Pages

1. 推送代码到 GitHub 仓库。
2. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/) → Workers & Pages → 创建项目 → 连接到 Git。
3. 选择仓库 `LANZHANWEIYING/prompt-craft`。
4. 构建设置：
   - **框架预设**：Vue
   - **构建命令**：`npm run build`
   - **输出目录**：`dist`
5. 添加环境变量：
   - `MY_API_KEY`：火山引擎 API Key
   - `MY_MODEL_ID`：模型 ID
6. 保存并部署。分配域名 `https://prompt-craft.pages.dev`。

---

## 🧩 核心实现解析

### 1. 流式对话（SSE）

前端 `src/api/request.js` 中使用 `fetch` + `ReadableStream` 逐块读取数据，通过回调 `onChunk` 实时更新 UI。后端 `functions/chat.js` 作为代理，转发火山引擎的流式响应。

### 2. 会话持久化

使用 Pinia 存储 `sessions` 数组，每次会话变更（增删改、消息更新）都会调用 `saveCurrentSession()` 写入 `localStorage`。页面加载时自动读取恢复。

### 3. 自动生成会话标题

发送第一条用户消息后，检测当前会话 `name` 是否为空，若为空则截取消息前 20 个字符作为标题。

### 4. 可视化 Prompt 编排

左侧物料区可拖拽到画布，每个模块（角色、任务、格式、示例）是一个独立块，支持编辑内容、上下移动排序、删除。最终所有块序列化为 JSON，供用户复制使用。

### 5. 客户端路由

Vue Router 使用 `createWebHistory()` 模式。为了避免刷新页面 404，在项目根目录放置 `_redirects` 文件，内容为：

```
/*    /index.html   200
```

Cloudflare Pages 会自动处理该文件，将所有未匹配的路由指向 `index.html`。

### 6. API 密钥安全

后端函数 `functions/chat.js` 从 `context.env` 读取 `MY_API_KEY` 和 `MY_MODEL_ID`，前端请求 `/chat` 时，由 Cloudflare 运行时注入环境变量，密钥不会暴露到浏览器。

---

## 📁 项目结构

```
prompt-craft/
├── functions/                # Cloudflare Pages Functions
│   └── chat.js              # AI 对话代理
├── public/                  # 静态资源
├── src/
│   ├── api/                 # 前端 API 封装
│   │   └── request.js       # streamChat 实现
│   ├── assets/              # 图片、字体等
│   ├── components/          # Vue 组件
│   │   ├── ChatInput.vue
│   │   ├── JsonOutput.vue
│   │   ├── MaterialList.vue
│   │   ├── MessageItem.vue
│   │   ├── TemplateForm.vue
│   │   └── BlockEditor.vue
│   ├── composables/         # 组合式函数
│   │   └── usePersist.js    # localStorage 持久化
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia 状态管理
│   │   ├── chat.js          # 会话管理
│   │   └── templates.js     # 模板管理
│   ├── views/               # 页面视图
│   │   ├── ChatView.vue
│   │   ├── BuilderView.vue
│   │   └── TemplatesView.vue
│   ├── App.vue
│   └── main.js
├── .gitignore
├── _redirects               # Cloudflare 路由重写
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---
