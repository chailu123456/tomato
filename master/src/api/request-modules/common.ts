import axiosInstance from "../index";
import api from "../dict";
import { RequestParams } from "@/types/request";
/**
 * @param keyword 关键字
 * @param department_code // 部门id
 * @description  信息技术部员工列表(穿梭框)
 * @returns {Promise<T>}
 */
export function getEmployeeList<T>(params?: { department_code?: string; keyword?: string }): Promise<T> {
  return axiosInstance.get<T>(api.getEmployeeList, params);
}

/**
 * @param keyword 关键字
 * @description  获取应用列表
 * @returns {Promise<T>}
 */
export function getAppList<T>(params?: { keyword: string }): Promise<T> {
  return axiosInstance.get<T>(api.getAppList, params);
}

/**
 * 获取站内通知列表
 * @param {Number} page_index 页码数
 * @param {Number} page_size 分页size
 * @returns
 */
export function getSiteMessage<T>(params: RequestParams.GetAppList): Promise<T> {
  return axiosInstance.get(api.getSiteMessage, params);
}
/**
 * 全部更新已读状态
 * @returns
 */
export function updateSiteAllMsgStatus<T>(): Promise<T> {
  return axiosInstance.post(api.updateSideMessageStatusAll);
}
/**
 * 更新单个消息已读状态
 * @param {number} id
 * @returns
 */
export function updateSiteMsgStatusById<T>(id: number): Promise<T> {
  return axiosInstance.put(`${api.updateSiteMsgStatusById}/${id}`);
}

/**
 *
 * @param code 地址栏跳转code
 * @returns {Promise<T>}
 */
export function getByUserId<T>(params: { code: string }): Promise<T> {
  return axiosInstance.post<T>(api.getByUserId, params);
}

/**
 *
 * @description 获取部门组织架构
 * @returns {Promise<T>}
 */
export function getDepartmentList<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getDepartmentList);
}

/**
 *
 * @description 获取部门组织架构+成员列表
 * @returns {Promise<T>}
 */
export function getDepartmentListPeople<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getDepartmentListPeople);
}

/**
 *
 * @description yapi自动登录
 * @returns {Promise<T>}
 */
export function autoLoginYapi<T>(): Promise<T> {
  return axiosInstance.get<T>(api.autoLoginYapi);
}

/**
 *
 * @description yapi接口权限
 * @returns {Promise<T>}
 */
export function yapiCheckPermission<T>(params: { iteration_id: number; product_id: number }): Promise<T> {
  return axiosInstance.get<T>(api.yapiCheckPermission, params);
}

/**
 *
 * @description 设置-测试环境  yapi迭代更新
 * @returns {Promise<T>}
 */
export function yapiEnvUpload<T>(params: { env: any[]; product_id: number }): Promise<T> {
  return axiosInstance.post<T>(api.yapiUploadEnv, params);
}

/**
 *
 * @description 获取企业微信员工推送设置
 * @returns {Promise<T>}
 */
export function getWorkerSetting<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getWorkerSetting);
}

/**
 * 更新企业微信员工推送设置
 * @param {number} id
 * @returns
 */
export function updateWorkerSetting<T>(params: { bug_alert: string; task_alert: string }): Promise<T> {
  return axiosInstance.put(api.editWorkerSetting, params);
}

/**
 * @param search_type 搜索类型:1=迭代负责人,2=前端负责人,3=后端负责人,4=测试负责人
 * @param product_id 项目ID
 * @description  获取新增迭代弹框员工列表(产品，前端，后端，测试负责人)
 * @returns {Promise<T>}
 */
export function getStaffList<T>(params?: { product_id: number; search_type?: number; iteration_id?: number; type?: string }): Promise<T> {
  return axiosInstance.get<T>(`${api.getIterationUserList + "/" + params?.product_id + "/staff-select"}`, params);
}

/**
 *
 * @description 上传视频
 * @returns {Promise<T>}
 */
export function videoUpload<T>(params: any): Promise<T> {
  return axiosInstance.post<T>(api.uploadAssets, params);
}

/**
 * @param product_id 项目ID
 * @description  获取模块列表(需求池>所属模块, 模块管理)
 * @returns {Promise<T>}
 */
export function getModuleList<T>(params: { product_id: number }): Promise<T> {
  return axiosInstance.get<T>(api.getModuleList, params);
}
