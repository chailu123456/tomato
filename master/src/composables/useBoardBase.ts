/*
 * @Author: 宋绍华
 * @Date: 2022-04-21 11:37:39
 * @LastEditTime: 2022-08-16 09:25:02
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

// 团队
export interface TeamItem {
  group: number; // 分组
  id: number; // id
  name: string; // 名称
}
// 多项目成员
export interface MultipleStaffItem {
  staff_name: string; // 员工名称
  staff_no: string; // 员工编号
}
export interface MultipleDemandItem {
  id: number; // 需求id
  name: string; // 需求名称
}

export interface TeamProductItem extends TeamItem {
  isLast?: boolean;
  list: TeamItem[];
}
interface BoardBaseRt {
  teamList: TeamItem[];
  teamProductList: TeamProductItem[];
  currentProIds: number[]; // 当前项目ids
  currentGroupIds: number[]; // 当前原始ids数据
}

import { getIterateList, getStaffWorkQualityList, getTeamList, getTeamProductList } from "@/api/request-modules/board";
import { getMultipleProductDemandListApi, getMultipleProductListApi } from "@/api/request-modules/product";
import { awaitFunc, getSession } from "@/utils";
import { reactive } from "vue";
const boardBaseRt = reactive<BoardBaseRt>({
  teamList: [],
  teamProductList: [],
  currentProIds: [],
  currentGroupIds: []
});
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

  // 获取团队列表
  const useGetTeamList = async (): Promise<TeamItem[] | null> => {
    const [err, data]: [unknown, TeamItem[] | null] = await awaitFunc<void, TeamItem[]>({
      asyncFunc: getTeamList
    });
    if (err || !data) return null;
    return data;
  };

  // 获取团队项目列表
  const useGetTeamProductList = async (): Promise<TeamProductItem[] | null> => {
    const [err, data]: [unknown, TeamProductItem[] | null] = await awaitFunc<void, TeamProductItem[]>({
      asyncFunc: getTeamProductList
    });
    if (err || !data) return null;
    return data;
  };
  // 获取多项目成员列表
  const useGetMultipleProductStaffList = async (params: { product_id: number[] }): Promise<MultipleStaffItem[] | null> => {
    const [err, data]: [unknown, MultipleStaffItem[] | null] = await awaitFunc<{ product_id: number[] }, MultipleStaffItem[]>({
      asyncFunc: getMultipleProductListApi,
      args: params
    });
    if (err || !data) return null;
    return data;
  };
  // 获取多项目成员列表
  const useGetMultipleProductDemandList = async (params: { product_id: number[] }): Promise<MultipleDemandItem[] | null> => {
    const [err, data]: [unknown, MultipleDemandItem[] | null] = await awaitFunc<{ product_id: number[] }, MultipleDemandItem[]>({
      asyncFunc: getMultipleProductDemandListApi,
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

  // 获取团队的列表
  const onGetTeamList = async () => {
    const data = await useGetTeamList();

    if (data) {
      boardBaseRt.teamList = data;
    }
  };

  // 获取团队的列表
  const onGetTeamProductList = async () => {
    const data = await useGetTeamProductList();

    if (data) {
      // 获取去重后的group 集合
      const groupArr = [...new Set(data.map((item) => item.group))];
      const map = new Map();
      boardBaseRt.teamProductList = [];
      groupArr.forEach((key) => {
        const l = data.filter((item) => item.group === key);
        l[l.length - 1].isLast = true;
        map.set(key, l);
      });
      /* eslint-disable @typescript-eslint/no-unused-vars */
      for (const [k, v] of map) {
        boardBaseRt.teamProductList.push(...v);
      }
      return Promise.resolve(true);
    }
  };

  // 获取项目集的id列表
  const getIds = (ids: number[], list: (TeamProductItem | TeamItem)[]): (TeamItem | TeamProductItem)[] => {
    return list.map((item: TeamProductItem | TeamItem) => {
      if (ids.includes(item.id)) {
        // 去掉已经存在的id
        // remove(ids, (n) => n === item.id);
        // @ts-ignore
        return Array.isArray(item.list) ? item.list?.map((n) => n.id) : item.id;
      } else if ("list" in item && Array.isArray(item.list)) {
        return getIds(ids, item?.list);
      }
      return [];
    });
  };

  // 获取项目id
  const getGroupIds = (ids: number[]) => {
    if (!Array.isArray(ids) || (Array.isArray(ids) && !ids.length)) return [];
    const list = getIds(ids, boardBaseRt.teamProductList).flat(2);

    return list as any;
  };

  // 获取项目list
  const useInitGetProductList = async (hasIds = true) => {
    await onGetTeamProductList();
    if (boardBaseRt.currentProIds.length && hasIds) return;
    // 获取项目id
    const productIds = getSession("selectedProductIds");
    let ids: number[];
    if (productIds) {
      ids = (productIds as string).split(",").map((i) => parseInt(i));
    } else {
      // 默认第一个项目集
      ids = [boardBaseRt.teamProductList[0]?.id];
    }

    boardBaseRt.currentGroupIds = ids;
    boardBaseRt.currentProIds = getGroupIds(ids);
  };

  return {
    useGetMultipleProductDemandList,
    useGetStaffWorkQualityList,
    useGetIterateList,
    disabledDate,
    useGetTeamList,
    useGetTeamProductList,
    onGetTeamProductList,
    getGroupIds,
    onGetTeamList,
    useInitGetProductList,
    useGetMultipleProductStaffList,
    boardBaseRt
  };
}
