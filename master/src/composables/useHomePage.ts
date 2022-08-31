/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 19:20:18
 * @LastEditTime: 2022-08-11 15:26:00
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\composables\useHomePage.ts
 */

import { getIndicatorsInfo, getProductDetails, getStaffList, getTimeLine, handleProjectStatus } from "@/api/request-modules/home";
import { getAssociatedDemandDoc, getPlanSelect, updateIterPlan } from "@/api/request-modules/iteration";
import { addMember, deleteMember, setManage } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
import { awaitFunc } from "@/utils";

// 项目成员列表 接口响应类型
export interface StaffResp {
  count?: number;
  can_opt_manager: boolean; // 否有操作管理员的权限
  list?: StaffItemResp[];
}

// 项目成员列表item
export interface StaffItemResp {
  role: number;
  staff_no: string; // 成员编号;
  staff_name: string; // 成员名称;
  shr_staff_no: string; // 成员SHR编号;
  job_name: string; // 成员岗位;
  job_path: string; // 成员全路径;
  un_finished_task_hours: number; // 未完成任务工时;
  un_closed_bug_count: number; // 未关闭缺陷;
  month_finished_task_hours: number; // 本月已完成任务工时;
  month_fixed_bug_count: number; // 本月已解决BUG;
  month_hours_rate: number; // 本月工时利用率;
  month_saturation_rate: number; // 本月计划工作饱和度;
  update_time: string; // 关联项目时间;
}

// 项目时间轴 接口返回类型
export interface TimelineResp {
  type: number; // 节点类型: 1=项目创建, 2=项目搁置, 3=项目结项，4=迭代发布 5=取消搁置;
  title: string; // 节点标题;
  datetime: string; // 节点时间;
  start_time: string; // 预计开始时间;
  end_time: string; // 预计结束时间;
  real_start_time: string; // 真实开始时间;
  real_end_time: string; // 真实结束时间;
  manager_name: string; // 负责人;
}

// 项目详情 接口响应类型
export interface ProductDetailsResp {
  id?: number; // 项目ID;
  name?: string; // 项目名称;
  code?: string; // 项目编号;
  logo?: string; // 项目logo;
  state?: number; // 项目状态 1: 未开始 2: 进行中 3: 搁置 4：结项;
  remark?: string; // 项目备注;
  notify_url?: string; // 通知地址;
  is_approval?: number; // 是否开启需求审批 0.不需要 1.需要;
  is_report?: number; // 是否需要邮件汇报 0.不需要 1.需要;
  is_robot?: number; // 是否开启机器人通知 0.不需要 1.需要;
  staff_no?: string; // 项目创建人编号;
  staff_name?: string; // 项目创建人名称;
  manager_staff_no?: string; // 项目负责人编号;
  manager_staff_name?: string; // 项目负责人名称;
  yapi_product_id?: number; // yapi项目ID;
  yapi_default_iteration_id?: number; // yapi项目接口文档ID;
  create_time?: string; // 项目创建时间;
}
// 项目进度 接口响应类型
export interface IndicatorsResp {
  un_finished_task_hours?: number; // 未完成任务工时;
  un_finished_demand_count?: number; // 未完成需求数量;
  doing_iteration_count?: number; // 进行中迭代数量;
  un_closed_bug_count?: number; // 未关闭缺陷数量;
}

// 计划下拉选择列表 接口响应类型
export interface PlanSelectResp {
  id?: number;
  name?: string;
}
// 计划关联的需求和需求文档 接口响应类型
export interface AssociatedDemandDocResp {
  demand_list: AssociatedDemandItemResp[];
  doc_list: AssociatedDocItemResp[];
  selected_demand_ids: number[]; // 已选择的需求id集合
  selected_doc_ids: number[]; // 已选择的文档ID集合
}

export interface AssociatedBaseItemResp {
  id: number; // 需求ID
  iteration_id: number; // 当前关联的迭代ID
  iteration_name: string; // 当前关联的迭代名称
}
// 计划关联的需求和需求文档 接口响应类型
export interface AssociatedDemandItemResp extends AssociatedBaseItemResp {
  name?: string; // 需求名称
}
export interface AssociatedDocItemResp extends AssociatedBaseItemResp {
  title?: string; // 需求名称
}

