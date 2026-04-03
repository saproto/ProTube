import { createApp } from "vue";

// snowflake (after use delete import)
import "@/assets/snowfall.scss";

import App from "./App.vue";

// import { eventBus } from '@/js/eventbus'
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faPlay,
  faPause,
  faBackward,
  faForward,
  faBars,
  faUser,
  faMicrophone,
  faClock,
  faXmark,
  faXmarkCircle,
  faCircleNotch,
  faCheck,
  faCheckCircle,
  faWarning,
  faEye,
  faSearch,
  faTrash,
  faQuestionCircle,
  faCaretDown,
  faArrowDown,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";

library.add(
  faPlay,
  faPause,
  faBackward,
  faForward,
  faBars,
  faUser,
  faMicrophone,
  faClock,
  faXmark,
  faXmarkCircle,
  faCircleNotch,
  faCheck,
  faCheckCircle,
  faWarning,
  faEye,
  faSearch,
  faTrash,
  faCaretDown,
  faArrowDown,
  faArrowUp,
  faQuestionCircle,
);

import "./assets/tailwind.css";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import router from "./router/index.js";
import * as Sentry from "@sentry/vue";
const app = createApp(App);

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/vue/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});

app.component("FontAwesomeIcon", FontAwesomeIcon);
app.use(router);
app.mount("#app");
