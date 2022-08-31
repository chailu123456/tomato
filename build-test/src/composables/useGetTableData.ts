/*
 * @Author: 宋绍华
 * @Date: 2022-06-16 10:05:13
 * @LastEditTime: 2022-06-21 11:30:49
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\composables\useGetTableData.ts
 */
import { PLAN_STATUS } from "@/utils";
import { reactive, ref } from "vue";
import { Pagation } from "./usePagation";
import useRenderTable from "./useRenderTable";
import useRequest from "./useRequest";
const getCnStatus = (list: Record<string, any>) => {
  PLAN_STATUS.forEach((v: { label: string; value: number }) => {
    if (v.value === list.status && v.value !== -1) {
      list.statusName = v.label;
    }
  });
};
export default function useGetTableData(useFetchSearch: (...args: any) => Promise<any>, params: Record<string, any>): any {
  // 最终分页以及获取数据
  const tableData: any = reactive({
    total: 0,
    list: [],
    allData: {
      avg_task_hours: 0,
      defect_density: 0,
      delay_num: 0,
      doing_num: 0,
      count: 0,
      iteration_precision_rate: 0,
      released_num: 0,
      total_task_hours: 0
    }
  });
  const currentPage = ref(1);
  // 传进来的搜索条件
  const searchParms = ref(params);
  const stopAutoGetData = ref<boolean>(false);
  // 此函数每次点击分页也会调用到
  const getData = async (pagationParams?: Pagation, flag?: boolean, param?: any) => {
    if (param?.page_size !== 5) {
      if (pagationParams?.pageSize) {
        params.page_size = pagationParams.pageSize;
      }
    }
    stopAutoGetData.value = !!flag;
    currentPage.value = (pagationParams && pagationParams.pageIndex) || 1;
    const { response } = useRequest(useFetchSearch, param || searchParms.value);

    const { pagation } = useRenderTable(response);
    const {
      data: { list, count, avg_task_hours, defect_density, delay_num, doing_num, iteration_precision_rate, released_num, total_task_hours }
    } = await pagation(pagationParams);

    tableData.allData.count = count;
    tableData.allData.avg_task_hours = avg_task_hours;
    tableData.allData.defect_density = defect_density;
    tableData.allData.delay_num = delay_num;
    tableData.allData.doing_num = doing_num;
    tableData.allData.iteration_precision_rate = iteration_precision_rate;
    tableData.allData.released_num = released_num;
    tableData.allData.total_task_hours = total_task_hours;
    if (list) {
      tableData.total = count;
      list.forEach((v: unknown & { status: number; name: string }) => {
        getCnStatus(v);
      });
      tableData.list = list;
    } else {
      tableData.total = 0;
      tableData.list = [];
    }
  };
  return {
    getData,
    tableData,
    stopAutoGetData,
    currentPage
  };
}
