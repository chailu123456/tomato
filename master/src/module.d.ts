// 在vue3中声明 全局属性
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ComponentCustomProperties } from "vue";
import { Axios } from "./api/types";
import api from "./api/dict";
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $ajax: Axios;
    $api: typeof api;
  }
}

declare module "vue-router" {
  interface RouteMeta {
    // 是可选的
    isAdmin?: boolean;
    // 每个路由都必须声明
    requiresAuth: boolean;
  }
}

declare module "file-saver";
