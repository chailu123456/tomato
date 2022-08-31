/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:45:39
 * @LastEditTime: 2022-05-15 12:00:52
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\api\requestConfig.ts
 */
import { AxiosRequestConfig } from "axios";
import qs from "qs";
const axiosConfig: AxiosRequestConfig = {
  baseURL: "/",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json, text/json"
  },
  paramsSerializer: (params: any) => {
    // get请求，参数存在数组，进行分割
    return qs.stringify(params);
  }
};

export default axiosConfig;
