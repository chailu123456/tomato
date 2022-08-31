<!--
 * @Author: 宋绍华
 * @Date: 2022-05-18 10:24:28
 * @LastEditTime: 2022-07-25 22:52:55
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\product\testBill\index.vue
-->
<template>
  <div class="testBill">
    <!-- 搜索项 -->
    <div class="testBill-search">
      <search-form ref="searchform" @click.once="onSearch" :searchArray="searchArray" @quickSeacrh="quickSeacrh" @changeSearch="changeSearch"></search-form>
      <el-button @click="addTestBill" type="primary">新增提测单</el-button>
    </div>
    <!-- table -->
    <page-table
      style="padding-left: 0; padding-right: 0"
      :tableData="currentRt.list"
      :total="currentRt.total"
      @handlePagationChange="changeTable"
      :currentPage="currentRt.currentPage"
      :highlight="true"
    >
      <template #main>
        <el-table-column
          v-for="item in currentRt.tableColumn"
          :key="item.prop"
          :label="item.label"
          :prop="item.prop"
          :min-width="item.minWidth"
          :className="item.class"
        >
          <template #default="scoped">
            <div v-if="item.prop === 'id'">{{ scoped.row.id }}</div>
            <div v-if="item.prop === 'status'" :style="`color: ${TESTBILLTYPES[scoped.row.status - 1]?.color}`">
              {{ TESTBILLTYPES[scoped.row.status - 1]?.label }}
            </div>
            <div v-else-if="item.prop === 'staff_name'">
              <selectOption
                :valueKey="['staff_no', 'staff_name']"
                keyVal="staff_no"
                class="priority-popup"
                :currentVal="scoped.row.staff_no"
                :type="0"
                currentType="staff_no"
                :item="scoped.row"
                :optionsData="currentRt.users"
                @onChangeSelect="onChangeType"
              ></selectOption>
            </div>
            <div v-else-if="item.prop === 'option'">
              <Btns @onClick="(params) => showBtnConfirm(scoped.row, params)" :status="scoped.row.status" />
            </div>
            <div v-else-if="item.prop === 'name'">
              <span @click="showEditDrawer(scoped.row)" style="text-align: left; display: block" class="table-link">{{ scoped.row[item.prop] }}</span>
            </div>
          </template>
        </el-table-column>
      </template>
    </page-table>

    <BtnConfirm
      v-if="currentRt.btnConfirmObj.visible"
      v-model:btVisible="currentRt.btnConfirmObj.visible"
      :info="currentRt.btnConfirmObj"
      @submit="btnConfirmSubmit"
    />
    <HandleTestBill @update-info="getTestBillList(currentRt.searchForm!, 1)" ref="testBillComp" />
  </div>
</template>

<script lang="ts">
import useTestBill, {
  TestBillEditReq,
  AssociatedSelectResp,
  ListCreatorResp,
  ProductTestBillItem,
  ProductTestBillReq,
  TestBillNotifyItem
} from "@/composables/useTestBill";
import { replaceProductId } from "@/views/iteration/useMixin";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { TESTBILLTYPES } from "@/utils/contantOptions";
import Btns from "./components/btns.vue";
import { getSession } from "@/utils";
import { USER } from "@/store/state";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import BtnConfirm from "./components/btnConfirm.vue";
import selectOption from "@/businessComponents/selectOption/index.vue";
import HandleTestBill from "./components/handleTestBill.vue";

interface TestBill {
  currentPage: number;
  total: number;
  list: ProductTestBillItem[];
  searchForm: ProductTestBillReq | null;
  tableColumn: { prop: string; label: string; minWidth?: number; class?: string }[];
  demands: AssociatedSelectResp[];
  iters: AssociatedSelectResp[];
  tasks: AssociatedSelectResp[];
  creators: ListCreatorResp[];
  users: ListCreatorResp[];
  form: Record<string, any>;
  btnConfirmObj: {
    toStatus: number;
    curStatus: number;
    visible: boolean;
    text: string;
    id: number;
    notify_list: TestBillNotifyItem[];
  };
}

export default {
  name: "testBill"
};
</script>

<script lang="ts" setup>
import type { SearchArray } from "@/types/interface";
import { Pagation } from "@/composables/usePagation";
import { useRoute, useRouter } from "vue-router";

const { useGetTestBillList, useGetCreatorList, useGetUserList, useModifyTestBill, useGetProductTestBillList } = useTestBill();

const { productId } = replaceProductId();
const user = getSession("user", true) as USER;
const router = useRouter();
const route = useRoute();
const testBillComp = ref();
let flag = false;

