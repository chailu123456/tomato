/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:46:11
 * @LastEditTime: 2022-04-21 20:49:23
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\api\request-modules\lookboard.ts
 */
import axiosInstance from "../index";
import api from "../dict";
import { RequestParams } from "@/types/request";

/**
 * @param month 月份
 * @param product_id  项目id
 * @description  月度统计 tab
 * @returns {Promise<T>}
 */
export function montnlyStatistics<T>(params: { month: string; product_id: number }): Promise<T> {
  return axiosInstance.get<T>(api.montnlyStatistics, params);
}

/**
 * @param month 月份
 * @param product_id  项目id
 * @param iteration_id  迭代ID
 * @param status  迭代状态
 * @param start_time  开始时间
 * @param end_time  结束时间
 * @description  月度统计 tab
 * @returns {Promise<T>}
 */
export function qualityOverflow<T>(params: RequestParams.GetUseQualityList): Promise<T> {
  params.pageSize = params.page_size;
  if (!params.status) delete params.status;
  return axiosInstance.get<T>(api.qualityOverflow, params);
}

/**
 * @param iteration_id  迭代ID
 * @returns {Promise<T>}
 */
export function getIterationList<T>(params: { iteration_id: number }): Promise<T> {
  return axiosInstance.get<T>(`${api.iterationList + "/" + params.iteration_id + "/demand"}`, params);
}
