import { setSession, getSession, clearSession } from "./sesssion";
import fileSave from "@/utils/fileSave";
import qs from "qs";
import axios from "axios";
import router from "@/router";
import { computed } from "vue";

import {
  STATUS,
  ENVIRONMENT_VARIABLE,
  TYPE_STATUS,
  BUG_STATUS,
  TASK_TYPE,
  TASK_TYPE_LIST,
  ENVLIST,
  BUG_LEVEL,
  RUN_ENV,
  LANGUAGE,
  PLAN_STATUS,
  BUG_TYPE,
  TEST_OVERVIEW_STATUS,
  CLASSIFY,
  COMMONCLASSIFY,
  LINKSHARE,
  PUBLICSHARE,
  PRIORITY,
  WORK_STATUS,
  WORK_TYPE,
  DYNAMICS_TYPE
} from "./contantOptions";
import MESSAGE_TIP from "./tipMessage";
import { loadJs } from "./loadJs";
import { readFile } from "./readFile";
import { autoLoginYapi } from "@/api/request-modules/common";
import { ElMessageBox } from "element-plus";
import { onBeforeUnmount, ref, watch } from "vue";
import { store } from "@/store";
import { MutationType } from "@/store/mutation-types";
import { searchParams } from "@/views/iteration/useMixin";
import { ProjectItem } from "@/composables/useCommon";
import { Iterate } from "@/composables/useBoardBase";
import { Md5 } from "ts-md5/dist/md5";

// 获取路由第一个目录名称
function getFirstName(url?: string) {
  const firstName = (url || window.location.pathname).match(/\/[A-Za-z]+/);
  const path = firstName ? firstName[0].replace(/\//, "") : "";
  return path;
}

/**
 *
 * @return {object}
 * @description 获取地址栏参数拼装为对象返回
 */
function getLocalhrefParams(url?: string) {
  const href = url || location.href;
  const res: Record<string, any> = {};
  try {
    const URI = href.split("?")[1];
    if (URI) {
      const params = URI.split("&");
      params.forEach((v) => {
        const variables = v.split("=");
        const key = variables[0];
        const value = variables[1];
        res[key] = value;
      });
    }
  } catch (err) {
    console.log(err);
  }
  return res;
}
/**
 *
 * @param {value} any
 * @returns {boolean} 布尔值
 * @description 判断是否为普通对象
 */
function isPlainObject(value: unknown): boolean {
  return Object.prototype.toString.call(value) === "[object Object]";
}

const debounce = (fn: (...args: Array<any>) => void, wait: number): ((...args: Array<any>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  const debounced = (...args: Array<any>) => {
    const context = this as any;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  };
  return debounced;
};
/**
 * @description 获取当前部署的域名
 *
 */
function getDomain(): string {
  const host = location.host.indexOf(":") ? location.host.split(":")[0] : location.host;
  return host.split(".").length > 1 ? host.split(".").slice(-2).join(".") : host;
}

const clearCookie = (sKey: string, sPath: string, sDomain: string) => {
  document.cookie =
    encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
  return true;
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
 * @description 设置yapi自动登录
 *
 */
const autoLoginYapiFn = async (): Promise<void> => {
  // if (process.env.NODE_ENV === "development") {
  //   // 本地开发写死
  //   setCookie("_yapi_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjcsImlhdCI6MTYzMzc0Nzg2NiwiZXhwIjoxNjM0MzUyNjY2fQ.RYDzb42PISk7Hqd6gRbGgmZ4tWZXg7EdGYmMtO01SK4", 30);
  //   setCookie("_yapi_uid", "7", 30);
  // } else {
  const yapiToken = (await autoLoginYapi()) as Record<string, any>;
  setCookie("_yapi_token", yapiToken.data.token, 30);
  setCookie("_yapi_uid", yapiToken.data.id, 30);
  // }
};

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};
// 下载文件
export const downloadFile = (filename: string, url: string) => {
  const link = document.createElement("a");
  link.setAttribute("download", filename);
  link.setAttribute("target", "_blank");
  link.setAttribute("href", url);
  link.setAttribute("style", "position: absolute;top: -99999px;left: -99999px;");
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 0);
};

// 使用qs.stringify将参数对象格式化为一个字符串。
const setObjStringify = (formParams: any, url: string) => {
  if (!formParams) return "";
  let urlParams = "";

  for (const key in formParams) {
    if (formParams.pageIndex && formParams.pageSize) {
      formParams.page_index = formParams.pageIndex;
      formParams.page_size = formParams.pageSize;
      delete formParams.pageSize;
      delete formParams.pageIndex;
    }
    if (Array.isArray(formParams[key])) {
      urlParams = qs.stringify(formParams, { arrayFormat: "repeat" });
    }
  }
  setTimeout(() => {
    fileSave("data", `${url}?${urlParams}`, true);
  }, 300);
};

// 脱敏处理 中间省略俩边展示
const hideText = (val: string): string => {
  if (!val) return "-";
  if (val.length < 18) return val;
  const startString = val.substring(0, 3);
  const endString = val.substring(val.length - 4);
  return `${startString}******${endString}`;
};

// function isUrl(URL: string) {
//   const str = URL;
//   //判断URL地址的正则表达式为:http(s)?://([\w-]+\.)+[\w-]+(/[\w- ./?%&=]*)?
//   //下面的代码中应用了转义字符"\"输出一个字符"/"
//   const Expression = /^((https|http){1}:\/\/)[^\s]+/;

//   const objExp = new RegExp(Expression);
//   if (objExp.test(str)) return true;
//   else return false;
// }

function checkURL(url: string) {
  return /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+[a-zA-Z]+)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/.test(url);
}

