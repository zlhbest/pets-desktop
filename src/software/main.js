import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import App from "./App.vue";
import router from "./router/index";
import page_title from "./components/page_title";
import "./resource/font/iconfont.css";
const app = createApp(App);

app.use(ElementPlus);
app.use(router);
// 注册全局组件
app.component("PageTitle", page_title);
app.mount("#app");
