import { computed, reactive, ref, watch, WatchStopHandle } from "vue";
import router from "@/router";
import useFetchSearch from "./homePage/hooks/useFetchSearch";
import { getIterateList } from "@/api/request-modules/board";
import { getIterationEmployeeList, getIterationDemand, getBugTaskList, getUseCaseList } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import { getSession, setSession } from "@/utils";
import { store } from "@/store";
import { ProjectItem } from "@/composables/useCommon";
import { MutationType } from "@/store/mutation-types";
import { allMember } from "@/api/request-modules/product";
type SearchParams = {
  demand: null | number;
};
// 迭代id
export const searchParams: SearchParams = reactive({
  // 当前迭代id
  demand: store?.getters?.iterateId || null
});
// 产品id保存
export const productId = computed(() => store.getters.productId);
// 产品/项目列表
const productLists = computed(() => store.getters.productList);
// 迭代id保存
const currentIter = computed(() => store.getters.currentIter);
const iterateId = computed(() => store.getters.iterateId);
const onIteration = computed(() => router.currentRoute.value.meta.onIteration);
// 当前迭代员工列表
const employeeLists = ref([]);

// 当前迭代员工列表 在基础项用到
const employeeBasicLists = ref([]);

const newEmployeeLists = ref([]);
// 获取迭代-任务需求下拉选择
const newDemandLists = ref([]);
const newBasicDemandLists = ref([]);
// 获取任务列表
const taskLists = ref([]);
// 获取测试用例列表
const useCaseList = ref([]);

