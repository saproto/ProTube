import {defineConfig, loadEnv} from "vite";
import vue from "@vitejs/plugin-vue";
import eslintPlugin from "@nabla/vite-plugin-eslint";


const path = require("path");
const fs = require("fs");

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  require("dotenv").config({ path: `../server/.env` });
    const env = loadEnv(mode, process.cwd(), '')

    let serverPort = env.PORT;
  let serverHTTPS = env.HTTPS === "true" ? "https" : "http";

  return {
    plugins: [vue(), eslintPlugin()],
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      https:
        process.env.HTTPS === "true"
          ? {
              key: fs.readFileSync(`../server/${env.SSL_KEY_FILE}`),
              cert: fs.readFileSync(`../server/${env.SSL_CERT_FILE}`),
            }
          : false,
      proxy: {
        // send all api requests to the nodejs server
        "^/api/.": {
          target: `${serverHTTPS}://localhost:${serverPort}`,
          changeOrigin: true,
          secure: false,
        },
        // send all socket connections to the nodejs server
        "^/socket.io/.": {
          target: `${serverHTTPS}://localhost:${serverPort}`,
          secure: false,
          ws: true,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "../server/public",
    },
  };
});
