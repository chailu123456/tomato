/*
 * @Author: 宋绍华
 * @Date: 2022-03-30 16:51:20
 * @LastEditTime: 2022-04-16 14:35:29
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\utils\permission.ts
 */
import { Router } from "vue-router";

import { store } from "../store";
import { getSession, setSession } from "@/utils";

function getUrl() {
  const url = location.href; //获取url

  if (url.indexOf("#") != -1) {
    const strs = url.split("#");
    return strs[1] || "";
  }
  return "";
}

export async function hasPermission(route: Router): Promise<void> {
  let isAuthenticated: string | null | Record<string, any>;
  let hasConfigPermission: boolean;
  // 保存当前url
  if (!getSession("jumpUrl")) {
    setSession("jumpUrl", getUrl());
  }
  if (getSession("user", true)) {
    hasConfigPermission = (await store.dispatch("GET_PERMISSION")).config_operation;
    // hasConfigPermission为true,有权限访问配置模块，将配置模块环境保存
    if (hasConfigPermission) store.dispatch("GETENV_LIST");
  }
  route.beforeEach((to: any, from: any, next: any) => {
    try {
      isAuthenticated = getSession("user", true);
    } catch {
      isAuthenticated = null;
    }
    if (!isAuthenticated && to.name !== "login") {
      store.commit("USER", null);
      next({ path: "/login" });
    } else {
      if (to.path.indexOf("configure") >= 0) {
        if (hasConfigPermission) {
          // 有没有权限访问配置模块
          next();
        } else {
          if (isAuthenticated) {
            next({ path: "/project/iteration" });
          } else {
            next();
          }
        }
      } else {
        next();
      }
    }
  });
  route.beforeResolve((to, from, next) => {
    // 判断是否加入缓存
    if (to.meta.hidden != false) store.commit("INCLUDE", to.name);
    next();
  });
  route.onError(() => {
    console.log("当前项目有更新-------");
    // if (process.env.NODE_ENV === "production") {
    // 检测是否有更新
    // checkStaticSourceVersion();
    // }
    // const pattern = /Loading chunk (\d)+ failed/g;
    // const isChunkLoadFailed = error.message.match(pattern);
    // const targetPath = route.history.pending.fullPath;
    // if (isChunkLoadFailed) {
    //   router.replace(targetPath);
    // }
  });
}