const currentRt = reactive<TestBill>({
  list: [],
  total: 0,
  currentPage: 1,
  btnConfirmObj: {
    toStatus: 0,
    curStatus: 0,
    visible: false,
    id: 0,
    notify_list: [],
    text: ""
  },
  searchForm: {
    product_id: productId.value
  },
  tableColumn: [
    {
      prop: "id",
      label: "ID",
      minWidth: 60
    },
    {
      prop: "name",
      label: "标题",
      minWidth: 200,
      class: "table-column-left"
    },
    {
      prop: "status",
      label: "状态"
    },
    {
      prop: "creator",
      label: "创建人"
    },
    {
      prop: "create_time",
      label: "创建时间"
    },
    {
      prop: "staff_name",
      label: "指派给"
    },
    {
      prop: "update_time",
      label: "更新时间"
    },
    {
      prop: "option",
      label: "操作",
      minWidth: 140
    }
  ],
  form: {
    // 抽屉form 表单
    status: 1,
    product_id: productId.value,
    staff_no: user?.staff_no,
    basicUser: [],
    productLists: [],
    iterate: []
  },
  demands: [], // 需求
  iters: [], // 迭代
  tasks: [], // 任务
  creators: [], // 创建人
  users: [] // 指派人
});
// 搜索列表数据
// @ts-ignore
const searchArray: SearchArray = reactive({
  btnArray: [
    { id: "-1", label: "所有", key: "" },
    { id: "3", label: "待确认", key: "status" },
    { id: "4,5,6", label: "进行中", key: "status" },
    { id: "7", label: "已完成", key: "status" },
    { id: "8", label: "我创建的", key: "create_by" },
    { id: "9", label: "指给我的", key: "staff_no" },
    { id: "10", label: "本月", key: "create_time" }
  ],
  searchForm: [
    {
      type: "input",
      label: "标题",
      key: "name",
      val: ""
    },
    {
      type: "select",
      label: "状态",
      val: [],
      multiple: true,
      key: "status",
      valueKey: ["value", "label"],
      listData: TESTBILLTYPES
    },
    {
      type: "select",
      label: "创建人",
      val: [],
      key: "create_by",
      showRecord: true,
      multiple: true,
      valueKey: ["staff_no", "staff_name"],
      listData: currentRt.creators
    },
    {
      type: "select",
      label: "指派给",
      val: [],
      key: "staff_no",
      showRecord: true,
      multiple: false,
      valueKey: ["staff_no", "staff_name"],
      listData: currentRt.users
    },
    {
      type: "select",
      label: "关联需求",
      multiple: false,
      key: "demand_id",
      val: [],
      valueKey: ["id", "value"],
      listData: currentRt.demands
    },
    {
      type: "select",
      label: "关联迭代",
      multiple: false,
      val: [],
      key: "iteration_id",
      valueKey: ["id", "value"],
      listData: currentRt.iters
    },
    {
      type: "select",
      label: "关联任务",
      multiple: false,
      key: "task_id",
      val: [],
      valueKey: ["id", "value"],
      listData: currentRt.tasks
    },
    {
      type: "daterange",
      label: "创建时间",
      val: [],
      key: "create_time",
      valueKey: []
    }
  ]
});

// 快速搜索类型
type SearchValType = typeof searchArray.btnArray[0];

const basicUser = computed(() => {
  if (!currentRt.users[1]) return [];
  return currentRt.users[1]?.options.map((item) => {
    return {
      value: item.staff_no,
      label: item.staff_name
    };
  });
});
const searchform = ref();

watch(
  () => productId.value,
  (newVal: number) => {
    searchform.value?.resetForm();
    currentRt.searchForm!.product_id = newVal;
    getAllList();
  }
);

watch(
  () => router.currentRoute.value.query,
  () => {
    const { testApplyId, productId } = route.query as Record<string, any>;
    if (testApplyId) {
      router.replace({
        name: "testBill",
        query: {
          productId
        }
      });
      testBillComp.value.showBtnConfirm(parseInt(testApplyId));
    }
  },
  {
    deep: true
  }
);

onMounted(async () => {
  const { testApplyId, productId } = route.query as Record<string, any>;
  await getAllList();
  if (testApplyId) {
    router.replace({
      name: "testBill",
      query: {
        productId
      }
    });
    testBillComp.value.showBtnConfirm(parseInt(testApplyId));
  }
});

// 获取所有的接口
const getAllList = async () => {
  await getTestBillList(currentRt.searchForm!);
  getCreatorList();
  getUserList();
};
const getUserList = async () => {
  if (!productId.value) return;
  const data = await useGetUserList({ product_id: productId.value });

  if (data) {
    currentRt.users = data;
    currentRt.form.basicUser = basicUser.value;
    // @ts-ignore
    searchArray.searchForm[3].listData = data;
  }
};
// 新增提测单
const addTestBill = () => {
  testBillComp.value.handleDrawerVisble(true, true);
};

