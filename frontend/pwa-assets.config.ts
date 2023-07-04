import {
  defineConfig,
  minimalPreset as preset
} from '@vite-pwa/assets-generator/config'

console.log(preset);
export default defineConfig({
  preset,
  images: ['src/assets/protube-logo-transparant.png'],
})