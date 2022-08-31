import axiosInstance from "../index";
import api from "../dict";
import { RequestParams } from "@/types/request";
/**
 * @param page_index 分页页码
 * @param page_size 分页大小
 * @param name 名字
 * @description  应用列表
 * @returns {Promise<T>}
 */
export function getSettingAppList<T>(params: RequestParams.GetAppList): Promise<T> {
  return axiosInstance.get<T>(api.getSettingAppList, params);
}

/**
 * @param code_language 源码语言
 * @param git_url gitlab URL
 * @param id 主键ID 传0创建，否则编辑
 * @param name 项目名称
 * @param remark 备注
 * @param run_env 寄宿运行环境,1:宿主机,2:docker,3:k8s
 * @description  应用创建/更新
 * @returns {Promise<T>}
 */
export function createAndUpdateAppList<T>(params: RequestParams.CreateAndUpdateAppList): Promise<T> {
  return axiosInstance.post<T>(api.createSettingApp, params);
}
