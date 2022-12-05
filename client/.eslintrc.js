module.exports = {
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
    'eslint-config-prettier'
  ],
  rules: {
    'vue/component-definition-name-casing': 'off'
  }
}