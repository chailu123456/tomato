/*
 * @Author: 宋绍华
 * @Date: 2022-04-28 20:40:54
 * @LastEditTime: 2022-06-16 15:59:33
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\lookBoard\personal\peopleOverview\hooks\useGetEmployeeCalendarList.ts
 */
import { reactive, ref } from "vue";
import { Pagation } from "@/composables/usePagation";
import useRenderTable from "@/composables/useRenderTable";
import useRequest from "@/composables/useRequest";

// 组装需要的列表-名字,日期作为属性的接口类型
// interface EmployeeCalendarConfig {
//   name: string;
//   [propName: string]: any; // 动态日期
// }
// interface EmployeeConfig {
//   week: string; // 周几 有迭代--蓝色;白色--周一至周五,同时没有迭代;绿色--周六至周日,且没有迭代
//   list: []; // 员工迭代信息
// }

export default function useGetTableData(useFetchSearch: (...args: any) => Promise<any>, params: Record<string, any>): any {
  // 最终分页以及获取数据
  const tableData: {
    total: number;
    page: number;
    pageSize: number;
    list: any[];
    displayTheader: any[];
    displayTbody: any[];
    employeeCalendarList: any[];
  } = reactive({
    total: 0,
    page: 1,
    pageSize: 20,
    list: [],
    displayTheader: [],
    displayTbody: [],
    employeeCalendarList: []
  });
  // 传进来的搜索条件
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const searchParms = ref(params);
  const stopAutoGetData = ref<boolean>(false);
  // 此函数每次点击分页也会调用到
  const getData = async (pagationParams?: Pagation, flag?: boolean, sparams?: any) => {
    tableData.displayTbody = [];
    tableData.employeeCalendarList = [];
    tableData.page = (pagationParams && pagationParams.pageIndex) || 1;
    tableData.pageSize = (pagationParams && pagationParams.pageSize) || 20;
    stopAutoGetData.value = flag == undefined ? false : true;
    const { response } = useRequest(useFetchSearch, sparams);
    const { pagation } = useRenderTable(response);
    const {
      data: { list, count }
    } = await pagation(pagationParams);
    if (list && list.length) {
      tableData.displayTheader = list.slice(0, 1);
      if (list.slice(0, 1).length === 1) {
        tableData.displayTheader = list.slice(0, 1)[0].slice(1);
      }
      const tabledata = list.slice(1);
      if (tabledata.length > 0) {
        tabledata.forEach((item: any) => {
          tableData.displayTbody.push(item.slice(1)); // 第一列数据不显示出来
        });
        tableData.employeeCalendarList = tabledata;
      }
    }
    tableData.total = count;
  };
  return {
    getData,
    tableData,
    stopAutoGetData
  };
}
