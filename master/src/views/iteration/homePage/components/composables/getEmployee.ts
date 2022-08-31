import { computed, nextTick, Ref, ref, watch } from "vue";
import { getEmployeeList } from "@/api/request-modules/common";
import { getProductMember } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
import { updateEmployeeList } from "@/api/request-modules/iteration";
import route from "@/router";
import VueEvent from "@/utils/mitt";
import { useStore } from "@/store/index";
import { MutationType } from "@/store/mutation-types";
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
export type treeRefType = HTMLElement & {
  filter: (...args: Array<unknown>) => void;
  setChecked: (...args: Array<unknown>) => void;
  updateKeyChildren: (...args: Array<unknown>) => void;
  setCheckedKeys: (...args: Array<unknown>) => void;
  getNode: (...args: Array<unknown>) => Record<string, any>;
  setCheckedNodes: (...args: Array<unknown>) => Record<string, any>;
  setCurrentNode: (...args: Array<unknown>) => Record<string, any>;
  setCurrentKey: (...args: Array<unknown>) => Record<string, any>;
};
export default function useGetEmployeeAndAppLIsts(
  treeRef: Ref<treeRefType>,
  keywordTreeRef: Ref<treeRefType>,
  props: Record<string, any>,
  emit: (event: "refresh", ...args: any[]) => void,
  tipMessage: (...args: Array<unknown>) => any
): Record<string, any> {
  const filterText = ref("");
  // 部门下的员工列表
  const deparment = ref();
  // 关键字搜索列表
  const userListForName = ref([]);
  const dialogVisible = ref(false);
  const rightCheckedNodes = ref<Array<Record<string, any>>>([]);
  const rightNodeKey = computed(() => {
    return rightCheckedNodes.value.map((node: Record<string, any>) => node.uniqueId);
  });
  let hashMap = Object.create(null); // 记录已经获取了哪些部门
  const store = useStore();
  const currentIter = computed(() => store.getters.currentIter);
  const curProductInfo = computed(() => store?.getters?.productInfo);
  // 监听添加迭代后---弹出添加成员
  VueEvent.on("btn", () => {
    handleShowDialog();
  });
  const handleShowDialog = async () => {
    // 获取组织架构
    // 获取列表
    rightCheckedNodes.value = [];
    hashMap = {};
    store.commit(MutationType.addMemberVisible, true);
    props.list.forEach((v: Record<string, any>) => {
      hashMap[v.staff_no] = [v];
    });
    rightCheckedNodes.value = [...props.list];
    await getMembers();

    nextTick(() => {
      treeRef?.value.setCheckedKeys(rightCheckedNodes.value.map((v) => v.uniqueId));
    });
  };

  const handleCheckBoxEvent = (item: any) => {
    // 1.如果勾选的是部门，并且是选中，从接口获取当前部门人员列表
    // 获取当前节点状态
    const isChecked = treeRef?.value.getNode(item.id).checked;
    if (isChecked) {
      // 勾选的部门，获取当前部门下的所有员工
      if (item.department_code) {
        getEmployeeListByDepartmentCode(item).then((res: any) => {
          // 添加到右侧列表
          // 获取res和rightCheckedNodes的并集，因为可能会有重复
          const obj = {} as Record<string, any>;
          if (rightCheckedNodes.value.length) {
            rightCheckedNodes.value.forEach((o) => {
              obj[o.uniqueId] = o;
            });
            (res as Array<Record<string, any>>).forEach((v) => {
              if (!obj[v.uniqueId]) {
                rightCheckedNodes.value.push(v);
              }
            });
          } else {
            rightCheckedNodes.value = rightCheckedNodes.value.concat(res as Array<Record<string, any>>);
          }
          hashMap[item.department_code] = res;
        });
      } else {
        // 点击的是个人员工节点
        const index = rightCheckedNodes.value.findIndex((v) => v.staff_no === item.id);
        if (index < 0) {
          rightCheckedNodes.value.push({ staff_no: item.id, staff_name: item.label });
        }
      }
    } else {
      // 删除逻辑
      // 从hashMap寻找，清除掉所有的key，value
      if (Reflect.get(hashMap, item.department_code)) {
        // 点击过存在
        Reflect.deleteProperty(hashMap, item.department_code);
        rightCheckedNodes.value = Object.values(hashMap).flat(Infinity) as Array<Record<string, any>>;
      } else {
        // 没有点击过并且是部门节点，可能是某个已经点击过的父节点下的子节点的取消,重新获取这个部门下有哪些人，
        if (item.department_code) {
          getEmployeeListByDepartmentCode(item).then((res: any) => {
            // 遍历hashMap键值对，找到对应的删除掉
            for (const key in hashMap) {
              const copyArray = hashMap[key].slice();
              for (let i = hashMap[key].length - 1; i >= 0; i--) {
                for (let j = res.length - 1; j >= 0; j--) {
                  if (hashMap[key][i].uniqueId === res[j].uniqueId) {
                    copyArray.splice(i, 1);
                  }
                }
                hashMap[key] = copyArray.slice();
              }
            }

            rightCheckedNodes.value = Object.values(hashMap).flat(Infinity).slice() as Array<Record<string, any>>;
          });
        } else {
          // 没点击过，而且是单个人员节点，直接删除
          const index = rightCheckedNodes.value.findIndex((v) => v.staff_no === item.id);
          // 右侧删除
          rightCheckedNodes.value.splice(index, 1);
          // 从hashMap删除
          deleteForHashMap(item.id);
        }
      }
    }
  };

  // 根据部门id获取当前所有的员工
  function getEmployeeListByDepartmentCode(data: Record<string, any>) {
    return new Promise((resolve) => {
      getEmployeeList<ResponseParams.ResponseDataSuccess>({ department_code: data.department_code }).then((res) => {
        res.data.forEach((_: Record<string, any>) => {
          _.uniqueId = _.staff_no;
          _.p_uniqueId = data.uniqueId;
        });
        resolve(res.data);
      });
    });
  }

  const deleteCheckedKeys = (item: Record<string, any>, index: number) => {
    // 点击右侧删除单个节点，找到当前的node，设置状态
    rightCheckedNodes.value.splice(index, 1);
    treeRef.value && treeRef?.value.setChecked(item, false);
    keywordTreeRef.value && keywordTreeRef?.value.setChecked(item, false);
    // 从hashMap删除,从key寻找
    Reflect.deleteProperty(hashMap, item.staff_no);
    // 从hashMap删除,从value寻找
    deleteForHashMap(item.staff_no);
  };

  function deleteForHashMap(uniqueId: string) {
    for (const key in hashMap) {
      for (let i = hashMap[key].length - 1; i >= 0; i--) {
        if (hashMap[key][i].uniqueId === uniqueId) {
          hashMap[key].splice(i, 1);
        }
      }
    }
  }
  // modal框点击确定
  const handleConfirmSubmit = async () => {
    filterText.value = "";
    // 1.直接获取到右侧的员工列表提交
    const ids = rightCheckedNodes.value.map((v) => v.staff_no);
    updateEmployeeList<ResponseParams.ResponseDataSuccess>({
      iteration_id: currentIter.value?.id,
      staff_no_list: ids
    }).then((res) => {
      if (res.code === 200) {
        tipMessage(res.code);
      }
      emit("refresh", currentIter.value?.id);
    });
    dialogVisible.value = false;
    store.commit(MutationType.addMemberVisible, false);
  };

  const dataReverse = (people: Array<Record<string, any>>, hasArr?: Record<string, any>[]) => {
    const newArr = [];
    for (let i = 0; i < people.length; i += 1) {
      const obj: Record<string, any> = {};
      obj.id = people[i].id;
      obj.label = people[i].label;
      obj.is_department = people[i].is_department;
      obj.disabled = people[i].is_department ? true : Array.isArray(hasArr) && hasArr.some((item) => item.staff_no === obj.id && item.role);

      if (people[i].children && people[i].children.length) {
        obj.children = dataReverse(people[i].children, hasArr);
      }
      newArr.push(obj);
    }
    return newArr;
  };

  //#region 获取部门组织和员工
  const getMembers = async () => {
    await getProductMember<ResponseParams.ResponseDataSuccess>({
      product_id: curProductInfo.value?.id,
      iteration_id: currentIter.value?.id
    }).then((res) => {
      deparment.value = dataReverse(res.data, rightCheckedNodes.value);
      return Promise.resolve();
    });
  };
  // 节点展开事件，每展开一个节点遍历当前节点下是否存在son为空
  watch(
    () => currentIter.value?.id,
    () => {
      getMembers();
    }
  );
  const handleNodeExpand = async (item: Record<string, any>, node: Record<string, any>) => {
    const callbacks = [] as Array<() => Promise<unknown>>;
    item.son.forEach((v: Record<string, any>) => {
      callbacks.push(
        ...getEmployee(v, (data: any, code: any) => {
          treeRef.value.updateKeyChildren(code, data);
          // 如果勾选的是部门，勾选下面的所有子节点+
          if (node.checked && node.data.department_code) {
            data.forEach((v: Record<string, any>) => {
              treeRef.value.setChecked(v, true);
            });
          }
        })
      );
    });
    run(callbacks);
  };
  function getEmployee(item: Record<string, any>, cb?: (...args: Array<unknown>) => unknown) {
    const arr = [] as Array<() => Promise<unknown>>;
    if (item.department_code && item.son.length === 0) {
      arr.push(async () => {
        const result = await getEmployeeList<ResponseParams.ResponseDataSuccess>({
          department_code: item.department_code
        });
        if (Array.isArray(result.data)) {
          (result.data as Array<Record<string, any>>).forEach((_) => {
            _.name = _.staff_name;
            _.p_uniqueId = item.uniqueId;
            _.uniqueId = _.staff_no;
          });
          cb && cb(result.data, item.department_code);
          item.son.push(...result.data);
          const hash = {} as Record<string, any>;
          item.son = item.son.reduce(function (item: Record<string, any>, next: Record<string, any>) {
            hash[next.name] ? "" : (hash[next.name] = true && item.push(next));
            return item;
          }, []);
          return result;
        }
      });
    }

    return arr;
  }
  async function run(arr: Array<() => Promise<unknown>>) {
    for await (const item of arr) {
      item();
    }
  }
  // 关键字搜索
  let interval: any;
  const getUserForName = (key: string) => {
    clearTimeout(interval);
    if (key) {
      userListForName.value = [];
      interval = setTimeout(async () => {
        const result = await getEmployeeList<ResponseParams.ResponseDataSuccess>({ keyword: key });
        if (result.data) {
          (result.data as Array<Record<string, any>>).forEach((_) => {
            _.name = _.staff_name;
            _.uniqueId = _.staff_no;
          });
          userListForName.value = result.data;
        }
      }, 500);
    }
  };
  // 文字搜索时候点击的
  const handleCheckBoxEventByText = (item: any) => {
    // 获取当前节点状态
    const isChecked = keywordTreeRef?.value.getNode(item.uniqueId)?.checked;
    if (isChecked) {
      // 勾选操作
      // 添加到右侧
      rightCheckedNodes.value.push(item);
    } else {
      // 取消操作，从右侧和hashMap删除
      const index = rightCheckedNodes.value.findIndex((v) => v.uniqueId === item.uniqueId);
      rightCheckedNodes.value.splice(index, 1);
      // 如果可以删除就删除原来的el-tree,其实这里需要一个根据员工查询部门的接口
      treeRef?.value.setChecked(item, false);
    }
  };
  //#endregion
  //#region 迭代页面移除成员
  const handleRemoveList = (item: Record<string, any>) => {
    // 从勾选状态删除
    const copyList = [...props.list];
    const indexRight = copyList.findIndex((v: Record<string, any>) => v.uniqueId === item.staff_no);
    copyList.splice(indexRight, 1);
    // const id = Number(route.currentRoute.value.query.id);
    const ids = copyList.map((v: Record<string, any>) => v.staff_no);
    updateEmployeeList<ResponseParams.ResponseDataSuccess>({
      iteration_id: currentIter.value?.id,
      staff_no_list: ids
    }).then((res) => {
      if (res.code === 200) {
        tipMessage(res.code);
        // 从HashMap删除
        deleteForHashMap(item.staff_no);
        emit("refresh", currentIter.value?.id);
      }
    });
  };
  //#endregion
  //#region 查看任务
  const handleShowTask = (id: string, name: string) => {
    route.push({
      name: "exploitation",
      query: { ...route.currentRoute.value.query, staffNo: id, staffName: name }
    });
  };
  //#endregion
  return {
    handleShowTask,
    handleRemoveList,
    handleCheckBoxEventByText,
    rightNodeKey,
    userListForName,
    getUserForName,
    handleNodeExpand,
    deparment,
    handleConfirmSubmit,
    deleteCheckedKeys,
    rightCheckedNodes,
    handleCheckBoxEvent,
    mockData,
    dialogVisible,
    handleShowDialog,
    filterText
  };
}
