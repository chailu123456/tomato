import axiosInstance from "../index";
import api from "../dict";
import { RequestParams } from "@/types/request";
import { ApprovalEditForm } from "@/types/interface";
import { SaveWeekReportInter } from "@/composables/useIteration";
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
export function selectManagerList<T>(params: { product_id?: number }): Promise<T> {
  return axiosInstance.get<T>(api.selectManagerList, params);
}

/**
 *
 * @description 需求模块-计划下来选择列表
 * @returns {Promise<T>}
 */
export function getDemandPlanList<T>(params: RequestParams.GetUserDemandList): Promise<T> {
  return axiosInstance.get<T>(api.demandPlanList, params);
}

/**
 *
 * @description 需求用户下拉列表
 * @param producId  选择的产品名称id
 * @returns {Promise<T>}
 */
export function demandUserList<T>(params: RequestParams.GetUserDemandList): Promise<T> {
  return axiosInstance.get<T>(api.demandUserList, params);
}

/**
 * @param level 优先级
 * @param parent_id 拆分需求父级ID
 * @param product_id 产品ID
 * @param id 需求ID
 * @param description 需求描述
 * @param creator  创建人名称
 * @param name 需求简要描述
 * @param product_id  选择的产品名称id
 * @param create_by  创建人工号
 * @description 创建需求
 * @returns {Promise<T>}
 */
export function createDemand<T>(params: RequestParams.CreateDemand): Promise<T> {
  return axiosInstance.post<T>(api.createDemand, params);
}

/**
 * @param level 优先级
 * @param parent_id 拆分需求父级ID
 * @param product_id 产品ID
 * @param id 需求ID
 * @param description 需求描述
 * @param creator  创建人名称
 * @param name 需求简要描述
 * @param product_id  选择的产品名称id
 * @param create_by  创建人工号
 * @description 编辑需求
 * @returns {Promise<T>}
 */
export function editDemand<T>(params: Record<string, any>): Promise<T> {
  return axiosInstance.put<T>(api.createDemand, params);
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
  return axiosInstance.delete<T>(`${api.deleteDemand + params}`, "");
}

/**
 * @param ids 需求id
 * @param level 优先级
 * @description 批量修改优先级
 * @returns {Promise<T>}
 */
export function updatePriority<T>(params: { ids: number[]; level: number }): Promise<T> {
  return axiosInstance.put<T>(api.updatePriority, params);
}

/**
 * @param ids 需求id
 * @description 批量作废
 * @returns {Promise<T>}
 */
