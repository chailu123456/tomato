import axiosInstance from "../index";
import api from "../dict";
import { RequestParams } from "@/types/request";
/**
 * @description 获取计划列表
 * @returns {Promise<T>}
 */
export function getPlanLists<T>(params?: any): Promise<T> {
  return axiosInstance.get<T>(api.getPlanLists, params);
}
/**
 *  @param create_by 创建人
 *  @param name: 计划名称
 *  @param page_index: 分页
 *  @param page_size: 分页
 *  @param product_id: 项目id
 *  @param status 状态
 *  @description 获取计划列表分页
 * @returns {Promise<T>}
 */
export function getPlanListsTurnPage<T>(params: RequestParams.GetPlanListsTurnPage): Promise<T> {
  return axiosInstance.get<T>(api.getPlanListsTurnPage, params);
}
/**
 * @param plan_id 计划id
 * @description 计划关联的需求信息
 * @returns {Promise<T>}
 */
export function getRelatedDemand<T>(params: { plan_id: number }): Promise<T> {
  return axiosInstance.get<T>(api.getRelatedDemand, params);
}
