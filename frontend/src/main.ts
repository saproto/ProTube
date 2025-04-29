import { createApp } from 'vue';
import '@assets/style.css';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from '@router/index';

const pinia = createPinia();

createApp(App).use(pinia).use(router).mount('#app');
