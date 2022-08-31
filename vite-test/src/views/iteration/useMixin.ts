import { reactive, ref, watch } from "vue";
import router from "@/router";
import useFetchSearch from "./homePage/hooks/useFetchSearch";

type SearchParams = {
  // status: number;
  demand: null | number | string;
};
const searchParams: SearchParams = reactive({
  // 默认状态
  // status: -1,
  demand: null
});
const dialogRef = ref<HTMLElement & { handleChangeDialogStatus: (...args: Array<any>) => void }>();
const demandList = ref<Array<Record<string, any>>>([]);
const result = ref({});
const productPlanResult = ref([]);
let changeProductDiasbleStatus: (...args: Array<any>) => void;
const rawData = ref({});
// (internalInstance?.appContext as any).reload();
export default function useMixin(flag?: boolean): Record<string, any> {
  const isGetDetail = ref<boolean>(flag || false);
  // header栏搜索切换，同步更新地址栏id
  const handleConditionSearch = () => {
    router.replace({
      query: Object.assign(
        { ...router.currentRoute.value.query },
        {
          id: searchParams.demand
        }
      )
    });
    // 切换到迭代一览页面
    if (router.currentRoute.value.path === "/iteration/homepage") {
      isGetDetail.value = true;
      console.log(searchParams.demand);
      getIterationDetail(Number(searchParams.demand!));
    }
    // 更新当前页面
  };

  // 编辑迭代，新增迭代
  const handleChangeDialogStatus = (flag: number /**0:新增，1：编辑 */) => {
    if (flag === 0) {
      dialogRef.value!.handleChangeDialogStatus(false);
    } else {
      console.log(rawData, "rawData");
      dialogRef.value!.handleChangeDialogStatus(false, rawData);
    }
  };
  // 迭代工单
  const handleIterative = () => {
    router.push({
      path: "/iteration/applyTest",
      query: {
        id: router.currentRoute.value.query.id
      }
    });
  };
  //#region 迭代主页详情
  const id = router.currentRoute.value.query.id;
  const getIterationDetail = (id: number) => {
    // 不是迭代一览页面直接返回
    if (router.currentRoute.value.path !== "/iteration/homepage" || isGetDetail.value === false) return;
    // 根据id查询当前迭代详情
    const { resultObj, productPlanForm, changeIsEditInput, rawDataResponse } = useFetchSearch(id);
    result.value = resultObj;
    productPlanResult.value = productPlanForm;
    changeProductDiasbleStatus = changeIsEditInput;
    rawData.value = rawDataResponse;
  };
  if (searchParams.demand && !id) {
    router.replace({
      query: Object.assign(
        { ...router.currentRoute.value.query },
        {
          id: Number(searchParams.demand)
        }
      )
    });
    getIterationDetail(Number(searchParams.demand));
  } else if (id) {
    /**地址栏存在id */
    getIterationDetail(Number(id));
    searchParams.demand = Number(id);
  } else {
    // 监听迭代名称列表，创建迭代之后重新获取
    watch(
      () => demandList.value,
      (value: Array<Record<string, any>>) => {
        if (!value.length) return;
        getIterationDetail(Number(value[0].id));
        router.replace({
          query: Object.assign(
            { ...router.currentRoute.value.query },
            {
              id: Number(value[0].id)
            }
          )
        });
        searchParams.demand = Number(value[0].id);
      }
    );
  }
  //#endregion
  return {
    searchParams,
    handleConditionSearch,
    demandList,
    getIterationDetail,
    changeProductDiasbleStatus,
    result,
    handleChangeDialogStatus,
    handleIterative,
    dialogRef,
    productPlanResult
  };
}
