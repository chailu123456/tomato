import { AxiosRequestConfig } from "axios";
import qs from "qs";
const axiosConfig: AxiosRequestConfig = {
  baseURL: "/",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json, text/json"
  },
  // transformRequest: [
  //   (data: any, headers: any) => {
  //     //对data进行任意转换处理
  //     console.log(data, "4635", headers);
  //     return data;
  //   }
  // ],
  paramsSerializer: (params: any) => {
    // get请求，参数存在数组，进行分割

    // if (params.pageIndex && params.pageSize) {
    //   params.page_index = params.pageIndex;
    //   params.page_size = params.pageSize;
    //   delete params.pageSize;
    //   delete params.pageIndex;
    // }
    return qs.stringify(params);
  }

  // responseType: "json"
};

export default axiosConfig;