// 快速搜索
const quickSeacrh = async (val: SearchValType) => {
  const temps = ["-1", "3", "4,5,6", "7"];
  Object.keys(currentRt.searchForm!).forEach((k) => {
    if (k === "product_id") return;
    // @ts-ignore
    currentRt.searchForm![k as keyof typeof currentRt.searchForm] = undefined;
  });
  const k = val.key as keyof ProductTestBillReq;
  if (temps.includes(val.id)) {
    // @ts-ignore
    currentRt.searchForm[k] = isNaN(val.id) ? [...val.id.split(",").map((i) => parseInt(i))] : parseInt(val.id);
  } else if (val.key === "create_by" || val.key === "staff_no") {
    // @ts-ignore
    currentRt.searchForm[k] = user?.staff_no;
  } else if (val.key === "create_time") {
    const lastDay = dayjs().endOf("month").format("YYYY-MM-DD");
    const firstDay = dayjs().format("YYYY-MM-01");

    currentRt.searchForm!.create_time = [firstDay, lastDay];
  }
  flag = true;
  await getTestBillList(currentRt.searchForm!);
  flag = false;
};

const changeSearch = async (val: Record<string, string | number[]>) => {
  const searchForm: ProductTestBillReq = {
    product_id: productId.value // 项目ID
  };
  const params = Object.assign(searchForm, val);

  // 如果空值就删除掉属性，不传给后台，这里面包含字符串和数组
  Object.keys(params).forEach((keys) => {
    const val = params[keys];
    if ((Array.isArray(val) && !val.length) || !val) delete params[keys];
  });

  flag = true;
  await getTestBillList(params);
  flag = false;

  setTimeout(() => {
    getUserList();
  }, 500);
};

// 获取搜索需求、迭代、任务的列表数据
const getAssociatedList = async () => {
  if (!productId.value) return;
  const types = [1, 2, 3];
  for (const i of types) {
    const data = await useGetProductTestBillList({ product_id: productId.value, type: i });
    if (data) {
      if (i === 1) {
        currentRt.demands = data;
        searchArray.searchForm[4].listData = data;
      } else if (i === 2) {
        currentRt.iters = data;
        searchArray.searchForm[5].listData = data;
      } else {
        currentRt.tasks = data;
        searchArray.searchForm[6].listData = data;
      }
    }
  }
};

// 获取列表数据  type代表编辑详情后请求指派人下拉列表
const getTestBillList = async (params: ProductTestBillReq, type?: number) => {
  if (!params.product_id) return;
  const data = await useGetTestBillList(params);
  if (data) {
    currentRt.list = data.list;
    currentRt.total = data.count;
  }
  if (type) {
    setTimeout(() => {
      getUserList();
    }, 500);
  }
};

// 状态变更弹窗按钮回调
const btnConfirmSubmit = async (params: { toStatus: number; id: number; remark: string; notify_list: { staff_no: string; staff_name: string }[] }) => {
  testBillComp.value.showBtnConfirm(params);
};

// 弹出状态变更弹窗
const showBtnConfirm = (row: ProductTestBillItem | number | Record<string, any>, params: { toStatus: number; curStatus: number; text: string }) => {
  testBillComp.value.showBtnConfirm(row, params);
};

// 获取创建人列表
const getCreatorList = async () => {
  if (!productId.value) return;
  const data = await useGetCreatorList(productId.value);
  if (data) {
    currentRt.creators = data;
    // @ts-ignore
    searchArray.searchForm[2].listData = data;
  }
};

// 列表更改指派人
const onChangeType = async (val: string | number, row: ProductTestBillItem) => {
  const person = basicUser.value.filter((item: { value: string; label: string }) => item.value === val);
  modifyTestBill({ id: row.id, staff_no: person[0]?.value, staff_name: person[0]?.label });
  setTimeout(() => {
    getUserList();
  }, 500);
};

// 修改详情
const modifyTestBill = async (params: TestBillEditReq) => {
  const isSucc = await useModifyTestBill(params);
  if (isSucc) {
    ElMessage.success("更改成功");

    getTestBillList(currentRt.searchForm!);
    return true;
  }
  return false;
};

// 抽离弹窗回显数据
const showEditDrawer = async (row: ProductTestBillItem | number) => {
  testBillComp.value.showEditDrawer(row);
};
// 切换分页
const changeTable = (pagationParams?: Pagation) => {
  currentRt.currentPage = (pagationParams && pagationParams.pageIndex) || 1;
  if (flag) return;
  const params = Object.assign(currentRt.searchForm!, pagationParams);
  getTestBillList(params);
};

const onSearch = () => {
  getAssociatedList();
};
</script>

<style lang="less" scoped>
.testBill {
  padding: 10px;
  background-color: #fff;
  height: calc(100% + 10px);
  overflow: hidden;

  &-search {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .table-link:hover {
    text-decoration: underline;
  }
}
:global(.testBill .rp-dropdown-select) {
  width: 100%;
  margin: 0;
}

:global(.testBill .priority-popup) {
  margin-left: 9%;
}

// 不要删掉，应对全屏名称的样式问题
:global(.testBill .table-column-left) {
  font-size: 14px;
}
</style>
