import { reactive, Ref, ref, watch, WatchStopHandle } from "vue";
import router from "@/router";
import useFetchSearch from "./homePage/hooks/useFetchSearch";
import { getIterationEmployeeList, getIterationDemand } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import { getSession, setSession } from "@/utils";
type SearchParams = {
  // status: number;
  demand: null | number;
};
// 迭代id
export const searchParams: SearchParams = reactive({
  // 当前迭代id
  demand: null
});
// 产品id保存
export const productId = ref(Number(getSession("productId"))) as Ref<null> | Ref<number>;
// 产品/项目列表
const productLists = ref<Array<Record<string, any>>>([]);
// 当前迭代员工列表
const employeeLists = ref([]);

const newEmployeeLists = ref([]);
// 获取迭代-任务需求下拉选择
const newDemandLists = ref([]);

const dialogRef = ref<HTMLElement & { handleChangeDialogStatus: (...args: Array<any>) => void }>();
// 迭代列表
export const demandList = ref<Array<Record<string, any>>>([]);
// 迭代主页数据
const result = ref({});
// 是否获取完成迭代主页数据
const isOk = ref(false);
// 迭代主页进度条
const progressData = reactive({
  status: null,
  dataTime: [] as Array<Record<string, any>>
});

// 判断是否需要在地址栏增加项目id
export function replaceProductId(): Record<string, any> {
  function checkProductId(lists: Array<Record<string, any>>, id: string) {
    // 设置之前检查当前id是否存在列表中
    const index = lists.findIndex((v) => v.id === Number(id));
    if (index >= 0) {
      productId.value = Number(id);
      setSession("productId", id);
      setSession("productName", lists[index].name);

      setSession("productInfo", typeof lists[index] !== "undefined" ? JSON.stringify(lists[index]) : "");
    } else {
      // 不存在的话，将缓存的productId设置为当前的
      productId.value = Number(getSession("productId", true));
      router.replace({
        query: Object.assign(
          { ...router.currentRoute.value.query },
          {
            productId: productId.value
          }
        )
      });
    }
  }

  function setSessionFn(id: string) {
    let unwatch: WatchStopHandle;

    if (!productLists.value.length) {
      unwatch = watch(
        () => productLists.value,
        (newValue) => {
          checkProductId(newValue, id);
          unwatch();
        }
      );
    } else {
      checkProductId(productLists.value, id);
    }
  }
  // 地址栏没有productId就设置默认的第一个
  const routerProductId = router.currentRoute.value.query.productId;
  if (!routerProductId) {
    // 地址栏不存在，尝试从缓存获取productId
    const storgeProductId = getSession("productId", true);
    if (!storgeProductId) {
      //  缓存，地址栏都没有,使用默认的第一个
      if (productLists.value.length) {
        // document表示在文档模块不需要添加项目id到地址栏
        if (!router.currentRoute.value.path.includes("document")) {
          router.replace({
            query: Object.assign(
              { ...router.currentRoute.value.query },
              {
                productId: productLists.value[0].id
              }
            )
          });
        }
        setSessionFn(productLists.value[0].id);
      } else {
        watch(
          () => productLists.value,
          (newValue) => {
            setSessionFn(newValue[0].id);
          }
        );
      }
    } else {
      // 地址栏没有，缓存存在 document表示在文档模块不需要添加项目id到地址栏
      if (!router.currentRoute.value.path.includes("document")) {
        router.replace({
          query: Object.assign(
            { ...router.currentRoute.value.query },
            {
              productId: storgeProductId
            }
          )
        });
      }
    }
  } else {
    // 地址栏有，将地址栏设置为缓存的项目id
    setSessionFn(routerProductId as string);
  }
  return {
    productLists,
    productId
  };
}

