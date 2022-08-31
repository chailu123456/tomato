import { STATUS } from "@/utils";
import { reactive, ref } from "vue";
import { Pagation } from "./usePagation";
import useRenderTable from "./useRenderTable";
import useRequest from "./useRequest";
const getCnStatus = (list: Record<string, any>) => {
  STATUS.forEach((v: { label: string; value: number }) => {
    if (v.value === list.status) {
      list.statusName = v.label;
    }
  });
};
export default function useGetTableData(useFetchSearch: (...args: any) => Promise<any>, params: Record<string, any>): any {
  // 最终分页以及获取数据
  const tableData = reactive({
    total: 0,
    list: []
  });
  // 传进来的搜索条件
  const searchParms = ref(params);
  const stopAutoGetData = ref<boolean>(false);
  // 此函数每次点击分页也会调用到
  const getData = async (pagationParams?: Pagation, flag?: boolean) => {
    stopAutoGetData.value = flag == undefined ? false : true;
    const { response } = useRequest(useFetchSearch, searchParms.value);
    const { pagation } = useRenderTable(response);
    const {
      data: { list, count }
    } = await pagation(pagationParams);
    list.forEach((v: unknown & { status: number; name: string }) => {
      getCnStatus(v);
    });
    tableData.total = count;
    tableData.list = list;
  };
  return {
    getData,
    tableData,
    stopAutoGetData
  };
}