export interface AssociatedReq {
  demand_ids: number[];
  doc_ids: number[];
  iteration_id: number;
  plan_id: number;
}

export default function useHome() {
  // 项目成员列表
  const useGetList = async (product_id: number): Promise<StaffResp | null> => {
    const [err, data]: [unknown, StaffResp | null] = await awaitFunc<number, StaffResp>({
      asyncFunc: getStaffList,
      args: product_id
    });
    if (err || !data) return null;
    return data;
  };
  // 项目添加成员
  const useAddMember = async (params: { product_id: number; staff_nos: string[] }): Promise<boolean | null> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<
      { product_id: number; staff_nos: string[] },
      ResponseParams.ResponseDataSuccess
    >({
      asyncFunc: addMember,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  // 项目删除成员
  const useRemoveMember = async (params: { product_id: number; staff_nos: string[] }): Promise<boolean | null> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<
      { product_id: number; staff_nos: string[] },
      ResponseParams.ResponseDataSuccess
    >({
      asyncFunc: deleteMember,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };
  // 设置项目负责人
  const useSetProjectManager = async (params: { product_id: number; staff_no: string }): Promise<boolean | null> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<
      { product_id: number; staff_no: string },
      ResponseParams.ResponseDataSuccess
    >({
      asyncFunc: setManage,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  // 项目成员列表
  const useGetTimeline = async (product_id: number): Promise<TimelineResp[] | null> => {
    const [err, data]: [unknown, TimelineResp[] | null] = await awaitFunc<number, TimelineResp[]>({
      asyncFunc: getTimeLine,
      args: product_id
    });
    if (err || !data) return null;
    return data;
  };

  // 项目详情
  const useGetProductDetails = async (product_id: number): Promise<ProductDetailsResp | null> => {
    const [err, data]: [unknown, ProductDetailsResp | null] = await awaitFunc<number, ProductDetailsResp>({
      asyncFunc: getProductDetails,
      args: product_id
    });
    if (err || !data) return null;
    return data;
  };

  // 项目进度
  const useGetIndicators = async (product_id: number): Promise<IndicatorsResp | null> => {
    const [err, data]: [unknown, IndicatorsResp | null] = await awaitFunc<number, IndicatorsResp>({
      asyncFunc: getIndicatorsInfo,
      args: product_id
    });
    if (err || !data) return null;
    return data;
  };

  // 项目结项/搁置
  const useHandleProjectStatus = async (params: { product_id: number; state: number }): Promise<boolean> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<
      { product_id: number; state: number },
      ResponseParams.ResponseDataSuccess
    >({
      asyncFunc: handleProjectStatus,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  // 获取计划下拉列表
  const useGetPlanList = async (params: { product_id: number }): Promise<PlanSelectResp[] | null> => {
    const [err, data]: [unknown, PlanSelectResp[] | null] = await awaitFunc<{ product_id: number }, PlanSelectResp[]>({
      asyncFunc: getPlanSelect,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 计划关联的需求和需求文档
  const useGetAssociatedDemandDoc = async (params: { plan_id: number; iteration_id: number }): Promise<AssociatedDemandDocResp | null> => {
    const [err, data]: [unknown, AssociatedDemandDocResp | null] = await awaitFunc<{ plan_id: number; iteration_id: number }, AssociatedDemandDocResp>({
      asyncFunc: getAssociatedDemandDoc,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 项目结项/搁置
  const useUpdateAssociate = async (params: AssociatedReq): Promise<boolean> => {
    const [err]: [unknown, ResponseParams.ResponseDataSuccess | null] = await awaitFunc<AssociatedReq, ResponseParams.ResponseDataSuccess>({
      asyncFunc: updateIterPlan,
      args: params,
      needCode: true
    });
    // 如果需要code 200
    if (typeof err === "number") {
      return err === 200;
    } else if (err) return false;
    return true;
  };

  return {
    useUpdateAssociate,
    useGetAssociatedDemandDoc,
    useGetPlanList,
    useHandleProjectStatus,
    useGetIndicators,
    useGetProductDetails,
    useGetTimeline,
    useSetProjectManager,
    useGetList,
    useAddMember,
    useRemoveMember
  };
}