export function updateTrash<T>(params: { ids: number[] }): Promise<T> {
  return axiosInstance.put<T>(api.updateTrash, params);
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
 *
 * @param id  需求ID
 * @description 获取需求详情
 * @returns {Promise<T>}
 */
export function getDemandDetail<T>(params: RequestParams.GetDemandListDetail): Promise<T> {
  return axiosInstance.get<T>(`${api.getDemandListDetail + "/" + params.id}`, "");
}

/**
 *
 * @param id  需求ID
 * @description 获取需求详情-动态
 * @returns {Promise<T>}
 */
export function getDemandListDetailLog<T>(id: number): Promise<T> {
  return axiosInstance.get<T>(`${api.getDemandListDetailLog + "/" + id}`);
}

/**
 * @param create_by  创建人
 * @param name  计划名称
 * @param product_id  产品/项目id
 * @description 获取计划列表
 * @returns {Promise<T>}
 */
export function getPlan<T>(params: RequestParams.GetPlan): Promise<T> {
  return axiosInstance.get<T>(api.getPlan, params);
}

/**
 * @param name  来源人
 * @description 获取需求详情来源人、来源部门
 * @returns {Promise<T>}
 */
export function getDemandOriginList<T>(params: { name: string }): Promise<T> {
  return axiosInstance.get<T>(api.getDemandOriginList, params);
}

/**
 * @param id  计划id
 * @description 获取计划详情
 * @returns {Promise<T>}
 */
export function detailPlan<T>(params: { id: number }): Promise<T> {
  return axiosInstance.get<T>(`${api.getPlan + "/" + params.id}`);
}

/**
 *
 * @description 审批单用户列表
 * @returns {Promise<T>}
 */
export function getApprovalUser<T>(): Promise<T> {
  return axiosInstance.get<T>(api.getApprovalUser, "");
}

/**
 * @param id
 * @description 撤回审批单
 * @returns {Promise<T>}
 */
export function editWithdraw<T>(params: { id: number }): Promise<T> {
  return axiosInstance.post<T>(`${api.withdraw + params.id + "/withdraw"}`, params);
}

/**
 * @param id
 * @description 删除审批单
 * @returns {Promise<T>}
 */
export function removeApprove<T>(params: { id: number }): Promise<T> {
  return axiosInstance.delete<T>(`${api.deleteApproval + params.id}`, "");
}

/**
 * @param id
 * @description 提醒审批单
 * @returns {Promise<T>}
 */
export function remindApproval<T>(params: { id: number }): Promise<T> {
  return axiosInstance.post<T>(`${api.deleteApproval + params.id + "/remind"}`, params);
}

/**
 *
 * @param end_time 结束时间
 * @param start_time 开始时间
 * @param id 计划ID
 * @param name 计划简称
 * @param product_id 产品ID
 * @param staff_no 负责人
 * @param staff_name 负责人姓名
 * @param remark 备注
 * @description 更新计划
 * @returns {Promise<T>}
 */
export function updatePlan<T>(params: RequestParams.UpdatePlanList): Promise<T> {
  return axiosInstance.put<T>(api.updatePlan, params);
}

/**
 * @param end_time 结束时间
 * @param start_time 开始时间
 * @param name 计划简称
 * @param product_id 产品ID
 * @param staff_no 负责人
 * @param staff_name 负责人姓名
 * @param remark 备注
 * @description 创建计划
 * @returns {Promise<T>}
 */
export function createPlan<T>(params: RequestParams.UpdatePlanList): Promise<T> {
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
 * @param demand_id 需求ID
 * @param plan_id 计划id
 * @description  移除计划详情-计划下的需求
 * @returns {Promise<T>}
 */
export function removePlanDemand<T>(params: { demand_id: number; plan_id: number }): Promise<T> {
  return axiosInstance.put<T>(api.movePlanDemand, params);
}

/**
 * @param id 计划ID
 * @description  作废计划
 * @returns {Promise<T>}
 */
export function deletePlan<T>(id: number): Promise<T> {
  return axiosInstance.delete<T>(`${api.deletePlan + id}`);
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

/**
 * @param product_id 产品ID
 * @param plan_id 计划ID
 * @param product_module_id 是否只展示可关联需求
 * @description 获取需求池列表
 * @returns {Promise<T>}
 */
export function getDemandListStatus<T>(params: any): Promise<T> {
  if (!params.product_module_id) delete params.product_module_id;
  if (!params.level) delete params.level;
  if (!params.create_by) delete params.create_by;
  if (!params.demand_status) delete params.demand_status;

  // product_module_id  level   create_by
  return axiosInstance.get<T>(api.getDemandListStatus, params);
}
/**
 * @param product_id 产品ID
 * @param status  状态
 * @param product_module_id 模块ID
 * @param level 优先级
 * @param create_by 创建人
 * @description 获取需求池列表翻页
 * @returns {Promise<T>}
 */
export function getDemandListPage<T>(params: any): Promise<T> {
  return axiosInstance.get<T>(api.getDemandListPage, params);
}

/**
 * @param staff_no   员工编号
 * @description 获取员工详情（具体部门）
 * @returns {Promise<T>}
 */
export function getStaffDetail<T>(params: { staff_no: string }): Promise<T> {
  return axiosInstance.get<T>(api.getStaffDetail, params);
}

/**
 * @param product_id   项目id
 * @description 获取设置模块-模块列表
 * @returns {Promise<T>}
 */
export function getSettingModule<T>(params: { product_id: number }): Promise<T> {
  return axiosInstance.get<T>(api.getSettingModule, params);
}

/**
 * @param id   模块id
 * @param name   名称
 * @description 编辑设置模块-模块列表
 * @returns {Promise<T>}
 */
export function editSettingModule<T>(params: { id: number; name: string }): Promise<T> {
  return axiosInstance.put<T>(`${api.editSettingModule + "/" + params.id}`, params);
}

/**
 * @param id   模块id
 * @description 删除设置模块-模块列表
 * @returns {Promise<T>}
 */
export function deleteSettingModule<T>(params: { id: number }): Promise<T> {
  return axiosInstance.delete<T>(`${api.deleteSettingModule + "/" + params.id}`, "");
}

/**
 * @param parent_id 父级id
 * @param name 模块名称
 * @param product_id 产品ID
 * @description 创建设置模块-模块
 * @returns {Promise<T>}
 */
export function createSettingModule<T>(params: { parent_id: number; product_id: number; name: string }): Promise<T> {
  return axiosInstance.post<T>(api.createSettingModule, params);
}

/**
 * @param product_id  项目id
 * @param product_module_id  模块ID
 * @description 获取设置模块-模块列表
 * @returns {Promise<T>}
 */
export function settingModuleDemand<T>(params: { product_id: number; product_module_id: number; pageIndex: number; pageSize: number }): Promise<T> {
  return axiosInstance.get<T>(api.settingModuleDemand, params);
}

/**
 * @param product_id  项目id
 * @description 获取成员模块-列表
 * @returns {Promise<T>}
 */
export function memberList<T>(params: { product_id: number; pageIndex: number; pageSize: number }): Promise<T> {
  return axiosInstance.get<T>(`${api.memberList + "/" + params.product_id + "/staff"}`, params);
}

/**
 * @param product_id  项目id
 * @description 获取成员模块-列表
 * @returns {Promise<T>}
 */
export function addMember<T>(params: { product_id: number; staff_nos: string[] }): Promise<T> {
  return axiosInstance.post<T>(`${api.addMember + "/" + params.product_id + "/staff"}`, params);
}

/**
 * @param product_id  项目id
 * @description 获取成员模块-列表
 * @returns {Promise<T>}
 */
export function setManage<T>(params: { product_id: number; staff_no: string }): Promise<T> {
  return axiosInstance.post<T>(`${api.setManage + "/" + params.product_id + "/set-manager"}`, params);
}

/**
 * @param product_id  项目id
 * @description 获取成员模块-列表
 * @returns {Promise<T>}
 */
export function deleteMember<T>(params: { product_id: number; staff_nos: string[] }): Promise<T> {
  return axiosInstance.delete<T>(`${api.deleteMember + "/" + params.product_id + "/staff"}`, { data: params });
}

/**
 * @param product_id  项目id
 * @param iterationId  迭代id
 * @description 迭代-迭代概览-添加成员-列表
 * @returns {Promise<T>}
 */
export function getProductMember<T>(params: { product_id: number | null; iteration_id: number | null }): Promise<T> {
  return axiosInstance.get<T>(`${api.getProductMember + "/" + params.product_id + "/staff-tree"}`, params);
}

/**
 * @param product_id  项目id
 * @description 获取成员模块-下拉列表
 * @returns {Promise<T>}
 */
export function allMember<T>(params: { product_id: number }): Promise<T> {
  return axiosInstance.get<T>(`${api.allMember + "/" + params.product_id + "/staff-select"}`, "");
}

/**
 * 获取审批列表
 * @param params
 * @returns
 */
export function getApprovalApi<T>(params: {
  staff_no: number;
  title: string;
  status: number;
  product_id: number;
  pageIndex: number;
  pageSize: number;
}): Promise<T> {
  return axiosInstance.get<T>(api.getApproval, params);
}
/**
 * 新增审批单
 * @param params
 * @returns
 */
export function addApprovalApi<T>(params: ApprovalEditForm): Promise<T> {
  return axiosInstance.post<T>(api.getApproval, params);
}
/**
 * 编辑审批单
 * @param params
 * @returns
 */
export function editApprovalApi<T>(params: ApprovalEditForm): Promise<T> {
  return axiosInstance.put<T>(api.getApproval, params);
}
/**
 * 提交审批单
 * @param params
 * @returns
 */
export function submitApprovalApi<T>(params: ApprovalEditForm): Promise<T> {
  return axiosInstance.post<T>(`${api.getApproval}/submit`, params);
}
/**
 * 撤回审批单
 * @param params
 * @returns
 */
export function withDrawApprovalApi<T>(id: number): Promise<T> {
  return axiosInstance.post<T>(`${api.getApproval}/${id}/withdraw`, { id });
}
/**
 * 获取审批单列表
 * @param params
 * @returns
 */
export function getDemandApprovalList<T>(product_id: string): Promise<T> {
  return axiosInstance.get<T>(`${api.getDemandApprovalList}?product_id=${product_id}`);
}
/**
 * 获取审批单详情
 * @param params
 * @returns
 */
export function getDemandApprovalDetails<T>(id: number): Promise<T> {
  return axiosInstance.get<T>(`${api.remindApproval}/${id}`);
}
/**
 * 获取 审批单记录
 * @param params
 * @returns
 */
export function getDemandApprovalLogListApi<T>(id: number): Promise<T> {
  return axiosInstance.get<T>(`${api.getDemandApprovalLogList}/${id}`);
}

/**
 * 保存迭代周报
 * @param params
 * @returns
 */
export function saveWeekReportApi<T>(params: SaveWeekReportInter): Promise<T> {
  return axiosInstance.post<T>(`${api.handleWeekReport}/${params.iteration_id}/weekly`, params);
}
/**
 * 获取迭代周报list
 * @param params
 * @returns
 */
export function getWeekReportListApi<T>(iteration_id: number): Promise<T> {
  return axiosInstance.get<T>(`${api.handleWeekReport}/${iteration_id}/weekly`);
}
/**
 * 获取迭代周报
 * @param params
 * @returns
 */
export function getWeekReportByWeekApi<T>(params: { iteration_id: number; week: number }): Promise<T> {
  return axiosInstance.get<T>(`${api.handleWeekReport}/${params.iteration_id}/weekly/${params.week}`);
}
