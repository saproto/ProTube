import { createApp } from "vue";
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
  faRadio,
  faTv,
  faRectangleList,
  faBan,
  faCamera,
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
  faQuestionCircle,
  faRadio,
  faTv,
  faRectangleList,
  faBan,
  faCamera
);

import "./assets/tailwind.css";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import router from "./router/index.js";

const app = createApp(App);
// app.config.globalProperties.eventBus = eventBus;
app.component("font-awesome-icon", FontAwesomeIcon);
app.use(router);
app.mount("#app");
