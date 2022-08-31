/*
 * @Author: 宋绍华
 * @Date: 2022-03-30 16:51:20
 * @LastEditTime: 2022-05-07 14:18:45
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\login\hooks\useLogin.ts
 */
import { getByUserId } from "@/api/request-modules/common";
import { useStore } from "@/store/index";
import { setSession, getSession, clearSession } from "@/utils";
import { getLocalhrefParams, autoLoginYapiFn } from "@/utils/index";
const isDev = process.env.NODE_ENV === "development";
const CONFIG = {
  id: "canvasRef",
  appid: "ww06fa03084e27ff22",
  // agentid: isDev ? "1000131" : "1000131",
  // redirect_uri: isDev ? encodeURIComponent("https://test.tomato.rvet.cn") : encodeURIComponent("https://test.tomato.rvet.cn"),
  agentid: isDev ? "1000131" : "1000089",
  redirect_uri: isDev ? encodeURIComponent("https://test.tomato.rvet.cn") : encodeURIComponent("https://tomato.petrvet.com"),
  state: "",
  href: ""
};

/**
 * @description yapi 设置cookie
 *
 */
function setCookie(name: string, value: string, day: number): void {
  const domain = getDomain();
  if (day !== 0) {
    // 当设置的时间等于0时，不设置expires属性，cookie在浏览器关闭后删除
    const expires = day * 24 * 60 * 60 * 1000;
    const date = new Date(+new Date() + expires);
    document.cookie = `${name}=${escape(value)};expires=${date.toUTCString()};domain=${domain};SameSite=None; Secure`;
  } else {
    document.cookie = `${name}=${escape(value)};domain=${domain};SameSite=None; Secure`;
  }
}
/**
 * @description 获取当前部署的域名
 *
 */
function getDomain(): string {
  const host = location.host.indexOf(":") ? location.host.split(":")[0] : location.host;
  return host.split(".").length > 1 ? host.split(".").slice(-2).join(".") : host;
}

export default function useLogin(drawEle: string): any {
  const store = useStore();
  const loginFn = () => {
    window.WwLogin(Object.assign(CONFIG, { id: drawEle }));
  };
  const getQRCode = async () => {
    const jumpUrl = getSession("jumpUrl") as string;
    // 已经扫码授权过
    const { code } = getLocalhrefParams(jumpUrl || "");
    if (code) {
      // 根据code获取成员信息
      try {
        const { data } = await getByUserId({ code });

        store.commit("USER", data);
        store.dispatch("GETENV_LIST");
        setSession("user", data);
        setSession("version", "1.11.0");
        // 登录yapi
        // await autoLoginYapiFn();
        if (data.yapi_info.id) {
          setCookie("_yapi_token", data.yapi_info.token, 30);
          setCookie("_yapi_uid", data.yapi_info.id, 30);
        } else {
          autoLoginYapiFn();
        }

        // 判断缓存中有jumpUrl
        if (getSession("jumpUrl") && getSession("jumpUrl") !== "/login") {
          const url = getSession("jumpUrl") as string;
          location.href = url;
          clearSession("jumpUrl");
        } else {
          location.href = `/workbench/dashboard`;
        }

        return;
      } catch (err) {
        loginFn();
        location.href = `/login`;
      }
    }
    loginFn();
  };
  return { getQRCode };
}
