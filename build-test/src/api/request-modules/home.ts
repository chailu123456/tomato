/*
 * @Author: 宋绍华
 * @Date: 2022-05-16 15:34:39
 * @LastEditTime: 2022-05-17 17:20:53
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\api\request-modules\home.ts
 */

import api from "../dict";
import axiosInstance from "../index";

/**
 * @description 项目成员列表
 * @param {number} product_id 项目ID
 * @returns {Promise<T>}
 */

export function getStaffList<T>(product_id: number): Promise<T> {
  return axiosInstance.get<T>(`${api.staffList}/${product_id}/staff`);
}

/**
 * @description 项目时间轴
 * @param {number} product_id 项目ID
 * @returns {Promise<T>}
 */

export function getTimeLine<T>(product_id: number): Promise<T> {
  return axiosInstance.get<T>(`${api.staffList}/${product_id}/timeline`);
}

/**
 * @description 项目详情
 * @param {number} product_id 项目ID
 * @returns {Promise<T>}
 */

export function getProductDetails<T>(product_id: number): Promise<T> {
  return axiosInstance.get<T>(`${api.staffList}/${product_id}`);
}

/**
 * @description 项目详情
 * @param {number} product_id 项目ID
 * @returns {Promise<T>}
 */

export function getIndicatorsInfo<T>(product_id: number): Promise<T> {
  return axiosInstance.get<T>(`${api.staffList}/${product_id}/indicators`);
}

/**
 * @description 项目结项/搁置
 * @param {string} product_id 项目ID
 * @param {string} state 项目状态  1: 未开始 2: 进行中 3: 搁置 4：结项 （此接口只支持state=3,4）
 * @returns {Promise<T>}
 */

export function handleProjectStatus<T>(params: { product_id: number; state: number }): Promise<T> {
  const { product_id, state } = params;
  return axiosInstance.put<T>(`${api.staffList}/${product_id}/state/${state}`);
}
