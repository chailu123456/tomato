/**
 * 调用示例
 * 定义返回数据格式接口
 * interface User {
 *   name:string;
 *   age:number
 * }
 * 传入定义好的接口
 * this.$ajax.get<User>(this.$api.main)
 *     .then((res) => {res.name})
 */
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import axiosConfig from "./requestConfig";
import { Axios, ResolvedFn, RejectedFn, ExceptionalCode } from "./types";
import { ElMessage } from "element-plus";
import { clearCookie, getDomain } from "@/utils";
const service = axios.create(axiosConfig);
import { getSession, setSession, clearSession } from "@/utils";
// import { addPending, removePending } from "./cancelRequest";
import { USER } from "../store/state";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
NProgress.configure({ showSpinner: false }); // 进度环隐藏
import qs from "qs";
import router from "@/router";
// Request interceptors
enum METHODS {
  GET = "get",
  DELETE = "delete"
}
function tip(message: string | undefined) {
  ElMessage({
    type: "error",
    showClose: true,
    message: message
  });
}
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const session = getSession("user", true) as USER;
    const version = getSession("version");
    if (session) {
      config.headers["Authorization"] = `Bearer ${session.token}`;
      // removePending(config); // 在请求开始前，对之前的请求做检查取消操作
      // addPending(config); // 将当前请求添加到 pending 中
    }
    if (version !== "1.11.0") {
      clearSession("user");
      clearSession("jumpUrl");
      clearSession("defaultActivePath");
      clearCookie("_yapi_uid", "/", getDomain());
      clearCookie("_yapi_token", "/", getDomain());
      router.push({
        name: "login"
      });
    }
    NProgress.start();
    // 拦截get请求，处理get请求的数组参数
    const { method, params } = config;
    if (method === METHODS.GET) {
      // 遍历params，获取其中的数组
      for (const key in params) {
        if (params.pageIndex && params.pageSize) {
          params.page_index = params.pageIndex;
          params.page_size = params.pageSize;
          delete params.pageSize;
          delete params.pageIndex;
        }
        if (Array.isArray(params[key])) {
          config.paramsSerializer = function (params) {
            return qs.stringify(params, { arrayFormat: "repeat" });
          };
        }
      }
    }
    // if (method === METHODS.DELETE) {
    //   for (const key in data) {
    //     if (Array.isArray(data[key])) {
    //       config.paramsSerializer = function (data) {
    //         return qs.stringify(data, { arrayFormat: "repeat" });
    //       };
    //     }
    //   }
    // }

    return config;
  },
  (error: AxiosError) => {
    Promise.reject(error);
  }
);
let timer: ReturnType<typeof setTimeout>;
service.interceptors.response.use(
  (response: AxiosResponse<ResponseData<unknown>>) => {
    NProgress.done();
    // removePending(response.config); // 在请求结束后，移除本次请求
    // 和后端定义好数据结构
    const { code, message } = response.data;
    if (response.data && response.data.url) {
      return response;
    } else if (code !== 200 && code !== 204) {
      if (code === 401) {
        exceptionalCode(401);
      }
      clearTimeout(timer);
      timer = setTimeout(async () => {
        tip(message);
      }, 1500);
      Promise.reject(new Error(message || "Error"));
      return response;
    }
    return response;
  },
  (error: AxiosError & { message: Record<string, any>; response: { code: number } }) => {
    NProgress.done();
    // debugger;
    if (error.message.isCancel) return Promise.reject(error);
    ElMessage({
      message: exceptionalCode(error?.response?.code),
      type: "error",
      showClose: true
    });

    return Promise.reject(error);
  }
);
const axiosInstance: Axios = {
  get<T>(url: string, params?: unknown) {
    return new Promise((resolve: ResolvedFn, reject: RejectedFn) => {
      service
        .get(url, {
          params
        })
        .then((response: AxiosResponse<ResponseData<T>>) => {
          resolve(response.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return new Promise((resolve: ResolvedFn, reject: RejectedFn) => {
      service
        .post(url, data, config)
        .then((response: AxiosResponse<ResponseData<T>>) => {
          if (response.status === 200) {
            resolve(response.data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  json<T = unknown>(url: string) {
    return new Promise((resolve: ResolvedFn, reject: RejectedFn) => {
      axios
        .get(url)
        .then((response: AxiosResponse<ResponseData<T>>) => {
          if (response.status === 200) {
            resolve(response.data);
          }
        })
        .catch((err) => {
          ElMessage({
            type: "error",
            showClose: true,
            message: err.message
          });
          reject(err);
        });
    });
  },
  delete<T>(url: string, data?: any) {
    console.log(data);
    return new Promise((resolve: ResolvedFn, reject: RejectedFn) => {
      service
        .delete(url, data)
        .then((response: AxiosResponse<ResponseData<T>>) => {
          resolve(response.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  // head(url: string, config?: AxiosRequestConfig) {
  //   return new Promise((resolve: ResolvedFn, reject: RejectedFn) => {});
  // },
  // options(url: string, config?: AxiosRequestConfig) {
  //   return new Promise((resolve: ResolvedFn, reject: RejectedFn) => {});
  // },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return new Promise((resolve: ResolvedFn, reject: RejectedFn) => {
      service
        .put(url, data, config)
        .then((response: AxiosResponse<ResponseData<T>>) => {
          if (response.status === 200) {
            resolve(response.data);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  // patch(url: string, config?: AxiosRequestConfig) {
  //   return new Promise((resolve: ResolvedFn, reject: RejectedFn) => {});
  // }
};

function exceptionalCode(code: number) {
  let message = "";
  let localProductId = "";
  switch (code) {
    case 400:
      message = ExceptionalCode.ERROR;
      break;
    case 401:
      message = ExceptionalCode.UNAUTHORIZED;
      //清除信息  去除信息前保存项目id，下次登录进来默认上次保存的项目id
      localProductId = getSession("productId") as string;
      clearSession();
      setSession("productId", localProductId);
      window.location.href = "#/login";
      break;
    case 403:
      message = ExceptionalCode.ACCESS_DENIED;
      break;
    case 404:
      message = ExceptionalCode.NOT_FOUND;
      break;
    case 405:
      message = ExceptionalCode.NOT_ALLOW;
      break;
    case 408:
      message = ExceptionalCode.TIME_OUT;
      break;
    case 500:
      message = ExceptionalCode.SERVER_ERROR;
      break;
    case 501:
      message = ExceptionalCode.SERVER_ERROR1;
      break;
    case 502:
      message = ExceptionalCode.NETWORK_ERROR;
      break;
    case 503:
      message = ExceptionalCode.SERVER_UNAVAILABLE;
      break;
    case 504:
      message = ExceptionalCode.GETWAY_TIMEOUT;
      break;
    case 505:
      message = ExceptionalCode.HTTP_VERSION_ERROR;
      break;
    default:
      message = ExceptionalCode.ACCESS_DENIED;
  }
  return message;
}
export default axiosInstance;
