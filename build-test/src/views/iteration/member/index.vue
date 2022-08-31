<template>
  <div class="member">
    <page-table :tableData="list" :currentPage="page" @handlePagationChange="getData" :total="total" ref="pageTableRef" :stopAutoGetData="stopAutoGetData">
      <template #header>
        <el-form :inline="true" :model="searchParams" @submit.prevent>
          <el-form-item label="">
            <el-input
              v-model.trim="searchParams.keyword"
              @change="handleName"
              @keyup.enter="handleConditionSearch"
              placeholder="姓名、岗位、部门搜索"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item style="float: right">
            <el-button type="primary" @click="handleAdd()">添 加</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column label="员工编号" width="140">
          <template #default="scope">
            <span>{{ scope.row.shr_staff_no || scope.row.staff_no }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="staff_name" width="180" label="姓名"></el-table-column>
        <el-table-column prop="role" width="180" label="角色">
          <template #default="scope">
            <span>{{ scope.row.role === 2 ? "项目负责人" : "项目成员" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="job_name" label="岗位"></el-table-column>
        <el-table-column prop="job_path" label="部门"></el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scoped">
            <el-button v-if="can_opt_manager" :disabled="scoped.row.role === 2" type="text" @click="setAsOwner(scoped.row)">设为项目负责人</el-button>
            <el-button
              :disabled="scoped.row.role === 2"
              :class="[scoped.row.role === 2 ? '' : 'delete']"
              type="text"
              @click="handleDelete(scoped.row, tipMessage)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </template>
    </page-table>
    <el-dialog title="添加成员" custom-class="position-dialog" v-model="dialogShadow" :append-to-body="true" width="42%">
      <div class="load-container" v-if="!allPeople">
        <div class="load"></div>
      </div>
      <div v-else>
        <el-input placeholder="输入姓名查找" v-model="filterText"></el-input>
        <el-scrollbar height="400px">
          <el-tree
            @check="handleCheckBoxEventByText"
            node-key="id"
            default-expand-all
            show-checkbox
            :check-strictly="false"
            :data="allPeople"
            :default-checked-keys="checkedKeys"
            :filter-node-method="filterNode"
            ref="keywordTreeRef"
          ></el-tree>
        </el-scrollbar>
      </div>
      <div>
        <el-divider direction="vertical"></el-divider>
      </div>
      <div>
        <el-scrollbar height="400px">
          <div v-for="(item, index) in selectPerson" :key="index" class="current-checked-nodes">
            <el-button icon="el-icon-user-solid" type="text">{{ item.staff_name }}</el-button>
            <el-icon style="margin-right: 10px; margin-top: 10px" class="el-icon-close" @click="deleteCheckedKeys(item, index)">
              <Close />
            </el-icon>
          </div>
        </el-scrollbar>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :disabled="!dialogShadow" @click="handleShadow">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Pagation } from "@/composables/usePagation";
import useRenderTable from "@/composables/useRenderTable";
import useRequest from "@/composables/useRequest";
import useFetchSearch from "./composables/useFetchSearch";
import { defineComponent, reactive, toRefs, watch, ref, nextTick } from "vue";
import { clearSession } from "@/utils";
import useMessageTip from "@/composables/useMessageTip";
import { useRouter } from "vue-router";
import { getSession } from "@/utils";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { getDepartmentListPeople } from "@/api/request-modules/common";
import { addMember, deleteMember, allMember, setManage } from "@/api/request-modules/product";
import { ResponseParams } from "@/types/response";
import { ElMessageBox } from "element-plus";
import { ProjectMembers } from "@/types/interface";
import { Close } from "@element-plus/icons";

type SerchParams = {
  keyword: string;
  product_id: number;
};
type DeleteParams = {
  staff_nos: string[];
  product_id: number;
};
export default defineComponent({
  name: "member",
  components: {
    Close
  },
  setup() {
    const page = ref(1);
    let flag = ref(false);
    const router = useRouter();
    const { tipMessage } = useMessageTip();
    const searchParams: SerchParams = reactive({
      keyword: "",
      product_id: (getSession("productInfo", true) as Record<string, any>)?.id
    });
    const tableData = reactive<{ list: ProjectMembers[]; total: number; can_opt_manager: boolean }>({
      list: [],
      total: 0,
      can_opt_manager: false
    });
    let defaultPeople = ref();
    const pageTableRef = ref<any>();
    const stopAutoGetData = ref<boolean>(false);
    // 分页以及获取数据
    const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
      stopAutoGetData.value = flag == undefined ? false : true;
      page.value = (pagationParams && pagationParams.pageIndex) || 1;
      const { response } = useRequest(useFetchSearch, params || searchParams);
      const { pagation } = useRenderTable(response);
      let {
        data: { list, count, can_opt_manager }
      } = await pagation(pagationParams);
      tableData.total = count;
      tableData.list = list;
      tableData.can_opt_manager = can_opt_manager;
    };
    let timer: ReturnType<typeof setTimeout>;
    const handleConditionSearch = async () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (flag.value) {
          pageTableRef.value.setCurrentPage();
          page.value = 1;
          await getData({ pageIndex: 1, pageSize: 20 }, true, searchParams);
          flag.value = false;
        } else {
          await getData(pageTableRef.value.getCurrentPage(), true, searchParams);
        }

        stopAutoGetData.value = false;
      }, 300);
    };

    // 人员选中列表id
    let checkedKeys: any = ref([]);

    // 获取项目下所有成员列表
    const allMemberList = ref();
    // 所有成员id
    const allMemberStaffNo = ref();

    handleConditionSearch();
    let timerGetPeople: any;
    const getPeople = () => {
      clearTimeout(timerGetPeople);
      timerGetPeople = setTimeout(async () => {
        // 清空所有成员id重新赋值
        allMemberStaffNo.value = [];
        checkedKeys.value = [];
        await allMember({ product_id: (getSession("productInfo", true) as Record<string, any>)?.id }).then((res: any) => {
          if (res.data && res.data[1]) {
            allMemberList.value = res.data[1].options;
            allMemberList.value.forEach((item: Record<string, any>) => {
              allMemberStaffNo.value.push(item);
              checkedKeys.value.push(item.staff_no);
            });
          }
        });
        await getDepartmentListPeople().then((res: any) => {
          allPeople.value = dataReverse(res.data, allMemberStaffNo.value);

          defaultPeople.value = JSON.parse(JSON.stringify(allPeople.value));
        });
      }, 300);
    };
    useWatchChangeProduct(handleConditionSearch, (newValue) => {
      if (searchParams.product_id != newValue) searchParams.product_id = 0;
      searchParams.product_id = newValue as number;
      handleConditionSearch();
      getPeople();
    });
    // 添加
    const dialogShadow = ref(false);
    const filterText = ref();

    const keywordTreeRef = ref();
    watch(
      () => filterText.value,
      (newValue) => {
        keywordTreeRef?.value.filter(newValue);
      }
    );
    watch(
      () => dialogShadow.value,
      (newValue) => {
        if (!newValue) allPeople.value = [];
      }
    );
    // 添加成员，一级菜单id集合
    const oneMenu: string[] = [];
    const fn = (people: Array<Record<string, any>>, selectPeople: Array<Record<string, any>>, id: string) => {
      let currentKeys: string[] = [];
      if (people && people.length) {
        for (let i = 0; i < people.length; i += 1) {
          selectPeople.forEach((item: Record<string, any>) => {
            if (item.staff_no === people[i].id) {
              currentKeys.push(item.staff_no);
            }
          });
        }
        if (currentKeys.length === people.length) {
          oneMenu.push(id);
          return true;
        }
      }
      return false;
    };
    // 成员列表
    const allPeople = ref();
    // 协作者人员列表列表
    let selectPerson = ref<Array<Record<string, any>>>([]);
    const dataReverse = (people: Array<Record<string, any>>, selectPeople: Array<Record<string, any>>) => {
      let newArr = [];
      for (let i = 0; i < people.length; i += 1) {
        let obj: Record<string, any> = {};
        obj.id = people[i].id;
        obj.label = people[i].label;
        obj.disabled = people[i].is_department ? fn(people[i].children, selectPeople, people[i].id) : false;
        obj.is_department = people[i].is_department;
        selectPeople.forEach((item: Record<string, any>) => {
          if (item.staff_no === people[i].id) {
            obj.disabled = true;
          }
        });
        if (people[i].children && people[i].children.length) {
          obj.children = dataReverse(people[i].children, selectPeople);
        }
        newArr.push(obj);
      }
      return newArr;
    };

    getPeople();
    // 删除成员
    const deleteCheckedKeys = (item: Record<string, any>, index: number) => {
      selectPerson.value.splice(index, 1);
      nextTick(() => {
        keywordTreeRef?.value.setCheckedKeys(selectPerson.value.map((v) => v.staff_no));
        keywordTreeRef?.value.setCheckedKeys(oneMenu.forEach((v: string) => v));
      });
    };
    //成员 搜索 过滤
    const filterNode = (value: any, data: any) => {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    };
    // 添加成员参数
    const addParams = reactive<DeleteParams>({
      product_id: (getSession("productInfo", true) as Record<string, any>)?.id,
      staff_nos: []
    });
    const addPeople = (params: DeleteParams) => {
      addMember(params).then(async (res: any) => {
        if (res.code === 200) {
          tipMessage(res.code);
          dialogShadow.value = false;
          allPeople.value = [];
          await getData(pageTableRef.value.getCurrentPage());
          await getPeople();
        } else {
          tipMessage(res.code, res.message);
        }
      });
    };
    // 添加成员弹框---确定
    const handleShadow = async () => {
      addParams.product_id = (getSession("productInfo", true) as Record<string, any>)?.id;
      addParams.staff_nos = [];
      if (selectPerson.value && selectPerson.value.length) {
        selectPerson.value.forEach((item) => {
          addParams.staff_nos.push(item.staff_no);
        });
        await addPeople(addParams);
      } else {
        dialogShadow.value = false;
      }
    };

    const originSeleteDate = ref<Array<Record<string, any>>>([]);
    // 文字搜索时候点击的
    const handleCheckBoxEventByText = (checkedNodes: Record<string, any>, checkParams: any) => {
      let ids = ref<string[]>([]);
      // ids.value = checkedKeys.value;
      selectPerson.value.forEach((item) => {
        ids.value.push(item.staff_no);
      });
      const isTrue = ids.value.includes(checkedNodes.id);
      if (isTrue) {
        selectPerson.value.forEach((item, index) => {
          if (item.staff_no === checkedNodes.id) {
            selectPerson.value.splice(index, 1);
          }
        });
      } else {
        originSeleteDate.value = JSON.parse(JSON.stringify(selectPerson.value));
        if (checkParams.checkedNodes.length) {
          selectPerson.value = [];
          const nodes = checkParams.checkedNodes;
          nodes.forEach((item: Record<string, any>) => {
            if (!item.is_department && !item.disabled) {
              selectPerson.value.push({ staff_name: item.label, staff_no: item.id, is_department: item.is_department });
            }
          });
        } else {
          selectPerson.value = [];
        }
      }
    };

    // 搜索框清除
    const handleName = (val: string) => {
      flag.value = true;
      if (!val) handleConditionSearch();
    };
    // 添加成员
    const handleAdd = () => {
      dialogShadow.value = true;
      selectPerson.value = [];
      allPeople.value = defaultPeople.value;
    };
    // 删除成员
    const handleDelete = (row: ProjectMembers, tipMessage: (code: number) => void) => {
      ElMessageBox.confirm("此操作将永久删除该成员，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        const staffNos = reactive<DeleteParams>({
          product_id: (getSession("productInfo", true) as Record<string, any>)?.id,
          staff_nos: [row.staff_no]
        });
        deleteMember<ResponseParams.ResponseDataSuccess>(staffNos).then(async (res) => {
          tipMessage(res.code);
          if (res.code === 200) {
            const userId = getSession("user", true) as Record<string, any>;
            // 如果把自己删掉，测回到迭代页面
            if (userId.staff_no === row.staff_no) {
              clearSession("productId");
              router.push({ name: "iteration", query: { come: "member", productId: null } });
              setTimeout(() => {
                window.location.reload();
              }, 100);
            } else {
              await getData(pageTableRef.value.getCurrentPage());
              await getPeople();
            }
          }
        });
      });
    };

    // 设置项目负责人
    const setAsOwner = (row: ProjectMembers) => {
      console.log(row);
      ElMessageBox.confirm("项目负责人有且仅有一个，是否确认变更？", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }).then((res) => {
        if (res === "confirm") {
          setManage({ product_id: row.product_id, staff_no: row.staff_no }).then(async (res: any) => {
            if (res.code === 200) {
              tipMessage(res.code);
              await getData(pageTableRef.value.getCurrentPage());
            }
          });
        }
      });
    };
    return {
      setAsOwner,
      tipMessage,
      handleAdd,
      handleConditionSearch,
      stopAutoGetData,
      getData,
      ...toRefs(tableData),
      pageTableRef,
      searchParams,
      keywordTreeRef,

      handleDelete,
      handleName,
      handleShadow,
      selectPerson,
      deleteCheckedKeys,
      filterNode,
      handleCheckBoxEventByText,
      checkedKeys,
      dialogShadow,
      allPeople,
      filterText,
      page
    };
  }
});
</script>
<style lang="less" scoped>
.applist-form {
  :deep(.el-form-item) {
    display: flex;
  }
  :deep(.el-form-item__content) {
    flex-grow: 1;
  }
  :deep(.el-select) {
    width: 100%;
  }
}
:deep(.page) {
  bottom: 24px;
}
.position-dialog {
  .el-dialog__body {
    position: relative;
    display: flex;
    // flex-wrap: nowrap;
    div {
      &:nth-child(1) {
        flex: 0 0 48%;
      }
      &:nth-child(2) {
        .el-divider--vertical {
          height: 100%;
        }
      }
      &:nth-child(3) {
        flex: 0 0 48%;
      }
    }
    .current-checked-nodes {
      display: flex;
      align-items: center;
      justify-content: space-between;
      i {
        cursor: pointer;
        &:hover {
          color: @rp-color-danger;
        }
      }
    }
  }
  .load-container {
    transform: scale(0.2);
    width: 200px;
    height: 200px;
    position: relative;
    margin: 60px auto;
  }

  .load {
    width: 150px;
    height: 150px;
    border: 20px solid #f3f3f3;
    border-top: 20px solid #0dc5c1;
    border-radius: 50%;
    animation: loading 1.2s infinite linear;
  }

  @keyframes loading {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
<style lang="less">
.position-dialog {
  .el-dialog__body {
    position: relative;
    display: flex;
  }
}
</style>
