<script setup lang="ts">
import { onBeforeMount } from 'vue';
import HelloWorld from './components/HelloWorld.vue'
import MyWorker from './my-worker?worker'

const worker = new MyWorker()

const messageFromWorker = async (...data: unknown[]) => {
  console.log(data);
  console.log('from sw');
}

const runWorker = async () => {
  worker.postMessage('ping')
}
const resetMessage = async () => {
  worker.postMessage('clear')
}

onBeforeMount(() => {
  worker.addEventListener('message', messageFromWorker)
})
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
  <button @click="runWorker">
    Ping web worker
  </button>
  &#160;&#160;
  <button @click="resetMessage">
    Reset message
  </button>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
