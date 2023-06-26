import { CommonServerOptions, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import httpsLocalhost from 'https-localhost'
import { configDotenv } from 'dotenv'
import path from 'path'

configDotenv({
    'path': '../backend/.env'
});

// https://vitejs.dev/config/
export default defineConfig(async () => {
    const HTTPS = process.env.HTTPS === "true" ? "https" : "http";

    let https: CommonServerOptions["https"] = false;
    if (HTTPS === "https") {
        const httpsLocal = httpsLocalhost();
        const certs = await httpsLocal.getCerts();
        https = {
            key: certs.key,
            cert: certs.cert
        };
    }

    const target = process.env.HTTPS === "true" ? "https" : "http";
    const port = parseInt(process.env.PORT ?? '3000');

    return {
        server: {
            port,
            https,
            proxy: {
                // send all api requests to the nodejs server
                "^/api/.": {
                  target: `${target}:/n/localhost:${port}`,
                  changeOrigin: true,
                  secure: false,
                },
                // send all socket connections to the nodejs server
                "^/socket.io/.": {
                  target: `${target}://localhost:${port}`,
                  secure: false,
                  ws: true,
                  changeOrigin: true,
                },
              },
        },
        plugins: [
            vue(),
            VitePWA({
                registerType: 'autoUpdate',
                devOptions: {
                    enabled: true,
                },
                manifest: {
                    name: 'Protube',
                    short_name: 'PTV2',
                    description: 'Protube test pwa',
                    theme_color: '#ffffff',
                    icons: [
                        {
                            src: 'pwa-64x64.png',
                            sizes: '64x64',
                            type: 'image/png'
                        },
                        {
                            src: 'pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png'
                        },
                        {
                            src: 'pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'any'  
                        },
                        {
                            src: 'maskable-icon-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'maskable'
                        }
                    ]
                } 
            })
        ],
        resolve: {
            extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
            alias: {
              "@": path.resolve(__dirname, "./src"),
            },
          },
    }
})
