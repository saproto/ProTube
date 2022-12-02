import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig((command, mode, ssrBuild) => {
  return {
    plugins: [vue()],
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    publicDir: mode === "development" ? "../public" : "public"
  }
})