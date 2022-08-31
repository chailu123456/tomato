// import { getAppList, getEmployeeList } from "@/api/request-modules/common";
// import { updateAppList, updateEmployeeList } from "@/api/request-modules/iteration";
import { Ref, ref } from "vue";
// import { RouteLocationNormalizedLoaded } from "vue-router";
const mockData = [
  {
    id: 1,
    label: "信息技术部",
    isType: true,
    children: [
      {
        id: 4,
        label: "前端组",
        isType: true,
        children: [
          {
            id: 9,
            label: "王五"
          },
          {
            id: 10,
            label: "李四"
          }
        ]
      }
    ]
  },
  {
    id: 2,
    label: "总部",
    isType: true,
    children: [
      {
        id: 5,
        label: "张三"
      },
      {
        id: 6,
        label: "测试人员"
      }
    ]
  },
  {
    id: 3,
    isType: true,
    label: "设计部",
    children: [
      {
        id: 7,
        label: "UI1号"
      },
      {
        id: 8,
        label: "UI2号"
      }
    ]
  }
];
export type treeRefType = HTMLElement & { filter: (...args: Array<unknown>) => void; setChecked: (...args: Array<unknown>) => void };
// props: Record<string, any>, route: RouteLocationNormalizedLoaded
export default function useGetEmployeeAndAppLIsts(treeRef: Ref<treeRefType> | undefined): Record<string, any> {
  const dialogVisible = ref(false);
  const rightCheckedNodes = ref<Array<Record<string, any>>>([]);
  const handleShowDialog = () => {
    // 获取组织架构
    // 获取列表
    dialogVisible.value = true;
  };
  const handleCheckBoxEvent = (checkedNodes: unknown, checkedKeys: Record<string, any>) => {
    rightCheckedNodes.value = (checkedKeys.checkedNodes as Array<Record<string, any>>).filter((item) => !item.isType);
  };
  const deleteCheckedKeys = (item: unknown, index: number) => {
    rightCheckedNodes.value.splice(index, 1);
    treeRef?.value.setChecked(item, false);
  };
  // modal框点击确定
  // deleteId: string
  const handleChangeLists = () => {
    // const { id } = route.query;
    // let idLists = [] as Array<string>;
    // // // 获取到当前列表数据
    // props.list && props.list.forEach((item: Record<string, any>) => idLists.push(item.staff_no || item.id));
    // // deleteId存在为删除
    // if (typeof deleteId === "string") {
    //   // 删除掉当前的数据
    //   const deleteIndex = idLists.findIndex((uid) => uid === deleteId);
    //   idLists.splice(deleteIndex, 1);
    // } else {
    //   idLists = idLists.concat(Object.values(selectLists.value));
    // }
    // const params = {
    //   iteration_id: Number(id)
    // } as any;
    // if (componentInstanceString === "employee") {
    //   params.staff_no_list = idLists;
    //   updateEmployeeList<ResponseParams.ResponseDataSuccess>(params).then((res) => {
    //     tipMessage(res.code);
    //     emit("refresh", Number(id));
    //   });
    // } else {
    //   params.app_id_list = idLists;
    //   updateAppList<ResponseParams.ResponseDataSuccess>(params).then((res) => {
    //     tipMessage(res.code);
    //     emit("refresh", Number(id));
    //   });
    // }
    // dialogVisible.value = false;
  };
  return {
    handleChangeLists,
    deleteCheckedKeys,
    rightCheckedNodes,
    handleCheckBoxEvent,
    mockData,
    dialogVisible,
    handleShowDialog
  };
}
