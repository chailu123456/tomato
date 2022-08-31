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
const service = axios.create(axiosConfig);
import { getSession, clearSession } from "@/utils";
import { USER } from "../store/state";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
NProgress.configure({ showSpinner: false }); // 进度环隐藏
// import qs from "qs";
// Request interceptors
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const session = getSession("user", true) as USER;
    if (session) {
      config.headers["Authorization"] = `Bearer ${session.token}`;
    }
    NProgress.start();
    return config;
  },
  (error: AxiosError) => {
    Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response: AxiosResponse<ResponseData<unknown>>) => {
    // 和后端定义好数据结构
    const { code, message } = response.data;
    if (code !== 200 && code !== 204) {
      exceptionalCode(code!);
      ElMessage({
        type: "error",
        showClose: true,
        message: message
      });
      return Promise.reject(new Error(message || "Error"));
    }
    NProgress.done();
    return response;
  },
  (error: AxiosError & { response: { code: number } }) => {
    ElMessage({
      message: exceptionalCode(error.response.code),
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
  delete<T>(url: string, params?: unknown) {
    return new Promise((resolve: ResolvedFn, reject: RejectedFn) => {
      service
        .delete(url + params)
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
  switch (code) {
    case 400:
      message = ExceptionalCode.ERROR;
      break;
    case 401:
      message = ExceptionalCode.UNAUTHORIZED;
      //清除信息
      clearSession();
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
