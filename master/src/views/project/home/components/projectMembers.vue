<!--
 * @Author: 宋绍华
 * @Date: 2022-05-16 14:57:51
 * @LastEditTime: 2022-07-26 20:17:07
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\project\home\components\projectMembers.vue
-->
<template>
  <div class="members">
    <!-- search -->
    <div class="members-search">
      <div class="members-search-left">
        <span class="members-search-title">项目成员</span>
        <el-icon @click="currentRt.showInput = true" v-show="!currentRt.showInput" class="members-search-icon" :size="14"><Search /></el-icon>
        <el-input
          @input="onInput"
          style="width: 300px; margin-left: 10px"
          :prefix-icon="Search"
          v-show="currentRt.showInput"
          v-model.trim="currentRt.search"
          placeholder="请搜索姓名"
        ></el-input>
      </div>
      <div class="members-search-btns">
        <el-button type="primary" v-if="currentRt.can_opt_manager || detail?.manager_staff_no === user?.staff_no" @click="showPeronHandle(1)"
          >转让项目</el-button
        >
        <el-button type="primary" @click="showPeronHandle(2)">添加成员</el-button>
      </div>
    </div>
    <!-- table -->
    <page-table class="table-auto-height" style="padding: 0; margin-top: 10px" :hiddenPagation="true" :tableData="currentRt.list">
      <template #main>
        <el-table-column v-for="item in currentRt.tableColumn" :key="item.prop" :label="item.label" :prop="item.prop">
          <template #default="scoped">
            <div v-if="item.prop === 'option'">
              <el-button
                :disabled="scoped.row.role === 2"
                :plain="scoped.row.role === 2"
                @click="handleDelete(scoped.row)"
                :color="scoped.row.role === 2 ? '#999' : ''"
                :type="scoped.row.role === 2 ? '' : 'danger'"
                text
                >移除</el-button
              >
            </div>
            <div v-else-if="item.percent">{{ scoped.row[item.prop] }}%</div>
          </template>
        </el-table-column>
      </template>
    </page-table>
  </div>
  <HandlePerson
    :isOldOneShowClose="false"
    disabled-node
    :isRadio="currentRt.isRadio"
    :checkStrictly="false"
    :item="(currentRt.peopleObj as any)"
    @submit="onSubmit"
    :title="currentRt.title"
    v-model:visible="currentRt.visible"
  />

  <TransferMember v-model:visible2="currentRt.visible2" :options="currentRt.tempList" @submit="submit" />
</template>

<script lang="ts">
import useHome, { ProductDetailsResp, StaffItemResp } from "@/composables/useHomePage";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, PropType, reactive, watch, defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";
import HandlePerson from "@/components/handle-person/handle-person.vue";
import { getSession } from "@/utils";
import { replaceProductId } from "@/views/iteration/useMixin";
import { Search } from "@element-plus/icons";
import { USER } from "@/store/state";
import TransferMember from "./transferMember.vue";
interface MembersRt {
  tableColumn: { prop: string; label: string; minWidth?: number; percent?: boolean }[];
  list: StaffItemResp[];
  tempList: StaffItemResp[];
  visible: boolean;
  isRadio: boolean;
  showInput: boolean;
  can_opt_manager: boolean;
  search: string;
  visible2: boolean;
  peopleObj: {
    id: -1;
    participant: { staff_no: string; staff_name: string; is_department: boolean }[];
    department: { staff_no: string; staff_name: string; is_department: boolean }[];
  };
  title: string;
}

export default {
  name: "projectMembers",
  components: {
    HandlePerson,
    TransferMember
  }
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["updateInfo"]);
defineProps({
  detail: {
    type: Object as PropType<ProductDetailsResp | null>,
    default: null
  }
});
const currentRt = reactive<MembersRt>({
  title: "",
  visible2: false,
  tableColumn: [
    {
      prop: "staff_name",
      label: "姓名",
      minWidth: 60
    },
    {
      prop: "job_name",
      label: "岗位"
    },
    {
      prop: "un_finished_task_hours",
      label: "未完成任务工时"
    },
    {
      prop: "un_closed_bug_count",
      label: "未关闭缺陷"
    },
    {
      prop: "month_finished_task_hours",
      label: "本月已完成任务工时"
    },
    {
      prop: "month_fixed_bug_count",
      label: "本月已解决BUG"
    },
    {
      prop: "month_hours_rate",
      label: "本月工时利用率",
      percent: true
    },
    {
      prop: "month_saturation_rate",
      label: "本月计划工作饱和度",
      percent: true
    },
    {
      prop: "create_time",
      label: "关联项目时间"
    },
    {
      prop: "option",
      label: "操作"
    }
  ], // staff 表单
  list: [], // staff列表
  tempList: [], // temp staff list
  visible: false, // 添加成员visible
  isRadio: true, // 是否单选
  showInput: false, // 是否显示input Icon
  can_opt_manager: false,
  peopleObj: {
    id: -1,
    participant: [],
    department: []
  },
  search: ""
});

