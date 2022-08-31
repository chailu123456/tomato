import { reactive, ref } from "vue";
import { setPlanDetail } from "./useShowPlanDetail";
import { updatePlanStatus } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
import useFetchRequest from "./useFetchRequest";
interface Draggable {
  startColumnIndex: number;
  startBlockIndex: number;
}

const stepList = reactive([
  {
    titleColor: "rgba(255, 244, 227, 1)",
    titleName: "待设计",
    status: 0,
    listData: [
      { isActive: false }
      // {
      //   name: "阿闻到家v1.4.9",
      //   bgc: "rgba(240, 248, 240, 1)"
      // }
    ],
    isDisable: false
  },
  {
    titleColor: "rgba(255, 244, 227, 1)",
    titleName: "设计中",
    status: 1,
    listData: [{ isActive: false }],
    isDisable: false
  },
  {
    titleColor: "rgba(255, 244, 227, 1)",
    titleName: "待评审",
    status: 2,
    listData: [{ isActive: false }],
    isDisable: false
  },
  {
    titleColor: "rgba(255, 244, 227, 1)",
    titleName: "待开发",
    status: 3,
    listData: [{ isActive: false }],
    isDisable: false
  },
  {
    titleColor: "rgba(225, 239, 251, 1)",
    titleName: "开发中",
    status: 4,
    listData: [{ isActive: false }],
    isDisable: true
  },
  {
    titleColor: "rgba(225, 239, 251, 1)",
    titleName: "测试中",
    status: 5,
    listData: [{ isActive: false }],
    isDisable: true
  },
  {
    titleColor: "rgba(225, 239, 251, 1)",
    titleName: "待发版",
    status: 6,
    listData: [{ isActive: false }],
    isDisable: true
  },
  {
    titleColor: "rgba(225, 239, 251, 1)",
    titleName: "已发版",
    status: 7,
    listData: [{ isActive: false }],
    isDisable: true
  }
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
  activeColor = "rgba(240, 248, 240, 1)",
  disableColor = "rgba(225, 239, 251, 1)"
}

// 数据分类到对应的位置
export const sortData = (lists: Array<{ plan: { status: number } }>): void => {
  stepList.forEach((v) => {
    v.listData = [];
    lists.forEach((list) => {
      if (v.status === list.plan.status) {
        const bgc = list.plan.status <= 3 ? DragStyle.activeColor : DragStyle.disableColor;
        (v.listData as Array<unknown>).push({
          isActive: false,
          ...list.plan,
          rowData: list,
          bgc
        });
      }
    });
  });
};
// 获取计划列表
const { getPlanList } = useFetchRequest();
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
  const planList = async () => {
    const { data } = await getPlanList();
    rawLists.value = data;
    sortData(data);
  };
  planList();
  // 拖放元素开始事件
  const handleDragstart = (columnIndex: number, blockIndex: number) => {
    draggable.startColumnIndex = columnIndex;
    draggable.startBlockIndex = blockIndex;
  };
  // 点击事件激活样式与获取详情,获取右侧关联需求
  const handleClickActive = (columnIndex: number, index: number) => {
    // if (columnIndex && index) {
    //   clickIndex.columnIndex = columnIndex;
    //   clickIndex.index = index;
    // }
    // const realColumnIndex = columnIndex || clickIndex.columnIndex;
    // const realIndex = index || clickIndex.index;
    stepList.forEach((list) => {
      list.listData.forEach((itemBlock) => {
        itemBlock.isActive = false;
      });
    });
    setPlanDetail(stepList[columnIndex].listData[index]);
    (stepList[columnIndex].listData[index] as Record<string, any>).isActive = true;
  };
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
  };

  const handleDragleave = (e: DragEvent & { target: HTMLElement }) => {
    resetDragStyle(e, "borderBottom", DragStyle.unset);
    hasClassName(e, "el-scrollbar__wrap") && resetDragStyle(e, "border", DragStyle.unset);
  };

  // 当拖拽完成后触发的事件，此事件作用在被拖曳元素上
  const handleDrop = (e: DragEvent & { target: HTMLElement }, columnIndex: number, index?: number) => {
    const { startColumnIndex, startBlockIndex } = draggable;

    const { rowData } = stepList[startColumnIndex].listData[startBlockIndex] as Record<string, any>;
    if (startColumnIndex === columnIndex) {
      hasClassName(e, "block") && resetDragStyle(e, "borderBottom", DragStyle.unset);
      return;
    }
    // 保存
    updatePlanStatus<ResponseParams.ResponseDataSuccess>({ status: columnIndex, id: rowData.plan.id })
      .then((res) => {
        tipMessage(res.code);
        if (res.code === 200) {
          const startEle = stepList[startColumnIndex].listData[startBlockIndex];
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
  return { stepList, handleDragstart, handleDragenter, handleDrop, handleDragleave, rawLists, handleClickActive, planList };
};

export default useDraggable;
