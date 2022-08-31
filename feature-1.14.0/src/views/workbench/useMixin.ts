import { searchParams, productId, demandList, setCache } from "@/views/iteration/useMixin";
import useGetDemandList from "@/views/iteration/useGetDemandList";
import { setSession } from "@/utils";
import router from "@/router";

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
export function updateInterId(item: Record<string, any>, module?: string) {
  // 跨项目,切换项目并且更新迭代下拉数据
  if (item.product_id) {
    productId.value = item.product_id;
    setSession("productId", item.product_id.toString());
    const getDemandList = useGetDemandList();
    getDemandList(item.product_id).then((res) => {
      demandList.value = res;
      if (item.iteration_id === 0) {
        searchParams.demand = demandList.value[0].id || 0;
      } else {
        searchParams.demand = item.iteration_id;
      }
    });
  }
  if (item.type !== 3) {
    searchParams.demand = item.iteration_id;
  }
  if (item.target_id) setCache(item.iteration_id);
  const jumpModule = ["homepage", "exploitation", "test"];
  const routeMap = {
    exploitation: {
      baseName: "exploitation",
      query: { iteration_id: item.iteration_id, name: item.name }
    },
    homepage: {
      baseName: "homepage",
      query: {
        iteration_id: item.iteration_id
      }
    },
    test: {
      baseName: "bugDetail",
      query: {
        bugId: item.target_id,
        iteration_id: item.iteration_id,
        name: item.name,
        jump: "work"
      }
    }
  } as Record<string, any>;
  // console.log(routeMap[jumpModule[item.type - 1]]);
  if (module) {
    const { href } = router.resolve({
      path: "/project/iteration/homepage",
      query: {
        iterationId: item.iteration_id
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
  console.log(item);
  if (item.product_id) {
    productId.value = item.product_id;
    setSession("productId", item.product_id.toString());
    const getDemandList = useGetDemandList();
    getDemandList(item.product_id).then((res) => {
      demandList.value = res;
      if (item.iteration_id === 0) {
        searchParams.demand = demandList.value[0].id || null;
      } else {
        searchParams.demand = item.iteration_id;
      }
    });
  }
  if ([3, 4, 6].includes(item.type)) {
    console.log(33);
  } else {
    searchParams.demand = item.iteration_id;
  }
  if (item.target_id) setCache(item.iteration_id);
  // 1:项目,2:迭代,3:需求,4:计划,5:任务,6:bug
  // 需求里边要判断是需求列表还是需求审批单列表，判断item.event.includes("demand-approval")决定跳转true跳转需求审批单false跳转需求列表
  const jumpModule = ["homepage", "homepage", "demandPool", "planManagement", "exploitation", "test"];
  const routeMap = {
    homepage: {
      baseName: "homepage",
      query: {
        iteration_id: item.iteration_id
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
      query: { name: item.obj_name }
    },
    exploitation: {
      baseName: "exploitation",
      query: { iteration_id: item.iteration_id, name: item.obj_name }
    },
    test: {
      baseName: "bugDetail",
      query: {
        bugId: item.obj_id,
        iteration_id: item.iteration_id,
        name: item.obj_name,
        jump: "work"
      }
    }
  } as Record<string, any>;
  const typeIndex = item.type >= 3 ? jumpModule[item.type - 1] : "homepage";

  router.push({
    name: routeMap[typeIndex].baseName,
    query: routeMap[typeIndex].query
  });
}
