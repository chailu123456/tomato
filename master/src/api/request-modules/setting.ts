/*
 * @Author: 宋绍华
 * @Date: 2021-10-30 16:26:32
 * @LastEditTime: 2022-05-25 16:00:01
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\api\request-modules\setting.ts
 */
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

/**
 * 取消搁置
 * @returns {Promise<T>}
 */
export function onUnshelve<T>(product_id: number): Promise<T> {
  return axiosInstance.put<T>(`${api.unshelve}/${product_id}/unshelve`);
}