const downloadUrl = (url: string, file_name?: string) => {
  if (url) {
    // const type = url.substring(url.lastIndexOf("."));
    if (!url.includes("https")) url = url.replace(/^http/, "https");
    const a = document.createElement("a");
    a.href = url + `?attname=${file_name || "doc"}`;
    a.download = file_name || "doc";
    a.click();
  }
};

interface AwaitFuncIter<U> {
  asyncFunc: CallableFunction;
  args?: U;
  needLoading?: boolean;
  needCode?: boolean;
}
/**
 * 为了不写那么多的try catch ，特意封装一个简易的try catch 函数
 * @param asyncFunc 回调函数
 * @param args 参数
 * @param needLoading 是否需要loading，默认true
 * @param needCode 是否需要返回code， 默认false
 * @returns Array
 *
 * example 1:
 * function checkNotices = (id: number) => {
 *  检测提醒，接口没啥返回值，因此根据接口code 是否为200即可
 *  awaitFunc<number, any>
 *  1. number 参数类型，
 *  2. any 为返回数据类型，这里没有返回值，因此设置any即可
 *  { asyncFunc: withDrawApprovalApi, args: id, needCode: true }
 *  1. asyncFunc 异步请求函数
 *  2. args： 接口参数值
 *  3. needCode 是否需要返回code
 *  4. needLoading 是否需要接口loading
 *
 *   const [err, _]: [number | unknown, any] = await awaitFunc<number, any>({ asyncFunc: withDrawApprovalApi, args: id, needCode: true, needLoading: false });
 *   if (typeof err === "number") return err === 200;
 *   return false;
 * }
 *
 * example 2:
 * const useGetDemandList = async (product_id: string): Promise<DemandApprovalItem[] | null> => {
 *  获取需求list
 *  string: 参数类型 , DemandApprovalItem[] 接口返回类型，其余跟example 1 类似
 *   const [err, data]: [unknown, DemandApprovalItem[] | null] = await awaitFunc<string, DemandApprovalItem[]>({ asyncFunc: getDemandApprovalList, args: product_id, needLoading: false });
 *   if (err || !data) return null;
 *   return data;
 * };
 */

async function awaitFunc<U, T>(params: AwaitFuncIter<U>): Promise<[number | unknown, T | null]> {
  // 参数
  const { asyncFunc, args, needCode = false } = params;

  try {
    const { code, data }: { code: number; data: T } = await asyncFunc(args);
    // 非200统一抛出异常
    if (code !== 200) return [needCode ? code : null, null];
    return [needCode ? code : null, data];
  } catch (e: unknown) {
    return [e, null];
  }
}

/**
 * 检测服务端静态资源是否更新，提示用户操作
 * @param {Boolean} isInit 是否初始化
 */
// const md5 = new Md5();
const checkStaticSourceVersion = (isInit = false) => {
  const url = `${window.location.origin}/index.html?time=${new Date().getTime()}`;
  const STATICHASHVERSION = "staticHashVersion";
  axios.get(url).then((res: any) => {
    if (res.status === 200) {
      // 匹配index.html文件中引入的js文件是否变化（具体正则，视打包时的设置及文件路径而定）
      const newHash = res.data && Md5.hashStr(res.data);
      const oldHash = sessionStorage.getItem(STATICHASHVERSION);
      if (!oldHash && newHash) {
        sessionStorage.setItem(STATICHASHVERSION, newHash);
      } else if (oldHash !== newHash && !isInit) {
        // notice
        ElMessageBox.alert("检测到系统当前版本已更新，请刷新后使用", {
          confirmButtonText: "确定",
          showClose: false,
          center: true,
          callback: () => {
            // 刷新页面之后，更新hash
            sessionStorage.setItem(STATICHASHVERSION, newHash);
            window.location.reload();
          }
        });
      }
    }
  });
};

/**
 * 监听全屏
 * @param {Function} cb 回调函数，这个回调可以在引用的地方加上，执行业务逻辑
 * example：
 * listenFullScreen((isClose: boolean) => {
 *  // 这里执行你的业务逻辑
 * })
 */