const router = useRouter();
const user = getSession("user", true) as USER;

const { useGetList, useAddMember, useRemoveMember, useSetProjectManager } = useHome();
const { productId } = replaceProductId();

// 初始化
onMounted(async () => {
  productId.value && (await getStaffList(productId.value));
  combinPeopleData();
  createWatch();
});

const createWatch = () => {
  watch(
    () => productId.value,
    (newVal) => {
      newVal && getStaffList(newVal);
    }
  );
};

// 获取staff 列表
const getStaffList = async (product_id: number) => {
  if (!product_id) return;
  const data = await useGetList(product_id);
  if (data && data.list) {
    currentRt.list = data.list;
    currentRt.tempList = data.list;
    currentRt.can_opt_manager = data.can_opt_manager;
    // 如果搜索存在，就需要调用过滤
    if (currentRt.search) onInput();
  }
};

// 删除成员
const handleDelete = (row: StaffItemResp) => {
  ElMessageBox.confirm("此操作将永久删除该成员，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    confirmButtonClass: "el-button--danger-box",
    type: "error"
  }).then(async () => {
    const isSucc = await removeMembers({ product_id: productId.value, staff_nos: [row.staff_no] });
    if (isSucc) {
      const userId = getSession("user", true) as Record<string, any>;
      // 如果把自己删掉，测回到迭代页面
      if (userId?.staff_no === row.staff_no) {
        router.push({ name: "iteration", query: { come: "member", productId: null } });
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        getStaffList(productId.value);
      }
    }
  });
};

// 移除项目成员
const removeMembers = async (params: { product_id: number; staff_nos: string[] }) => {
  const isTrue = await useRemoveMember(params);
  if (isTrue) {
    ElMessage.success("移除成功");
    return true;
  }
};

// 添加项目成员
const addMembers = async (params: { product_id: number; staff_nos: string[] }) => {
  const isTrue = await useAddMember(params);
  if (isTrue) {
    ElMessage.success("添加成功");
    return true;
  }
};

// 添加成员回调
const onSubmit = async (info: { department: number[]; team_worker: string[]; selectPerson: { staff_name: string; staff_no: string }[] }) => {
  const { selectPerson } = info;
  if (!Array.isArray(selectPerson) || (Array.isArray(selectPerson) && !selectPerson.length)) return;
  if (currentRt.isRadio) {
    const isSucc = await setProjectManager(selectPerson[0].staff_no);
    isSucc && emit("updateInfo");
  } else {
    // 过滤staff_no 出来
    const staff_nos = selectPerson.map((item) => item.staff_no);
    const isSucc = await addMembers({ product_id: productId.value, staff_nos });
    if (isSucc) {
      getStaffList(productId.value);
    }
  }
};

// 设置项目负责人
const setProjectManager = async (staff_no: string) => {
  const isSucc = await useSetProjectManager({ product_id: productId.value, staff_no });
  if (isSucc) {
    ElMessage.success("转让成功");
    getStaffList(productId.value);
    return true;
  }
  return false;
};

// 组合数据
const combinPeopleData = () => {
  currentRt.peopleObj.department = currentRt.list.map((item) => {
    return { staff_no: item.staff_no, staff_name: item.staff_name, is_department: false };
  });
};

const showPeronHandle = (idx: number) => {
  currentRt.isRadio = idx === 1;
  if (idx === 1) {
    currentRt.visible2 = true;
  } else {
    currentRt.title = "添加成员";
    combinPeopleData();
    currentRt.visible = true;
  }
};

// 搜索过滤
const onInput = () => {
  currentRt.list = currentRt.tempList.filter((item) => currentRt.search === "" || item.staff_name.includes(currentRt.search));
};

const submit = async (val: string) => {
  const isSucc = await setProjectManager(val);
  isSucc && emit("updateInfo");
};
</script>
<style lang="less" scoped>
.members {
  margin-top: 10px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  position: relative;

  &-search {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-left {
      display: flex;
      align-items: center;
    }
    &-icon {
      margin-left: 10px;
      color: #888;
      cursor: pointer;
      margin-top: 3px;
    }

    &-title {
      font-size: 14px;
      color: #444;
    }

    &-btns {
      display: flex;
    }
  }
}

// :global(.members .el-table) {
//   height: fit-content !important;
// }
// :global(.members .el-table__body-wrapper) {
//   height: fit-content !important;
// }
// :global(.members .el-scrollbar__wrap) {
//   height: fit-content !important;
// }
</style>
