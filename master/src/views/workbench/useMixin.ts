import { searchParams, demandList, setCache } from "@/views/iteration/useMixin";
import useGetDemandList from "@/views/iteration/useGetDemandList";
import router from "@/router";
import { store } from "@/store";
import { MutationType } from "@/store/mutation-types";
import { ProjectItem } from "@/composables/useCommon";
export interface TableList {
  end_time: string;
  id: number;
  iteration_id: number;
  name: string;
  product_id: number;
  start_time: string;
  status: number;
  target_id: number;
  type: number;
}

export interface Hy {
  end_time: string;
}

export interface TODOLIST {
  borderColor: string;
  titleName: string;
  status: number;
  color: string;
  event: Event | unknown;
  listData: Array<Record<string, any>>;
  hasData: boolean;
  page_index: number;
  page_size: number;
}

export interface WORKLIST {
  end_time: string;
  id: number;
  name: string;
  start_time: string;
  status: number;
  target_id: number;
  type: number;
}

export interface PrDynamics {
  content: string;
  create_time: string;
  event: string;
  id: number;
  is_jump: number;
  iteration_id: number;
  obj_id: number;
  obj_name: string;
  product_id: number;
  type: number;
}
// 工作台--工作项列表跳转
export async function updateInterId(item: Record<string, any>, module?: string) {
  // 跨项目,切换项目并且更新迭代下拉数据
  if (item.product_id) {
    store.commit(MutationType.updateProductId, item.product_id);
    // 设置项目缓存
    const currentItem = store.getters.productList.find((n: ProjectItem) => n.id === item.product_id);
    if (currentItem) {
      store.commit(MutationType.updateProductInfo, currentItem);
    }
    const getDemandList = useGetDemandList();
    // 获取最新迭代列表
    // await store.dispatch("GETITERATELIST", formData.product_id);
    await getDemandList(item.product_id).then((res) => {
      demandList.value = res;
      if (item.iteration_id) {
        searchParams.demand = item.iteration_id;
      } else {
        searchParams.demand = demandList.value[0]?.id || 0;
      }
      store.commit(MutationType.updateIterateId, searchParams.demand);
      store.commit(MutationType.updateIterateList, res);
      store.commit(MutationType.updateCurrentIter);
      return Promise.resolve();
    });
  }
  if (item.type !== 3) {
    searchParams.demand = item.iteration_id;
    store.commit(MutationType.updateIterateId, searchParams.demand);
  }
  if (item.target_id || module) setCache(item.iteration_id);
  const jumpModule = ["homepage", "projectExploitation", "test"];
  const routeMap = {
    projectExploitation: {
      baseName: "projectExploitation",
      query: { iteration_id: item.iteration_id, id: item.target_id, name: item.name, where: "workbench" }
    },
    homepage: {
      baseName: "homepage",
      query: {
        iterateId: item.iteration_id
      }
    },
    test: {
      baseName: "test",
      query: {
        detailId: item.target_id,
        name: item.obj_name,
        where: "workbench"
      }
    }
  } as Record<string, any>;
  if (module) {
    const { href } = router.resolve({
      path: "/project/iteration/homepage",
      query: {
        productId: item.product_id,
        iterateId: item.iteration_id,
        come: "lookBoard"
      }
    });
    window.open(href, "_blank");
  } else {
    router.push({
      name: routeMap[jumpModule[item.type - 1]].baseName,
      query: routeMap[jumpModule[item.type - 1]].query
    });
  }
}

// 工作台--动态模块列表跳转
export function dynamicsInterId(item: Record<string, any>) {
  // 跨项目,切换项目并且更新迭代下拉数据
  if (item.product_id) {
    // 设置项目缓存
    store.commit(MutationType.updateProductId, item.product_id);
    const curProdctInfo = store.getters.productList.find((n: ProjectItem) => n.id === item.product_id);
    if (curProdctInfo) {
      // 设置项目列表缓存
      store.commit(MutationType.updateProductInfo, curProdctInfo);
    }
    // 获取项目下所有迭代
    const getDemandList = useGetDemandList();
    getDemandList(item.product_id).then((res) => {
      demandList.value = res;
      if (item.iteration_id === 0) {
        searchParams.demand = demandList.value[0]?.id || null;
        // 缓存当前迭代
        store.commit(MutationType.updateIterateId, item.iteration_id);
      } else {
        const hasIter = demandList.value && demandList.value.filter((it: any) => it.id === item.iteration_id);
        searchParams.demand = item.iteration_id;
        // 缓存当前迭代
        store.commit(MutationType.updateIterateId, item.iteration_id);
        // 缓存当前迭代信息
        store.commit(MutationType.updateCurrentIter, hasIter[0] || null);
      }
    });
  }
  if ([3, 4, 6].includes(item.type)) {
    console.log(33);
  } else {
    searchParams.demand = item.iteration_id;
    // 缓存当前迭代
    store.commit(MutationType.updateIterateId, item.iteration_id);
  }
  console.log(item);

  if (item.target_id) setCache(item.iteration_id);
  // 1:项目,2:迭代,3:需求,4:计划,5:任务,6:bug
  // 需求里边要判断是需求列表还是需求审批单列表，判断item.event.includes("demand-approval")决定跳转true跳转需求审批单false跳转需求列表
  const jumpModule = ["homepage", "homepage", "demandPool", "planManagement", "projectExploitation", "test"];
  const routeMap = {
    homepage: {
      baseName: "homepage",
      query: {
        // iteration_id: item.iteration_id
      }
    },
    demandPool: {
      baseName: item.event.includes("demand-approval") ? "approval" : "demandPool",
      query: {
        name: item.event.includes("demand-approval") ? "" : item.obj_name,
        productId: item.product_id,
        auto: 1,
        ids: item.obj_id,
        fromNotices: true
      }
    },
    planManagement: {
      baseName: "planManagement",
      query: { name: item.obj_name, productId: item.product_id, where: "workbench" }
    },
    projectExploitation: {
      baseName: "projectExploitation",
      query: { iteration_id: item.iteration_id, detailId: item.obj_id, where: "workbench", form: "workbench" }
    },
    test: {
      baseName: "test",
      query: {
        detailId: item.obj_id,
        where: "workbench"
      }
    }
  } as Record<string, any>;
  const typeIndex = item.type >= 3 ? jumpModule[item.type - 1] : "homepage";
  router.push({
    name: routeMap[typeIndex].baseName,
    query: routeMap[typeIndex].query
  });
}
