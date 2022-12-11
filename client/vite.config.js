import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import eslint from "vite-plugin-eslint";

const path = require("path");
const fs = require("fs");

// https://vitejs.dev/config/
export default defineConfig(() => {
  require("dotenv").config({ path: `../server/.env` });
  let serverPort = process.env.PORT;
  let serverHTTPS = process.env.HTTPS === "true" ? "https" : "http";

  return {
    plugins: [vue(), eslint()],
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
              key: fs.readFileSync(`../server/${process.env.SSL_KEY_FILE}`),
              cert: fs.readFileSync(`../server/${process.env.SSL_CERT_FILE}`),
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