// 任务迭代列表
const iterateListData = ref([]);
const iterateBasicLists = ref<Array<Record<string, any>>>([]);

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
      store.commit(MutationType.updateProductId, Number(id));
      // 设置项目缓存
      store.commit(MutationType.updateProductInfo, lists[index] as ProjectItem);
    } else {
      // 不存在的话，将缓存的productId设置为当前的
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
    const storgeProductId = (getSession("productInfo", true) as Record<string, any>)?.id;
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
      setSessionFn(storgeProductId + "");
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
  if (!_cache) return;
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
        // store.commit(MutationType.updateCurrentIter, { id: oldValue, name: "", product_id: productId.value });
        return;
      }
      // 监听地址栏是否带有iterationId 这块的目的是在看板模块跳转迭代时url带参数过来
      if (location.href.includes("iterationId")) {
        const url = location.href;
        const a = url.split("iterationId=")[1];
        const id = a.split("&")[0];
        searchParams.demand = Number(id);
        // store.commit(MutationType.updateCurrentIter, { id: Number(id), name: "", product_id: productId.value });
        router.replace({
          query: Object.assign({
            productId: router.currentRoute.value.query.productId
          })
        });
      }
      if (newValue === null) {
        result.value = {};
      } else {
        // 迭代id变化，设置一遍缓存
        setCache(newValue);
        getIterationDetail(newValue);
      }
    }
  );
};
let timer: ReturnType<typeof setTimeout>;
export default function useMixin(flag?: boolean): Record<string, any> {
  // const isGetDetail = ref<boolean>(flag || false);
  // header栏搜索切换，同步更新地址栏id
  const handleConditionSearch = (val: number) => {
    searchParams.demand = val;
    console.log(flag);
    setCache(val);
    // 切换到迭代一览页面
    if (router.currentRoute.value.name === "homepage") {
      // isGetDetail.value = true;
      getIterationDetail(searchParams.demand!);
    }
  };
  // 编辑迭代，新增迭代
  const handleChangeDialogStatus = (flag: number /**0:新增，1：编辑 */, e?: any) => {
    if (e) {
      let target = e.target;
      if (target.nodeName == "SPAN" || target.nodeName == "I") {
        target = e.target.parentNode;
      }
      target.blur();
    }

    if (flag === 0) {
      dialogRef.value!.handleChangeDialogStatus(false);
    } else {
      dialogRef.value!.handleChangeDialogStatus(false, result.value);
    }
  };
  // 迭代工单
  const handleIterative = () => {
    router.push({
      name: "testBill",
      query: {
        productId: productId.value,
        // @ts-ignore
        test_apply_id: result.value?.test_apply_id
      }
    });
  };
  //#region 迭代主页详情

  const getIterationDetail = (id: number) => {
    // 不是迭代一览页面直接返回
    if (!id) return;
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
        time: response.create_time,
        realTime: response.create_time
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
  const handleGetIterationList = (type?: string) => {
    const isIterationPage = ["exploitation", "test", "edit", "projectExploitation", "bugDetail", "exploitationAdd", "staffOverview", "overviewCalendar"];
    const currentPath = router.currentRoute.value.name!;
    for (let i = 0; i < isIterationPage.length; i++) {
      // 任务模块获取当前迭代下的成员
      if (currentPath === "exploitation" || currentPath === "exploitationAdd" || currentPath === "projectExploitation") {
        const obj: any = { product_id: productId.value };

        allMember<ResponseParams.ResponseDataSuccess>(obj).then((res: any) => {
          if (res.code === 200) {
            employeeLists.value = res.data;
            newEmployeeLists.value = res.data[1]?.options || [];
            employeeBasicLists.value = res.data[1]?.options.map((o: Record<string, any>) => {
              return { value: o.staff_no, label: o.staff_name };
            });
          } else {
            employeeLists.value = [];
            newEmployeeLists.value = [];
            employeeBasicLists.value = [];
          }
        });

        getIterationDemand<ResponseParams.ResponseDataSuccess>({
          product_id: productId.value,
          iteration_id: currentPath === "exploitation" ? currentIter.value?.id : 0
        }).then((res: any) => {
          if (res.data && res.data.length) {
            newDemandLists.value = res.data;
            newBasicDemandLists.value = res.data.map((o: Record<string, any>) => {
              return { value: o.id, label: o.name };
            });
          } else {
            newDemandLists.value = [];
            newBasicDemandLists.value = [];
          }
        });
        // getIterateList<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res) => {
        //   if (res.code === 200) {
        //     console.log(999)
        //     iterateListData.value = res.data;
        //   } else {
        //     iterateListData.value = [];
        //   }
        // });
        break;
      } else {
        // 获取当前项目下迭代成员
        getIterationEmployeeList<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res: any) => {
          if (res.code === 200) {
            employeeLists.value = res.data;
            newEmployeeLists.value = res.data[1]?.options || [];
          } else {
            employeeLists.value = [];
            newEmployeeLists.value = [];
          }
        });
      }

      if (isIterationPage[i] === "test") {
        // 需求列表
        getIterationDemand<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res: any) => {
          newDemandLists.value = res.data;
          newBasicDemandLists.value = res.data.map((o: Record<string, any>) => {
            return { value: o.id, label: o.name };
          });
        });
        // 迭代列表
        getIterateList<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res) => {
          if (res.code === 200) {
            iterateListData.value = res.data;
            iterateBasicLists.value = res.data.map((o: Record<string, any>) => {
              return { value: o.id, label: o.name };
            });
          } else {
            iterateListData.value = [];
            iterateBasicLists.value = [];
          }
        });
        // 任务列表
        const obj: any = {
          product_id: productId.value,
          iteration_id: onIteration.value ? iterateId.value : 0
        };
        getBugTaskList<ResponseParams.ResponseDataSuccess>(obj).then((res: any) => {
          taskLists.value = res.data;
        });
        // 用例列表
        getUseCaseList<ResponseParams.ResponseDataSuccess>(obj).then((res: any) => {
          useCaseList.value = res.data;
        });
        break;
      }
      if (currentPath === "staffOverview" || currentPath === "overviewCalendar") {
        getIterateList<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res) => {
          if (res.code === 200) {
            iterateListData.value = res.data;
          } else {
            iterateListData.value = [];
          }
        });
        break;
      }
    }
    // isIterationPage.forEach((v) => {
    //   // 任务模块获取当前迭代下的成员
    //   if (currentPath === v) {
    //     if (currentPath === "exploitation" || currentPath === "exploitationAdd" || currentPath === "projectExploitation") {
    //       const obj: any = { product_id: productId.value };
    //       console.log(currentPath)

    //       allMember<ResponseParams.ResponseDataSuccess>(obj).then((res: any) => {
    //         if (res.code === 200) {
    //           console.log(678)
    //           employeeLists.value = res.data;
    //           newEmployeeLists.value = res.data[1]?.options || [];
    //           employeeBasicLists.value = res.data[1]?.options.map((o: Record<string, any>) => {
    //             return { value: o.staff_no, label: o.staff_name };
    //           });
    //         } else {
    //           employeeLists.value = [];
    //           newEmployeeLists.value = [];
    //           employeeBasicLists.value = [];
    //         }
    //       });

    //       getIterationDemand<ResponseParams.ResponseDataSuccess>({
    //         product_id: productId.value,
    //         iteration_id: currentPath === "exploitation" ? currentIter.value?.id : 0
    //       }).then((res: any) => {
    //         if (res.data && res.data.length) {
    //           newDemandLists.value = res.data;
    //           newBasicDemandLists.value = res.data.map((o: Record<string, any>) => {
    //             return { value: o.id, label: o.name };
    //           });
    //         } else {
    //           newDemandLists.value = [];
    //           newBasicDemandLists.value = [];
    //         }
    //       });
    //       getIterateList<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res) => {
    //         if (res.code === 200) {
    //           iterateListData.value = res.data;
    //         } else {
    //           iterateListData.value = [];
    //         }
    //       });
    //     } else {
    //       // 获取当前项目下迭代成员
    //       getIterationEmployeeList<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res: any) => {
    //         if (res.code === 200) {
    //           employeeLists.value = res.data;
    //           newEmployeeLists.value = res.data[1]?.options || [];
    //         } else {
    //           employeeLists.value = [];
    //           newEmployeeLists.value = [];
    //         }
    //       });
    //     }
    //   }
    //   if (v === "test") {
    //     allMember<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res: any) => {
    //       if (res.code === 200) {
    //         employeeLists.value = res.data;
    //         newEmployeeLists.value = res.data[1]?.options || [];
    //         employeeBasicLists.value = res.data[1]?.options.map((o: Record<string, any>) => {
    //           return { value: o.staff_no, label: o.staff_name };
    //         });
    //       } else {
    //         employeeLists.value = [];
    //         newEmployeeLists.value = [];
    //         employeeBasicLists.value = [];
    //       }
    //     });
    //     // 需求列表
    //     getIterationDemand<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res: any) => {
    //       newDemandLists.value = res.data;
    //       newBasicDemandLists.value = res.data.map((o: Record<string, any>) => {
    //         return { value: o.id, label: o.name };
    //       });
    //     });
    //     // 迭代列表
    //     getIterateList<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res) => {
    //       if (res.code === 200) {
    //         iterateListData.value = res.data;
    //         iterateBasicLists.value = res.data.map((o: Record<string, any>) => {
    //           return { value: o.id, label: o.name };
    //         });
    //       } else {
    //         iterateListData.value = [];
    //       }
    //     });
    //     // 任务列表
    //     const obj: any = { product_id: productId.value, iteration_id: searchParams.demand, filter_type: 1 };
    //     getBugTaskList<ResponseParams.ResponseDataSuccess>(obj).then((res: any) => {
    //       taskLists.value = res.data;
    //     });
    //     // 用例列表
    //     getUseCaseList<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res: any) => {
    //       useCaseList.value = res.data;
    //     });
    //   }
    //   if (currentPath === "staffOverview" || currentPath === "overviewCalendar") {
    //     getIterateList<ResponseParams.ResponseDataSuccess>({ product_id: productId.value }).then((res) => {
    //       if (res.code === 200) {
    //         iterateListData.value = res.data;
    //       } else {
    //         iterateListData.value = [];
    //       }
    //     });
    //   }
    // });
  };
  //#endregion

  return {
    progressData,
    isOk,
    newDemandLists,
    taskLists,
    useCaseList,
    employeeLists,
    newEmployeeLists,
    handleGetIterationList,
    searchParams,
    handleConditionSearch,
    demandList,
    getIterationDetail,
    setIterationDetail,
    result,
    handleChangeDialogStatus,
    handleIterative,
    dialogRef,
    employeeBasicLists,
    newBasicDemandLists,
    iterateListData,
    iterateBasicLists
    // productPlanResult
  };
}
