import { AxiosRequestConfig } from "axios";
import qs from "qs";
const axiosConfig: AxiosRequestConfig = {
  baseURL: "/",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json, text/json"
  },
  // transformRequest: [
  //   (data: any) => {
  //     //对data进行任意转换处理
  //     console.log(data, "4635");
  //     return data;
  //   }
  // ],
  paramsSerializer: (params: any) => {
    params.page_index = params.pageIndex;
    params.page_size = params.pageSize;
    delete params.pageSize;
    delete params.pageIndex;
    return qs.stringify(params);
  }
  // responseType: "json"
};

export default axiosConfig;
