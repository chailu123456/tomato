/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 11:41:44
 * @LastEditTime: 2022-04-22 11:04:21
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\api\request-modules\board.ts
 */
import axiosInstance from "../index";
import api from "../dict";
import { StaffWorkQualityParams } from "@/composables/useBoardBase";

/**
 * 获取成员工作质量列表
 * @param {number} product_id // 项目ID
 * @param {number} iteration_id // 迭代ID
 * @param {number} month // 月份
 * @param {string} staff_name // 成员名称
 * @param {number} department_code // 部门编号
 * @param {number} position_type // 岗位类型
 * @param {number} page_index // 分页页码
 * @param {number} page_size // 分页大小
 * @returns
 */
export function getStaffWorkQualityList<T>(params?: StaffWorkQualityParams): Promise<T> {
  return axiosInstance.get<T>(api.staffWorkQuality, params);
}

/**
 * 获取成员迭代列表
 * @param {number} product_id 项目ID
 * @returns
 */
export function getIterateList<T>(params?: { product_id: number }): Promise<T> {
  return axiosInstance.get<T>(api.iterateList, params);
}
