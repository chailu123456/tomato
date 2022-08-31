/*
 * @Author: 宋绍华
 * @Date: 2022-03-30 16:51:20
 * @LastEditTime: 2022-07-26 20:56:42
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\utils\permission.ts
 */
import { Router } from "vue-router";
import { store } from "../store";
import { getSession, setSession, checkStaticSourceVersion, clearSession, getLocalhrefParams, getFirstName } from "@/utils";

// 该方法是检测用户登录成功后修改浏览器地址中的项目id进行判断改成员有误权限访问改项目
function hasCheckProduct() {
  // 项目大目录下的二级模块路径，对数组中的路径进行判断是否含有productId，没有则直接跳转到无权限页面
  const pathArr = [
    "project/home",
    "project/product",
    "project/iteration",
    "project/exploitation",
    "project/test",
    "project/testBill",
    "project/settingProject"
  ];
  const { productId } = getLocalhrefParams();
  // 这块主要是在任务-批量新增跳转新页码是判断（如果是任务新增则不做判断，如果做了会把迭代id默认设置成第一个导致新增任务有误）
  if (location.href.includes("exploitationAdd")) return;

  if (location.href.includes("useCaseAdd")) return;
  const productLists = getSession("productList", true) as Array<Record<string, any>>;
  if (productId && productLists && productLists.length) {
    // 设置之前检查当前id是否存在列表中
    const index = productLists.findIndex((v: Record<string, any>) => v.id === Number(productId));
    if (index < 0) {
      window.location.href = "/noAccess";
    }
  }
  for (let i = 0; i < pathArr.length; i++) {
    if (location.href.includes(pathArr[i])) {
      if (!productId) window.location.href = "/noAccess";
    }
  }
}

function handleRedirectUrl() {
  /**
   * 1. 项目下获取第一个目录是否为project，如果是的话，就需要参数
   * 2. 不是登录状态，
   * 3. !getSession("redirectUrl")
   */
  const url = window.location.href;
  const firstName = getFirstName();
  const params = getLocalhrefParams();
  if (firstName === "login" || (firstName === "project" && !Object.keys(params).length) || getSession("redirectUrl")) return;
  setSession("redirectUrl", url);
}

export async function hasPermission(route: Router): Promise<void> {
  let isAuthenticated: string | null | Record<string, any> = null;
  let hasConfigPermission: boolean;
  hasCheckProduct();

  // 保存当前url
  if (!getSession("jumpUrl")) {
    const url = window.location.href;
    if (url.indexOf("code") > 0) {
      setSession("jumpUrl", url);
    } else {
      handleRedirectUrl();
    }
  } else if (getSession("jumpUrl")?.indexOf("code") < 0) {
    // 如果不含code， 直接清理掉jumpUrl
    clearSession("jumpUrl");
  }

  if (getSession("user", true)) {
    hasConfigPermission = (await store?.dispatch("GET_PERMISSION"))?.config_operation;
    // hasConfigPermission为true,有权限访问配置模块，将配置模块环境保存
    if (hasConfigPermission) store?.dispatch("GETENV_LIST");
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
    console.log("当前项目有更新------- ~~~~~~~~~~~~~~~~~~~~~~~~~ ");
    // 检测是否有更新
    checkStaticSourceVersion();
  });
}
