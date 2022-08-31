import axiosInstance from "../index";
import api from "../dict";
import { RequestParams } from "@/types/request";
/**
 * @param keyword 关键字
 * @description  信息技术部员工列表(穿梭框)
 * @returns {Promise<T>}
 */
export function getEmployeeList<T>(params?: { keyword: string }): Promise<T> {
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
 *
 * @param code 地址栏跳转code
 * @returns {Promise<T>}
 */
export function getByUserId<T>(params: { code: string }): Promise<T> {
  return axiosInstance.get<T>(api.getByUserId, params);
}
