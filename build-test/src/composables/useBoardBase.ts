/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 11:37:39
 * @LastEditTime: 2022-06-17 16:13:11
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\composables\useBoardBase.ts
 */
/**
 * 看板模块接口
 */
export interface StaffWorkQualityParams {
  product_id?: number; // 项目ID
  iteration_id?: number; // 迭代ID
  month?: number; // 月份
  staff_name?: string; // 成员名称
  department_code?: number; // 部门编号
  position_type?: number; // 岗位类型
  page_index?: number; // 分页页码
  page_size?: number; // 分页大小
}
export interface StaffWorkQualityItems {
  task_avg_hours: number; // 平均任务工时
  bug_num: number; // 产生bug数
  bug_serious_num: number; // 严重BUG数
  bug_rate: number; // 缺陷密度
  iteration_num: number; // 参与迭代数
  job_name: string; // 岗位名称
  post_bug_num: number; // 提交bug数
  post_bug_rate: number; // 提交缺陷密度
  shr_staff_no: string; // shr成员编号
  staff_name: string; // 成员姓名
  staff_no: string; // 成员编号
  task_completed_hours: number; // 完成任务工时
  task_completed_num: number; // 计划完成任务
  task_on_time_rate: number | string; // 任务准点率
  task_hour_rate: number; // 工时利用率
  task_planed_hours: number; // 计划完成工时
}

export interface StaffWorkQualityStatistic {
  backend: number; // 后端成员数量
  frontend: number; // 前端成员数量
  others: number; // 其他人员数量
  participant: number; // 参与成员数量
  product: number; // 产品成员数量
  test: number; // 测试成员数量
  total: number; // 成员总数量
}

export interface StaffWorkQuality {
  count: number;
  list: StaffWorkQualityItems[];
  statistic: StaffWorkQualityStatistic;
}
// 迭代
export interface Iterate {
  id: number; // 迭代ID
  name: string; // 名称
  version: string; // 版本
  product_id: number; // 项目ID
  full_name: string; // 带版本号的名字
}

import { getIterateList, getStaffWorkQualityList } from "@/api/request-modules/board";
import { awaitFunc } from "@/utils";

export default function useBoardBase() {
  // 成员工作质量列表
  const useGetStaffWorkQualityList = async (params?: StaffWorkQualityParams): Promise<StaffWorkQuality | null> => {
    const [err, data]: [unknown, StaffWorkQuality | null] = await awaitFunc<StaffWorkQualityParams, StaffWorkQuality>({
      asyncFunc: getStaffWorkQualityList,
      args: params
    });
    if (err || !data) return null;
    return data;
  };
  // 迭代下拉列表
  const useGetIterateList = async (params?: { product_id?: number }): Promise<Iterate[] | null> => {
    const [err, data]: [unknown, Iterate[] | null] = await awaitFunc<{ product_id?: number }, Iterate[]>({
      asyncFunc: getIterateList,
      args: params
    });
    if (err || !data) return null;
    return data;
  };

  // 2021年7月至今
  const disabledDate = (time: Date) => {
    const t = time.getTime();
    return t > Date.now() || t <= new Date("2021-07").getTime();
  };

  return {
    useGetStaffWorkQualityList,
    useGetIterateList,
    disabledDate
  };
}
