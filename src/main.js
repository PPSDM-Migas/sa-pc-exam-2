import { createApp } from "vue";
import App from "./App.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import i18n from "./assets/js/i18n/i18n.js";
import router from "./router/index.js";

const app = createApp(App);
app.use(router);
app.use(i18n);
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount("#app");
