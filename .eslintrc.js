module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-recommended', // Vue3 推荐规则
    'eslint:recommended',
    '@vue/eslint-config-prettier' // 必须放在最后，覆盖冲突规则
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // 自定义规则（根据需要调整）
    'vue/multi-word-component-names': 'off', // 允许单字组件名（如 ChatView）
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-v-html': 'off', // 允许 v-html（因为我们要渲染 Markdown）
    'vue/require-default-prop': 'off', // 不强制 props 默认值
    'vue/attributes-order': 'error', // 强制属性顺序
    'comma-dangle': ['error', 'never'] // 不允许尾随逗号
  }
}
