/*
 * @Author: 宋绍华
 * @Date: 2022-01-10 12:08:16
 * @LastEditTime: 2022-04-28 10:22:36
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\main.ts
 */
import { createApp } from "vue";
import App from "./App.vue";

import router from "./router";

import { store, key } from "./store";
import ElementPlus from "element-plus";

import "element-plus/dist/index.css";

import locale from "element-plus/lib/locale/lang/zh-cn";
import "normalize.css";
import "./styles/iconfont/iconfont.css";
import { registerGlobComp } from "./components";
import "dayjs/locale/zh-cn";
import "./styles/index.less";
import derectives from "@/utils/directive";
import watermark from "watermark-dom";
import { getSession } from "./utils";
import { USER } from "./store/state";
const user = getSession("user", true) as USER;

// 页面初始化时，需要设置浏览器的版本
// checkStaticSourceVersion(true);

if (user) {
  // 加上水印
  watermark.load({
    watermark_txt: `${user.name} ${user.shr_staff_no || user.staff_no}`,
    watermark_color: "#999",
    watermark_fontsize: "14px",
    watermark_x_space: 200,
    watermark_y_space: 100
  });
}

//防止页面后退
// history.pushState(null, "", document.URL);
// window.addEventListener("popstate", function () {
//   history.pushState(null, "", document.URL);
// });

const app = createApp(App);

// 注册防抖、节流指令
derectives(app);

(async (app) => {
  registerGlobComp(app);
  app.use(ElementPlus, { size: "small", zIndex: 3000, locale });
  app.use(store, key).use(router);
  // app.use(i18n, { locale: "zh-cn" });
  await router.isReady();
  app.mount("#app");
  // router.isReady().then(() => app.mount("#app"));
})(app);
