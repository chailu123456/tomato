import axiosInstance from "../index";
import api from "../dict";
/**
 * @description 获取计划列表
 * @returns {Promise<T>}
 */
export function getPlanLists<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getPlanLists);
}
