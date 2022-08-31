import { AxiosRequestConfig } from "axios";

// 泛型类 AxiosPromise
// export type AxiosPromise<T = unknown> = Promise<T>;

export interface Axios {
  get<T>(url: string, params?: unknown): Promise<T>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  json<T>(url: string): Promise<T>;
  delete<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;

  // head<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;

  // options<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;

  // patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>;
}

export interface ResolvedFn<T = any> {
  (val: T): T | Promise<T>;
}

export interface RejectedFn {
  (error: any): any;
}

export enum ExceptionalCode {
  ERROR = "请求错误(400)",
  UNAUTHORIZED = "未授权,请登录(401)",
  ACCESS_DENIED = "拒绝访问(403)",
  NOT_FOUND = "请求地址出错(404)",
  NOT_ALLOW = "请求方法未允许(405)",
  TIME_OUT = "请求超时(408)",
  SERVER_ERROR = "服务器内部错误(500)",
  SERVER_ERROR1 = "服务未实现(501)",
  NETWORK_ERROR = "网络错误(502)",
  SERVER_UNAVAILABLE = "服务不可用(503)",
  GETWAY_TIMEOUT = "网关超时(504)",
  HTTP_VERSION_ERROR = "HTTP版本不受支持(505)",
  UNKNOWN_ERROR = "未知错误"
  // Gateway timeout
}
