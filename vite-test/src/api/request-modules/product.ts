import axiosInstance from "../index";
import api from "../dict";
import { RequestParams } from "@/types/request";
/**
 *
 * @param name 产品名称
 * @param remark  简述
 * @description 产品列表-创建产品
 * @returns {Promise<T>}
 */
export function createProduct<T>(params: Array<RequestParams.CreateProductParams>): Promise<T> {
  return axiosInstance.post<T>(api.createProduct, params);
}

/**
 *
 * @param name 产品名称
 * @param remark  简述
 * @param id  编辑产品列表id
 * @description 产品列表-编辑产品
 * @returns {Promise<T>}
 */
export function updateProduct<T>(params: Array<RequestParams.UpdateProductParams>): Promise<T> {
  return axiosInstance.put<T>(api.updateProduct, params);
}

/**
 *
 * @param name 产品名称
 *  manager  负责人,值为员工编号
 * @param pageIndex  分页页码
 * @param pageSize  分页大小
 * @description 获取产品列表
 * @returns {Promise<T>}
 */
export function getProductList<T>(params: RequestParams.GetProductList): Promise<T> {
  return axiosInstance.get<T>(api.getProductList, params);
}

/**
 *
 * @param id 产品id
 * @param status 产品状态 0:下线;1正常
 * @description 更新产品状态
 * @returns {Promise<T>}
 */
export function updateStatus<T>(params: Array<RequestParams.UpdateStatus>): Promise<T> {
  return axiosInstance.post<T>(api.updateStatus, params);
}

/**
 *
 * @description 产品选择下拉列表
 * @returns {Promise<T>}
 */
export function selectProductList<T>(): Promise<T> {
  return axiosInstance.get<T>(api.selectProductList);
}

/**
 *
 * @description 负责人下拉列表
 * @returns {Promise<T>}
 */
export function selectManagerList<T>(): Promise<T> {
  return axiosInstance.get<T>(api.selectManagerList);
}

/**
 *
 * @param name 需求简要描述
 * @param product_id  选择的产品名称id
 * @description 创建需求
 * @returns {Promise<T>}
 */
export function createDemand<T>(params: RequestParams.CreateDemand): Promise<T> {
  return axiosInstance.post<T>(api.createDemand, params);
}

/**
 *
 * @param pageSize 每页大小
 * @param pageIndex  当前页
 * @param status  状态，0未开始，1设计中，2开发中，3联调中，4测试中，5待发版，6已发版，999已废弃
 * @param product_id  产品ID
 * @description 获取需求列表
 * @returns {Promise<T>}
 */
export function getDemandList<T>(params: RequestParams.GetDemandList): Promise<T> {
  return axiosInstance.get<T>(api.getDemandList, params);
}

/**
 *
 * @param id 需求id
 * @description 需求作废
 * @returns {Promise<T>}
 */
export function deleteDemand<T>(params: number): Promise<T> {
  return axiosInstance.delete<T>(api.deleteDemand, params);
}

/**
 * @param id 需求id
 * @param product_id 产品id
 * @param name 需求描述
 * @param child_list 子需求
 * @description 维护需求
 * @returns {Promise<T>}
 */
export function putDemand<T>(params: RequestParams.PutDemand): Promise<T> {
  return axiosInstance.put<T>(api.putDemand, params);
}

/**
 * @description 获取计划列表
 * @returns {Promise<T>}
 */
export function getPlan<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getPlan);
}

/**
 *
 * @param deliver_time 预估交付
 * @param demand_ids 需求ID
 * @param name 计划简称
 * @param id 计划id
 * @param product_id 产品ID
 * @param version 计划版本
 * @description 创建计划
 * @returns {Promise<T>}
 */
export function updatePlan<T>(params: RequestParams.UpdatePlan): Promise<T> {
  return axiosInstance.put<T>(api.updatePlan, params);
}

/**
 * @param deliver_time 预估交付
 * @param demand_ids 需求ID
 * @param name 计划简称
 * @param product_id 产品ID
 * @param version 计划版本
 * @description 创建计划
 * @returns {Promise<T>}
 */
export function createPlan<T>(params: RequestParams.CreatePlan): Promise<T> {
  return axiosInstance.post<T>(api.createPlan, params);
}

/**
 * @param id 计划ID
 * @param status 计划状态,0:待设计;1:设计中;2:待评审;3:待开发;4:开发中;5:测试中;6:待发版;7:已发版
 * @description  更新状态
 * @returns {Promise<T>}
 */
export function updatePlanStatus<T>(params: { id: number; status: number }): Promise<T> {
  return axiosInstance.put<T>(api.updatePlanStatus, params);
}

/**
 * @param id 计划ID
 * @description  作废计划
 * @returns {Promise<T>}
 */
export function deletePlan<T>(id: number): Promise<T> {
  return axiosInstance.delete<T>(api.deletePlan, id);
}

/**
 * @param product_id 产品ID
 * @param plan_id 计划ID
 * @param is_bind 是否只展示可关联需求
 * @description 获取关联计划列表
 * @returns {Promise<T>}
 */
export function getRelevanceDemandList<T>(params?: RequestParams.GetRelevanceDemandList): Promise<T> {
  return axiosInstance.get<T>(api.getRelevanceDemandList, params);
}
