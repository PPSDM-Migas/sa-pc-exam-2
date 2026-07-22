import { createApp } from "vue";
import App from "./App.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import i18n from "./assets/js/i18n/i18n.js";
import router from "./router/index.js";
import '@/assets/js/icon';
import '@bpmlib/vue-satoast/style.css';

const defaults = { internalMode: 'external', countdownAction: 'hibernate', shutdownTimer: '90' };
for (const [key, val] of Object.entries(defaults)) {
  if (localStorage.getItem(key) === null) localStorage.setItem(key, val);
}

const app = createApp(App);
app.use(router);
app.use(i18n);
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount("#app");
