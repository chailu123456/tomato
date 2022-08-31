import { getWeekReportByWeekApi, getWeekReportListApi, saveWeekReportApi } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
import { awaitFunc } from "@/utils";

/*
 * @Author: 宋绍华
 * @Date: 2022-02-21 12:01:52
 * @LastEditTime: 2022-02-21 18:21:50
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\composables\useIteration.ts
 */
export interface SaveWeekReportInter {
  iteration_id: number;
  plan: string;
  summary: string;
  week: number;
}
export interface WeekReportItemInter {
  end_date: string;
  is_fill: boolean;
  iteration_id: number;
  plan: string;
  start_date: string;
  summary: string;
  week: number;
}

export interface WeekReportItemEditInter extends WeekReportItemInter {
  next_week_plan: string;
  next_week: number;
  next_week_start_date: string;
  next_week_end_date: string;
}
export default function useIteration() {
  // 周报保存
  const useSaveWeekReports = async (params: SaveWeekReportInter): Promise<boolean> => {
    const [err]: [unknown, ResponseParams.ResponsePermissionSuccess | null] = await awaitFunc<SaveWeekReportInter, ResponseParams.ResponsePermissionSuccess>({
      asyncFunc: saveWeekReportApi,
      args: params
    });
    if (err) return false;
    return true;
  };
  // 获取需求审批单列表
  const getWeekReportsList = async (iteration_id: number): Promise<WeekReportItemInter[] | null> => {
    const [err, data]: [unknown, any | null] = await awaitFunc<number, WeekReportItemInter[]>({
      asyncFunc: getWeekReportListApi,
      args: iteration_id
    });
    if (err || !data || (Array.isArray(data) && !data.length)) return null;
    return data;
  };
  // 获取需求审批单列表
  const getWeekReportsByWeek = async (iteration_id: number, week: number): Promise<WeekReportItemEditInter | null> => {
    const [err, data]: [unknown, any | null] = await awaitFunc<Record<string, number>, WeekReportItemEditInter>({
      asyncFunc: getWeekReportByWeekApi,
      args: { iteration_id, week }
    });
    if (err || !data) return null;
    return data;
  };

  return {
    useSaveWeekReports,
    getWeekReportsList,
    getWeekReportsByWeek
  };
}
