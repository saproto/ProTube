/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
declare module '*.vue';
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