export const setCache = (val: number): void => {
  // 设置缓存
  const _cache = getSession("cacheProject", true) as Array<any>;
  _cache.forEach((v, index) => {
    if (v.projectId === productId.value) {
      _cache[index].iterationId = val;
    }
  });
  setSession("cacheProject", JSON.stringify(_cache));
};
// watch迭代id变化，重新获取迭代
export const createWatch = (getIterationDetail: (id: number) => void): void => {
  watch(
    () => searchParams.demand,
    (newValue, oldValue) => {
      if (newValue === 0) {
        searchParams.demand = oldValue;
        return;
      }
      if (newValue === null) {
        result.value = {};
      } else {
        // 迭代id变化，设置一遍缓存
        setCache(newValue);
        getIterationDetail(newValue as number);
      }
    }
  );
};
let timer: ReturnType<typeof setTimeout>;
export default function useMixin(flag?: boolean): Record<string, any> {
  const isGetDetail = ref<boolean>(flag || false);
  // header栏搜索切换，同步更新地址栏id
  const handleConditionSearch = (val: number) => {
    searchParams.demand = val;
    setCache(val);
    // 切换到迭代一览页面
    if (router.currentRoute.value.name === "homepage") {
      isGetDetail.value = true;
      getIterationDetail(Number(searchParams.demand!));
    }
  };
  // 编辑迭代，新增迭代
  const handleChangeDialogStatus = (flag: number /**0:新增，1：编辑 */) => {
    if (flag === 0) {
      dialogRef.value!.handleChangeDialogStatus(false);
    } else {
      dialogRef.value!.handleChangeDialogStatus(false, result.value);
    }
  };
  // 迭代工单
  const handleIterative = () => {
    router.push({
      name: "applyTest",
      query: {
        id: router.currentRoute.value.query.id
      }
    });
  };
  //#region 迭代主页详情

  const getIterationDetail = (id: number) => {
    // 不是迭代一览页面直接返回
    if (isGetDetail.value === false || !id) return;
    // 根据项目id查询当前迭代详情
    clearTimeout(timer);
    timer = setTimeout(() => {
      useFetchSearch(id)
        .then((response: Record<string, any>) => {
          setIterationDetail(response);
        })
        .catch((err) => {
          console.log(err);
        });
    }, 100);
  };
  const setIterationDetail = (response: Record<string, any>) => {
    response.user_list.forEach((v: Record<string, any>) => {
      // 这里uniqueId是给筛选员工用
      v.uniqueId = v.staff_no;
    });
    /* eslint-disable */
    const defaultAvatar = require("@/assets/images.jpg");
    response.frontend_manager.avatar = response.frontend_manager.avatar || defaultAvatar;
    response.test_manager.avatar = response.test_manager.avatar || defaultAvatar;
    response.backend_manager.avatar = response.backend_manager.avatar || defaultAvatar;
    response.iteration_manager.avatar = response.iteration_manager.avatar || defaultAvatar;
    result.value = response;
    isOk.value = true;
    progressData.status = response.stage;
    progressData.dataTime = [
      {
        time: response.plan.create_time,
        realTime: response.plan.create_time
      },
      {
        time: response.dev_time,
        realTime: response.real_dev_time
      },
      {
        time: response.union_time,
        realTime: response.real_union_time
      },
      {
        time: response.test_time,
        realTime: response.real_test_time
      },
      {
        time: response.release_time,
        realTime: response.real_release_time
      }
    ];
  };
  //#region 获取当前项目员工列表
  const handleGetIterationList = () => {
    const isIterationPage = ["exploitation", "test", "edit", "bugDetail", "exploitationAdd"];
    const currentPath = router.currentRoute.value.name!;
    isIterationPage.forEach((v) => {
      // 任务模块获取当前迭代下的成员
      if (currentPath === v) {
        if (currentPath === "exploitation" || currentPath === "exploitationAdd") {
          getIterationEmployeeList<ResponseParams.ResponseDataSuccess>(String(productId.value), String(searchParams.demand)).then((res: any) => {
            employeeLists.value = res.data;
            newEmployeeLists.value = res.data[1]?.options || [];
          });
          getIterationDemand<ResponseParams.ResponseDataSuccess>(String(productId.value), String(searchParams.demand)).then((res: any) => {
            newDemandLists.value = res.data;
          });
        } else {
          // 获取当前项目下迭代成员
          getIterationEmployeeList<ResponseParams.ResponseDataSuccess>(String(productId.value)).then((res: any) => {
            employeeLists.value = res.data;
            newEmployeeLists.value = res.data[1]?.options || [];
          });
        }
      }
    });
  };
  //#endregion

  return {
    progressData,
    isOk,
    newDemandLists,
    employeeLists,
    newEmployeeLists,
    handleGetIterationList,
    searchParams,
    handleConditionSearch,
    demandList,
    getIterationDetail,
    setIterationDetail,
    // changeProductDiasbleStatus,
    result,
    handleChangeDialogStatus,
    handleIterative,
    dialogRef
    // productPlanResult
  };
}
