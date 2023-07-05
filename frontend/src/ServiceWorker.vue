<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { pwaInfo } from 'virtual:pwa-info';

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swUrl, r) {
        // eslint-disable-next-line no-console
        console.log(`Service Worker at: ${swUrl}`);
        r &&
            setInterval(async () => {
                // eslint-disable-next-line no-console
                console.log('Checking for sw update');
                await r.update();
            }, 20000 /* 20s for testing purposes */);
    },
    onOfflineReady() {
        console.log('OFFLINE READY');
    },
});

console.log(pwaInfo);

// let deferredPrompt;
// window.addEventListener('beforeinstallprompt', (e) => {
//   // Prevents the default mini-infobar or install dialog from appearing on mobile
//   // e.preventDefault();
//   // Save the event because you'll need to trigger it later.
//   deferredPrompt = e;
//   console.log("BEFORE INSTALL PROMPT");
//   // Show your customized install prompt for your PWA
//   // Your own UI doesn't have to be a single element, you
//   // can have buttons in different locations, or wait to prompt
//   // as part of a critical journey.
//   // showInAppInstallPromotion();
//   // e.prompt();
// });
// <button @click="deferredPrompt.prompt()">
//   Install pwa
// </button>

// window.addEventListener('appinstalled', () => {
//   // Hide the app-provided install promotion
//   // hideInstallPromotion();
//   // Clear the deferredPrompt so it can be garbage collected
//   // deferredPrompt = null;
//   // Optionally, send analytics event to indicate successful install
//   console.log('PWA was installed');
// });
// console.log(window.matchMedia('(display-mode: standalone)').matches);
</script>

<template>
    <div v-if="offlineReady || needRefresh" class="pwa-toast" role="alert">
        <div class="message">
            <span v-if="offlineReady"> App ready to work offline </span>
            <span v-else> New content available, click on reload button to update. </span>
        </div>
        <button v-if="needRefresh" @click="updateServiceWorker()">Reload</button>
    </div>
</template>

<style>
.pwa-toast {
    position: fixed;
    right: 0;
    bottom: 0;
    margin: 16px;
    padding: 12px;
    border: 1px solid #8885;
    border-radius: 4px;
    z-index: 1;
    text-align: left;
    box-shadow: 3px 4px 5px 0px #8885;
}
.pwa-toast .message {
    margin-bottom: 8px;
}
.pwa-toast button {
    border: 1px solid #8885;
    outline: none;
    margin-right: 5px;
    border-radius: 2px;
    padding: 3px 10px;
}
</style>
