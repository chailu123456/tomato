import { onUnmounted, reactive, ref, watch } from "vue";
import { setPlanDetail } from "./useShowPlanDetail";
import { updatePlanStatus } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
import useFetchRequest from "./useFetchRequest";
import { RequestParams } from "@/types/request";
import router from "@/router";
import { replaceProductId } from "@/views/iteration/useMixin";
import { getPlanListsTurnPage } from "@/api/request-modules/plan";
import { selectManagerList } from "@/api/request-modules/product";
import { getSession } from "@/utils/sesssion";
import { ElMessage } from "element-plus";
interface Draggable {
  startColumnIndex: number;
  startBlockIndex: number;
}
interface StepList {
  titleColor: string;
  titleName: string;
  status: number;
  listData: Array<Record<string, any>>;
  isDisable: boolean;
  isShowLoadingMore: boolean;
  hasData: boolean;
  page_index: number;
  page_size: number;
}
/**
 *
 */
const stepList = reactive<Array<StepList>>([
  // {
  //   titleColor: "rgba(255, 244, 227, 1)",
  //   titleName: "待设计",
  //   status: 0,
  //   listData: [
  //     { isActive: false }
  //     // {
  //     //   name: "阿闻到家v1.4.9",
  //     //   bgc: "rgba(240, 248, 240, 1)"
  //     // }
  //   ],
  //   isDisable: false
  // },
  {
    titleColor: "rgba(250, 252, 239, 1)",
    titleName: "设计中",
    status: 1,
    listData: [],
    // listData: Array(10).fill({ name: "阿闻到家v1.4.9", bgc: "rgba(230, 252, 247, 1)" }),
    isDisable: false,
    isShowLoadingMore: false,
    hasData: true,
    page_index: 1,
    page_size: 10
  },
  {
    titleColor: "rgba(250, 252, 239, 1)",
    titleName: "待评审",
    status: 2,
    listData: [],
    isDisable: false,
    isShowLoadingMore: false,
    hasData: true,
    page_index: 1,
    page_size: 10
  },
  {
    titleColor: "rgba(250, 252, 239, 1)",
    titleName: "已评审",
    status: 8,
    listData: [],
    isDisable: false,
    isShowLoadingMore: false,
    hasData: true,
    page_index: 1,
    page_size: 10
  },
  {
    titleColor: "rgba(225, 239, 251, 1)",
    titleName: "待开发",
    status: 3,
    listData: [],
    isDisable: true,
    isShowLoadingMore: false,
    hasData: true,
    page_index: 1,
    page_size: 10
  },
  {
    titleColor: "rgba(225, 239, 251, 1)",
    titleName: "开发中",
    status: 4,
    listData: [],
    isDisable: true,
    isShowLoadingMore: false,
    hasData: true,
    page_index: 1,
    page_size: 10
  },
  {
    titleColor: "rgba(225, 239, 251, 1)",
    titleName: "测试中",
    status: 5,
    listData: [],
    isDisable: true,
    isShowLoadingMore: false,
    hasData: true,
    page_index: 1,
    page_size: 10
  },
  {
    titleColor: "rgba(225, 239, 251, 1)",
    titleName: "待发布",
    status: 6,
    listData: [],
    isDisable: true,
    isShowLoadingMore: false,
    hasData: true,
    page_index: 1,
    page_size: 10
  }
  // {
  //   titleColor: "rgba(225, 239, 251, 1)",
  //   titleName: "已发版",
  //   status: 7,
  //   listData: [{ isActive: false }],
  //   isDisable: true
  // }
]);

/**
 *
 * @param e event对象
 * @returns boolean
 */
function hasClassName(e: DragEvent & { target: HTMLElement }, className: string): boolean {
  return e.target.className.includes(className) ? true : false;
}
/**
 *
 * @param e event对象
 * @param property  css的属性key
 * @param style 实际设置的样式
 */
function setDragStyle(e: DragEvent & { target: HTMLElement }, property: string, style: string) {
  (e.target.style as any)[property] = style;
}
/**
 *
 * @param e event对象
 * @param property  css的属性key
 * @param style 实际重置的样式
 */
function resetDragStyle(e: DragEvent & { target: HTMLElement }, property: string, style: string) {
  (e.target.style as any)[property] = style;
}

