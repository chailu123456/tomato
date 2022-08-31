import { reactive, ref } from "vue";
import { Pagation } from "@/composables/usePagation";
import useRenderTable from "@/composables/useRenderTable";
import useRequest from "@/composables/useRequest";
import dayjs from "dayjs";

// 组装需要的列表-名字,日期作为属性的接口类型
interface EmployeeCalendarConfig {
  name: string;
  [propName: string]: any; // 动态日期
}
interface EmployeeConfig {
  week: string; // 周几 有迭代--蓝色;白色--周一至周五,同时没有迭代;绿色--周六至周日,且没有迭代
  list: []; // 员工迭代信息
}
export default function useGetTableData(useFetchSearch: (...args: any) => Promise<any>, params: Record<string, any>): any {
  // 最终分页以及获取数据
  const tableData: { total: number; list: EmployeeCalendarConfig[]; employeeCalendarList: EmployeeCalendarConfig[] } = reactive({
    total: 0,
    list: [],
    employeeCalendarList: []
  });
  // 传进来的搜索条件
  const searchParms = ref(params);
  const stopAutoGetData = ref<boolean>(false);
  // 此函数每次点击分页也会调用到
  const getData = async (pagationParams?: Pagation, flag?: boolean) => {
    tableData.employeeCalendarList.length = 0;
    stopAutoGetData.value = flag == undefined ? false : true;
    const { response } = useRequest(useFetchSearch, searchParms.value);
    const { pagation } = useRenderTable(response);
    const {
      data: { list, count }
    } = await pagation(pagationParams);
    if (list && list.length) {
      list.forEach((v: unknown & { user_calendar: []; name: string }) => {
        const obj: EmployeeCalendarConfig = { name: v.name };
        v.user_calendar.forEach((item: { date: string; list: [] }) => {
          const employee: EmployeeConfig = { week: dayjs(item.date).day().toString(), list: item.list };
          obj["day-" + dayjs(item.date).format("MM-DD")] = employee; // 日期动态属性
        });
        tableData.employeeCalendarList.push(obj);
      });
    }
    tableData.total = count;
  };
  return {
    getData,
    tableData,
    stopAutoGetData
  };
}