const listenFullScreen = (cb?: (isFull: boolean) => void) => {
  const winScreenHeight = ref(window.screen.availHeight); // 屏幕高度 window.screen.availHeight
  let ismonted = false;

  window.addEventListener("keydown", (e) => {
    if (e.code === "F11") e.preventDefault();
  });

  window.addEventListener("resize", () => {
    winScreenHeight.value = window.screen.availHeight; // window.screen.availHeight
  });

  onBeforeUnmount(() => {
    unMonted();
  });

  // 销毁监听
  const unMonted = () => {
    window.removeEventListener("keydown", () => {
      console.log("");
    });
    window.removeEventListener("resize", () => {
      console.log("");
    });
  };

  const wc = watch(
    () => winScreenHeight.value,
    (newVal: number, oldVal: number) => {
      if (!ismonted && oldVal && newVal) {
        ismonted = true;
        return;
      }
      // 这里加了oldVal- newVal > 20 ，是因为切换tab + alt 键会有几像素的差异
      if (newVal < oldVal && oldVal - newVal > 20 && oldVal) {
        // 执行回调
        typeof cb === "function" && cb(false);
        ismonted = false;
        // 销毁掉监听
        if (!ismonted) {
          unMonted();
          // 取消监听
          wc();
        }
      }
    }
  );
};

// 前端自定义排序
const customSortFunc = (attr: string, rev: number | boolean | any) => {
  //第二个参数没有传递 默认升序排列，第一个参数是指排的哪列数据比如id或者name等等
  if (rev === undefined) {
    rev = 1;
  } else {
    rev = rev ? 1 : -1;
  }

  return (a: Record<string, any>, b: Record<string, any>) => {
    a = a[attr];
    b = b[attr];
    if (a < b) {
      return rev * -1;
    }
    if (a > b) {
      return rev * 1;
    }
    return 0;
  };
};

// 更新项目缓存
const updateProjectCache = (item: ProjectItem) => {
  setSession("productInfo", typeof item !== "undefined" ? JSON.stringify(item) : "");
  store.commit(MutationType.updateProductInfo, item);
};

// 更新当前迭代缓存，
const updateCurrentIter = (item: Iterate) => {
  setSession("currentIter", typeof item !== "undefined" ? JSON.stringify(item) : "");
  store.commit(MutationType.updateCurrentIter, item);
  searchParams.demand = item?.id || null;
};

// 百分数转换为小数
const toPoint = (percent: string) => {
  let str: string | number = percent.replace("%", "");
  str = Number(str) / 100;
  return str;
};

// 小数转换为百分比
const toPercent = (point: number) => {
  let str: string | number = Number(point * 100);
  str = `${str}%`;
  return str;
};
const iterateId = computed(() => store.getters.iterateId);
const removeIdFromRouter = () => {
  const newQuery = JSON.parse(JSON.stringify(router.currentRoute.value.query));
  delete newQuery.detailId;
  delete newQuery.iterateId;
  if (router.currentRoute.value.meta.showIteration) {
    if (iterateId.value != 0) newQuery.iterateId = iterateId.value;
  }
  return router.replace({
    query: newQuery
  });
};

const addDetailIdToRouter = (id: number | null) => {
  const inIteration = computed(() => router.currentRoute.value.meta.inIteration);
  if (!inIteration.value) {
    return router.replace({
      query: Object.assign(
        { ...router.currentRoute.value.query },
        {
          detailId: id
        }
      )
    });
  } else {
    return router.replace({
      query: Object.assign(
        { ...router.currentRoute.value.query },
        {
          detailId: id
          // iterateId: iterateId.value
        }
      )
    });
  }
};

export {
  updateCurrentIter,
  updateProjectCache,
  customSortFunc,
  listenFullScreen,
  checkStaticSourceVersion,
  awaitFunc,
  toggleFullScreen,
  setSession,
  getSession,
  clearSession,
  STATUS,
  ENVIRONMENT_VARIABLE,
  getLocalhrefParams,
  isPlainObject,
  MESSAGE_TIP,
  TYPE_STATUS,
  BUG_STATUS,
  WORK_STATUS,
  WORK_TYPE,
  DYNAMICS_TYPE,
  TASK_TYPE,
  TASK_TYPE_LIST,
  BUG_LEVEL,
  PRIORITY,
  RUN_ENV,
  LANGUAGE,
  PLAN_STATUS,
  BUG_TYPE,
  TEST_OVERVIEW_STATUS,
  ENVLIST,
  CLASSIFY,
  COMMONCLASSIFY,
  LINKSHARE,
  PUBLICSHARE,
  debounce,
  setCookie,
  autoLoginYapiFn,
  getDomain,
  clearCookie,
  loadJs,
  readFile,
  hideText,
  setObjStringify,
  toPoint,
  toPercent,
  removeIdFromRouter,
  addDetailIdToRouter,
  getFirstName,
  checkURL,
  downloadUrl
};