export enum DragStyle {
  // 拖拽到正方形添加下划线样式
  setDragRectStyle = "2px solid rgba(0,0,0,.4)",
  // 添加整个容器边框的下划线
  setWrapperBorderStyle = "1px solid rgba(0,0,0,.4)",
  unset = "unset",
  activeColor = "rgba(230, 252, 247, 1)",
  disableColor = "rgba(225, 239, 251, 1)"
}
// 设置背景色
const setBackgroundColor = (status: number) => {
  if (status === 1 || status === 2 || status === 8) {
    return DragStyle.activeColor;
  } else {
    return DragStyle.disableColor;
  }
};
// 数据分类到对应的位置
export const sortData = (lists: Array<{ plan: { status: number } }>): void => {
  stepList.forEach((v) => {
    v.listData = [];
    lists?.forEach((list) => {
      if (v.status === list.plan.status) {
        (v.listData as Array<unknown>).push({
          ...list.plan,
          ...list,
          rowData: list,
          bgc: setBackgroundColor(list.plan.status)
        });
      }
    });
    v.isShowLoadingMore = false;
    v.hasData = true;
    v.page_index = 1;
    v.page_size = 10;
  });
};
// 获取计划列表
const { getPlanList } = useFetchRequest();
// 计划列表参数
const planParams = reactive<RequestParams.GetPlan>({
  name: "",
  create_by: [],
  product_id: []
});
const useDraggable = (tipMessage: (...args: Array<unknown>) => void): any => {
  const rawLists = ref<Array<unknown & { status: number }>>();
  const draggable: Draggable = {
    startColumnIndex: 0,
    startBlockIndex: 0
  };
  // const clickIndex = reactive({
  //   columnIndex: 0,
  //   index: 0
  // });

  const createPerson = ref();
  const handleManagerList = () =>
    selectManagerList<ResponseParams.ResponseDataSuccess>({ product_id: Number(getSession("productId")) }).then((res) => {
      createPerson.value = res.data;
    });
  //#region  获取计划列表
  const { productId } = replaceProductId();
  let timer: ReturnType<typeof setTimeout>;
  const planList = async () => {
    // 如果地址栏有参数直接获取
    const id = productId.value ?? router.currentRoute.value.query.productId;
    planParams.product_id = [Number(id)];
    // 如果地址栏没有，等待项目列表获取完成再去调用
    if (id) {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const { data } = await getPlanList(planParams);
        rawLists.value = data;
        handleManagerList();
        sortData(data);
      }, 300);
    }
  };
  planList();
  // 监听切换项目名称
  watch(
    () => productId.value,
    (newValue) => {
      if (newValue) {
        planList();
      }
    },
    {
      immediate: true
    }
  );
  //#endregion
  // 拖放元素开始事件
  const handleDragstart = (columnIndex: number, blockIndex: number) => {
    draggable.startColumnIndex = columnIndex;
    draggable.startBlockIndex = blockIndex;
  };
  // 查看需求
  const isShowDetail = ref(false);
  const handleShowDemandDetailDialog = (item: Record<string, any>) => {
    setPlanDetail(item);
    isShowDetail.value = true;
  };

  // const throttle = (fn: any, rateTime: number) => {
  //   let timer: any = null;
  //   return (...args: any[]) => {
  //     if (!timer) {
  //       timer = setTimeout(() => {
  //         fn.apply(this, args);
  //         timer = null;
  //       }, rateTime);
  //     }
  //   };
  // };

  let a = 1;
  // 拖放进入事件
  const handleDragenter = (e: DragEvent & { target: HTMLElement }, parentIndex: number, index?: number) => {
    const { startColumnIndex, startBlockIndex } = draggable;
    // 如果是自身不需要添加下划线
    if (parentIndex === startColumnIndex && index === startBlockIndex) {
      return;
    }
    hasClassName(e, "block") && setDragStyle(e, "borderBottom", DragStyle.setDragRectStyle);
    // 如果是li元素，给整个li添加border
    hasClassName(e, "el-scrollbar__wrap") && setDragStyle(e, "border", DragStyle.setWrapperBorderStyle);
    if (parentIndex === 3) {
      if (a) {
        ElMessage({
          type: "info",
          message: "关联迭代后，计划状态将跟随迭代状态自动变更，无需拖动哦"
        });
        a = 0;
        setTimeout(() => {
          a = 1;
        }, 2000);
      }
    }
  };

  const handleDragleave = (e: DragEvent & { target: HTMLElement }) => {
    resetDragStyle(e, "borderBottom", DragStyle.unset);
    hasClassName(e, "el-scrollbar__wrap") && resetDragStyle(e, "border", DragStyle.unset);
  };

  // 当拖拽完成后触发的事件，此事件作用在被拖曳元素上
  const handleDrop = (e: DragEvent & { target: HTMLElement }, columnIndex: number, index?: number) => {
    if (columnIndex >= 3) {
      hasClassName(e, "block") && resetDragStyle(e, "borderBottom", DragStyle.unset);
      resetDragStyle(e, "border", DragStyle.unset);
      return;
    }
    const { startColumnIndex, startBlockIndex } = draggable;

    const { rowData } = stepList[startColumnIndex].listData[startBlockIndex] as Record<string, any>;
    if (startColumnIndex === columnIndex) {
      hasClassName(e, "block") && resetDragStyle(e, "borderBottom", DragStyle.unset);
      return;
    }
    // 保存
    updatePlanStatus<ResponseParams.ResponseDataSuccess>({ status: stepList[columnIndex].status, id: rowData.plan.id })
      .then((res) => {
        tipMessage(res.code);
        if (res.code === 200) {
          const startEle = stepList[startColumnIndex].listData[startBlockIndex] as any;
          if (e.target.className === "block") {
            if (index! + 1 > stepList[columnIndex].listData.length) {
              stepList[columnIndex].listData.splice(index!, 0, startEle);
            } else {
              stepList[columnIndex].listData.splice(index! + 1, 0, startEle);
            }
          } else {
            stepList[columnIndex].listData.push(startEle);
          }

          // 删除原来的旧元素
          stepList[startColumnIndex].listData.splice(startBlockIndex, 1);
        }
      })
      .finally(() => {
        // 清除target元素的bottom样式
        hasClassName(e, "block") && resetDragStyle(e, "borderBottom", DragStyle.unset);
        resetDragStyle(e, "border", DragStyle.unset);
      });
  };
  // 监听滚动
  let lastMouseoverDom: HTMLElement;
  // 获取当前页面所有scroll的dom，绑定鼠标移入事件
  const columnsWrapperRef = ref();
  let columnDom: Array<HTMLElement>;
  // const idShowLoadingMore = ref(false);
  setTimeout(() => {
    const scrolBar = columnsWrapperRef.value?.getElementsByClassName("el-scrollbar");
    if (scrolBar) {
      columnDom = [...scrolBar];
      columnDom.forEach((dom: HTMLElement) => {
        dom.addEventListener("mouseover", () => {
          lastMouseoverDom = dom;
        });
      });
    }
  }, 0);
  onUnmounted(() => {
    columnDom &&
      columnDom.forEach((dom: HTMLElement) => {
        dom?.removeEventListener("mouseover", () => null, false);
      });
  });
  const handleScroll = (params: Record<string, any>) => {
    if (params.scrollTop === 0) return; // 切换项目异常处理
    if (!lastMouseoverDom) return;
    // 计算是否滚动到底部
    const scrollTop = (lastMouseoverDom.getElementsByClassName("el-scrollbar__wrap")[0] as HTMLElement)?.scrollTop;
    // 获取当前容器div高度
    const wrapperHeight = lastMouseoverDom.offsetHeight;
    // // 获取内容的总体高度
    const scrollViewHeight = (lastMouseoverDom.getElementsByClassName("el-scrollbar__view")[0] as HTMLElement).scrollHeight;
    const columnIndex = parseInt(lastMouseoverDom.getAttribute("data-index")!);
    if (scrollTop + wrapperHeight >= scrollViewHeight) {
      // 滚动到底部，展示箭头
      if (stepList[columnIndex].hasData) {
        // 当前列数据小于10，不出现箭头
        if (stepList[columnIndex].listData.length < 10) {
          stepList[columnIndex].isShowLoadingMore = false;
          return;
        }
        // hasData存在表示还有数据，再展示箭头
        stepList[columnIndex].isShowLoadingMore = true;
      }
    } else {
      stepList[columnIndex].isShowLoadingMore = false;
    }
  };
  // 单列加载更多
  const handleLoadMore = (item: Record<string, any>) => {
    const status = item.status;
    let params = {
      status: item.status
    } as RequestParams.GetPlanListsTurnPage;
    params.page_index = item.page_index + 1;
    params.page_size = item.page_size;
    params = Object.assign({}, params, planParams);
    getPlanListsTurnPage<ResponseParams.ResponseDataSuccess>(params).then((res) => {
      if (res.data.length === 0) {
        item.isShowLoadingMore = false;
        item.hasData = false;
      } else {
        // 获取成功，重新设置当前分页
        item.page_index = item.page_index + 1;
        // 拼接数据到对应位置
        const index = stepList.findIndex((v) => v.status === status);
        // 当前返回数据小于10，表示已经加载完所有数据，显示没有更多
        if (res.data.length < 10) {
          stepList[index].hasData = false;
          stepList[index].isShowLoadingMore = false;
        }
        res.data.forEach((item: Record<string, any>) => {
          stepList[index].listData.push({
            ...item.plan,
            ...item,
            rowData: item,
            bgc: setBackgroundColor(item.plan.status)
          });
        });
      }
    });
  };
  return {
    stepList,
    handleDragstart,
    handleDragenter,
    handleDrop,
    handleDragleave,
    rawLists,
    handleShowDemandDetailDialog,
    planList,
    handleScroll,
    columnsWrapperRef,
    handleLoadMore,
    planParams,
    isShowDetail,
    createPerson
  };
};

export default useDraggable;
