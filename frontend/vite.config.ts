import { CommonServerOptions, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
// @ts-ignore there are no types
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
        assetsInclude: ['src/icons/*.png'],
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
                mode: 'development',
                base: '/',
                registerType: 'autoUpdate',
                devOptions: {
                    enabled: true,
                    type: 'module'
                },
                srcDir: 'src',
                strategies: 'generateSW',
                // strategies: 'injectManifest',
                // filename: 'prompt-sw.ts',
                workbox: {
                    // globPatterns: ['**/*.{js,css,html,png}'],
                    // globPatterns: ['**/*.{js,css,html,png,svg}'],
                    // globDirectory: 'src/icons',
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}']
                },
                //     navigateFallback: 'offline.html'
                // },
                manifest: {
                    name: 'Protube',
                    short_name: 'PTV2',
                    description: 'Protube test pwa',
                    theme_color: '#83b716',
                    icons: [
                        {
                            src: 'icons/pwa-64x64.png',
                            sizes: '64x64',
                            type: 'image/png'
                        },
                        {
                            src: 'icons/pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png'
                        },
                        {
                            src: 'icons/pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'any'  
                        },
                        {
                            src: 'icons/maskable-icon-512x512.png',
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
