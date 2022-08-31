import { getAppList, getEmployeeList } from "@/api/request-modules/common";
import { updateAppList, updateEmployeeList } from "@/api/request-modules/iteration";
import { Ref, ref, watch } from "vue";
import { ResponseParams } from "@/types/response";
import { RouteLocationNormalizedLoaded } from "vue-router";
const eachValue = (allLists: ResponseParams.ResponseDataSuccess, tableData: Array<any>) => {
  allLists.data.forEach((list: Record<string, any>) => {
    tableData &&
      tableData.forEach((itemTableData: Record<string, any>) => {
        if (itemTableData.staff_no && list.staff_no) {
          if (itemTableData.staff_no === list.staff_no) {
            list.isDisabled = true;
          }
        } else {
          if (itemTableData.id === list.id) {
            list.isDisabled = true;
          }
        }
      });
  });

  return allLists;
};

export default function useGetEmployeeAndAppLIsts(
  props: Record<string, any>,
  componentInstanceString: string,
  dataList: Ref<Array<{ disabled: boolean; label: string; key: string }>>,
  route: RouteLocationNormalizedLoaded,
  emit: (...args: Array<any>) => void,
  tipMessage: (code: number) => void
): Record<string, any> {
  // 当前右侧选择的数据列表
  const selectLists = ref([]);
  const dialogVisible = ref(false);
  watch(
    () => props.list,
    (tableValue) => {
      dataList.value = [];
      if (componentInstanceString === "employee") {
        getEmployeeList<ResponseParams.ResponseDataSuccess>()
          .then((allEmployeeLists) => {
            return eachValue(allEmployeeLists, tableValue);
          })
          .then((allLists: ResponseParams.ResponseDataSuccess) => {
            allLists.data!.forEach((v: Record<string, any>) => {
              dataList.value.push({
                disabled: v.isDisabled,
                label: v.staff_name,
                key: v.staff_no
              });
            });
          });
      } else {
        getAppList<ResponseParams.ResponseDataSuccess>()
          .then((allAppLists) => {
            return eachValue(allAppLists, tableValue);
          })
          .then((allLists: ResponseParams.ResponseDataSuccess) => {
            allLists.data!.forEach((v: Record<string, any>) => {
              dataList.value.push({
                disabled: v.isDisabled,
                label: v.name,
                key: v.id
              });
            });
          });
      }
    }
  );
  // modal框显示
  const handleShowDialog = () => {
    selectLists.value = [];
    dialogVisible.value = true;
  };
  // 搜索过滤方法
  const filterMethod = (query: any, item: any) => {
    return item.label.indexOf(query) > -1;
  };
  // modal框点击确定
  const handleChangeLists = (deleteId: string) => {
    const { id } = route.query;
    let idLists = [] as Array<string>;
    // 获取到当前列表数据
    props.list && props.list.forEach((item: Record<string, any>) => idLists.push(item.staff_no || item.id));
    // deleteId存在为删除
    if (typeof deleteId === "string") {
      // 删除掉当前的数据
      const deleteIndex = idLists.findIndex((uid) => uid === deleteId);
      idLists.splice(deleteIndex, 1);
    } else {
      idLists = idLists.concat(Object.values(selectLists.value));
    }
    const params = {
      iteration_id: Number(id)
    } as any;
    if (componentInstanceString === "employee") {
      params.staff_no_list = idLists;
      updateEmployeeList<ResponseParams.ResponseDataSuccess>(params).then((res) => {
        tipMessage(res.code);
        emit("refresh", Number(id));
      });
    } else {
      params.app_id_list = idLists;
      updateAppList<ResponseParams.ResponseDataSuccess>(params).then((res) => {
        tipMessage(res.code);
        emit("refresh", Number(id));
      });
    }
    dialogVisible.value = false;
  };
  return {
    selectLists,
    dataList,
    handleShowDialog,
    filterMethod,
    handleChangeLists,
    dialogVisible
  };
}
