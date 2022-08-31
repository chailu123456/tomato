/*
 * @Author: 宋绍华
 * @Date: 2022-04-28 20:40:54
 * @LastEditTime: 2022-06-21 11:08:33
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\lookBoard\project\pmo\hooks\useFetchSearch.ts
 */
import { getIterationList } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";

export default async function useFetchSearch(pageIndex = 1, pageSize = 20, params: Record<"status", number>): Promise<ResponseParams.Iteration> {
  const iterationList = await getIterationList<ResponseParams.Iteration>({ pageIndex, pageSize, ...params });
  return iterationList;
}
