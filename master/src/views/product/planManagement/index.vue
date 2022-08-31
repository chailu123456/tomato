<template>
  <div class="rp-plan-management">
    <page-table
      :tableData="tableData.list"
      :currentPage="page"
      @sort-change="sortChange"
      @handlePagationChange="getData"
      :total="tableData.total"
      ref="pageTableRef"
      :stopAutoGetData="stopAutoGetData"
    >
      <template #header>
        <div class="search-header">
          <search-form
            :searchArray="searchArray"
            ref="planFormParams"
            :currentActive="currentActive"
            @quickSeacrh="quickSeacrh"
            @changeSearch="changeSearch"
          ></search-form>
          <el-button type="primary" @click="handleAddPlan('')">新增计划</el-button>
        </div>
      </template>
      <template #main>
        <el-table-column label="计划名称" prop="name" class-name="table-column-left table-title" sortable="custom" min-width="140">
          <template #default="scope">
            <span class="app-name" @click="handleDetail(scope.row)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="已上线需求/所有需求" prop="total_num" sortable="custom" width="180">
          <template #default="scope">
            <span @click="handleJumpDemand(scope.row.complete_num, scope.row.id, 1)" :class="[scope.row.complete_num ? `demand-num` : ``]"
              >{{ scope.row.complete_num }}/</span
            >
            <span @click="handleJumpDemand(scope.row.total_num, scope.row.id, 2)" :class="[scope.row.total_num ? `demand-num` : ``]">{{
              scope.row.total_num
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="start_time" sortable="custom" width="300" label="计划时间">
          <template #default="scope">
            <span v-if="!scope.row.start_time && !scope.row.end_time">待定</span>
            <span v-else> {{ scope.row.start_time ? scope.row.start_time : "待定" }} - {{ scope.row.end_time ? scope.row.end_time : "待定" }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="creator" width="130" label="创建人"></el-table-column>
        <el-table-column sortable="custom" prop="staff_name" width="130" label="负责人"></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scoped">
            <el-button type="primary" link @click="handleEdit(scoped.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scoped.row)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <dialog-plan
      :title="title"
      :defaultCheck="defaultCheck"
      v-model:visible="dialogVisiblePlan"
      v-if="dialogVisiblePlan"
      @update="updatePlanData"
      :sortTreeDate="treePlanData"
      :planPeople="basicUserList"
      :dialogForm="dialogForm"
      :planIds="planIds"
    ></dialog-plan>
    <!-- 关联需求 -->
  </div>
</template>

<script lang="ts" setup>
import { Pagation } from "@/composables/usePagation";
import useRenderTable from "@/composables/useRenderTable";
import useRequest from "@/composables/useRequest";
import useFetchSearch from "./composables/useFetchSearch";
import dialogPlan from "./components/dialogPlan.vue";
import { reactive, ref, onMounted, watch } from "vue";
import { SearchArray } from "@/types/interface";
import { getSession } from "@/utils";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { allMember, deletePlan } from "@/api/request-modules/product";
import { getIterationDemand } from "@/api/request-modules/iteration";
import { RequestParams } from "@/types/request";
import { useRouter, useRoute } from "vue-router";
import { ResponseParams } from "@/types/response";
import { ProjectMembers } from "@/types/interface";
import { USER } from "@/store/state";
import { ElMessageBox } from "element-plus";
interface SerchParams {
  name: string;
  product_id: number | string | [];
  create_by: string[];
  start_time: string;
  end_time: string;
  times?: string[];
  staff_no: string[];
  sort_by: number;
  sort_name: string;
  status: string[];

  [key: string]: any;
}
const router = useRouter();
const route = useRoute();

const userMsg = getSession("user", true) as USER;
const page = ref(1);
let flag = ref(false);
// const { tipMessage } = useMessageTip();
const productInfo = getSession("productInfo", true) as Record<string, any>;
const searchParams = ref<SerchParams>({
  name: "",
  create_by: [],
  staff_no: [],
  status: [],
  times: [],
  start_time: "",
  end_time: "",
  sort_name: "",
  sort_by: 0,
  product_id: productInfo?.id
});
// 保存默认值，后期对searchParams重新赋值
const defaultSearchParams = {
  name: "",
  create_by: [],
  staff_no: [],
  status: [],
  times: [],
  start_time: "",
  end_time: "",
  sort_name: "",
  sort_by: 0,
  product_id: productInfo?.id
};
const tableData = reactive<{ list: ProjectMembers[]; total: number }>({
  list: [],
  total: 0
});

const dialogForm: RequestParams.UpdatePlanList = reactive({
  name: "",
  start_time: "",
  end_time: "",
  remark: "",
  create_by: "",
  creator: "",
  staff_no: "",
  staff_name: "",
  product_id: null,
  id: null,
  demand_ids: []
});
const title = ref("新增计划");
// 新增、编辑计划弹窗
const dialogVisiblePlan = ref(false);

const currentActive = ref("-1");

// 计划弹窗默认选中
const defaultCheck = ref([4, 5]);
const treePlanData = ref([]);
const pageTableRef = ref<any>();
const stopAutoGetData = ref<boolean>(false);
// 分页以及获取数据
const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
  stopAutoGetData.value = flag == undefined ? false : true;
  page.value = (pagationParams && pagationParams.pageIndex) || 1;
  const { response } = useRequest(useFetchSearch, params || searchParams.value);
  const { pagation } = useRenderTable(response);
  let {
    data: { list, count }
  } = await pagation(pagationParams);
  tableData.total = count;
  tableData.list = list;
};
let timer: ReturnType<typeof setTimeout>;
const handleConditionSearch = async () => {
  if (!searchParams.value.product_id) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    if (flag.value) {
      pageTableRef.value.setCurrentPage();
      page.value = 1;
      await getData({ pageIndex: 1, pageSize: 20 }, true, searchParams.value);
      flag.value = false;
    } else {
      await getData(pageTableRef.value?.getCurrentPage(), true, searchParams.value);
    }

    stopAutoGetData.value = false;
  }, 300);
};
const getPlanList = async (params: { product_id: number; filter_type?: number; with_plan_id?: number }) => {
  const { data } = await getIterationDemand(params);
  if (data && data.length) {
    treePlanData.value = data;
  } else {
    treePlanData.value = [];
  }
};

onMounted(() => {
  handleConditionSearch();
});
// 新增、编辑成功后回调
const updatePlanData = () => {
  dialogVisiblePlan.value = false;
  getData(pageTableRef.value.getCurrentPage(), undefined, searchParams.value);
};
// 查看详情
const handleDetail = (row: any) => {
  router.push({ name: "planDetail", query: { planId: row.id } });
};
// 查看详情
// 排序
const sortChange = (e: any) => {
  const { prop, order } = e;
  if (!order) return;
  searchParams.value.sort_name = prop;
  searchParams.value.sort_by = order === "ascending" ? 1 : 2;
  getData(pageTableRef.value.getCurrentPage(), undefined, searchParams.value);
};
// 排序
// 快速查询
const quickSeacrh = (val: Record<string, any>) => {
  const productInfo = getSession("productInfo", true) as Record<string, any>;
  // 重写将默认值赋给searchParams
  searchParams.value = JSON.parse(JSON.stringify(defaultSearchParams));
  searchParams.value.product_id = productInfo.id;
  // val.key不存在代表获取所有数据
  if (val.key) {
    const obj: Record<string, any> = {
      status: ["3"],
      create_by: [userMsg?.staff_no],
      staff_no: [userMsg?.staff_no]
    };
    let params: Record<string, any> = {};
    params.product_id = searchParams.value.product_id;
    params[val.key] = obj[val.key];
    searchParams.value[val.key] = params[val.key];
  }
  flag.value = true;
  searchData();
};
// 快速查询
// 点击搜索弹框选中搜索条件查询
const changeSearch = (val: Record<string, any>) => {
  let params: Record<string, any> = JSON.parse(JSON.stringify(val));
  params.product_id = searchParams.value.product_id;
  // 遍历将值更新到searchParams
  for (var obj in val) {
    searchParams.value[obj] = val[obj];
  }
  if (searchParams.value.times && searchParams.value.times.length) {
    searchParams.value.start_time = searchParams.value.times[0];
    searchParams.value.end_time = searchParams.value.times[1];
  } else {
    searchParams.value.start_time = "";
    searchParams.value.end_time = "";
  }

  searchData();
};
const searchData = async () => {
  flag.value = true;
  handleConditionSearch();
};
// 点击搜索弹框选中搜索条件查询

// 编辑
const handleEdit = (val: Record<string, any>) => {
  const productInfo = getSession("productInfo", true) as Record<string, any>;
  const { create_by, remark, name, staff_no, creator, start_time, end_time, id, staff_name, demand_ids } = val;
  getPlanList({ product_id: productInfo?.id, with_plan_id: id });
  dialogForm.name = name;
  dialogForm.start_time = start_time;
  dialogForm.end_time = end_time;
  dialogForm.remark = remark;
  dialogForm.create_by = create_by;
  dialogForm.creator = creator;

  dialogForm.staff_no = staff_no;
  dialogForm.staff_name = staff_name;
  dialogForm.id = id;
  dialogForm.demand_ids = demand_ids;
  dialogVisiblePlan.value = true;
};
// 编辑
// 删除
const handleDelete = (val: any) => {
  ElMessageBox.confirm("此操作将永久删除，是否继续？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    confirmButtonClass: "el-button--danger-box",
    type: "warning"
  }).then(() => {
    deletePlan<ResponseParams.ResponseDataSuccess>(val.id).then(() => {
      getData(pageTableRef.value.getCurrentPage(), true, searchParams.value);
    });
  });
};
// 获取用户下拉列表
const userList = ref([]);
const basicUserList: any = ref([]);
const getUserList = (pId: number) => {
  if (!pId) return;
  allMember<ResponseParams.ResponseDataSuccess>({ product_id: pId }).then((res: any) => {
    if (res.data && res.data.length) {
      userList.value = res.data;
      basicUserList.value = res.data[1].options;
    } else {
      userList.value = [];
      basicUserList.value = [];
    }
  });
};
// 选中的需求id，这块是在需求池模块选中需求，创建计划带过来的
const planIds = ref<string[] | string>([]);
// 获取用户下拉列表
// 新增计划 p：代表从需求池跳转过来
const handleAddPlan = async (p?: string) => {
  const productInfo = getSession("productInfo", true) as Record<string, any>;
  await getPlanList({ product_id: productInfo?.id, filter_type: 1 });
  for (let i in dialogForm) {
    if (["id", "demand_ids", "staff_name", "staff_no"].includes(i)) {
      if (i === "id") dialogForm[i] = null;
      if (i === "demand_ids") dialogForm[i] = [];
      dialogForm.staff_name = userMsg?.name || "";
      dialogForm.staff_no = userMsg?.staff_no || "";
    } else {
      dialogForm[i] = "";
    }
  }
  if (p) dialogForm.demand_ids = planIds.value;
  else dialogForm.demand_ids = [];

  dialogForm.product_id = productInfo?.id;
  dialogVisiblePlan.value = true;
};
// 新增计划

if (route.params.planIds && route.params.planIds.length) {
  planIds.value = route.params.planIds;
  dialogForm.demand_ids = route.params.planIds;
  handleAddPlan("planIds");
}

// 需求出表格点击跳转 id:计划id type=1 正在做的需求 type=2所有需求
const handleJumpDemand = (num: number, id: number, type: number) => {
  if (!num) return;
  const obj: any = {
    id: id,
    where: "plan",
    type: []
  };
  if (type === 1) {
    obj.type = [8];
  } else {
    obj.type = [];
  }
  currentActive.value = "-10";
  router.push({
    name: "demandPool",
    query: obj
  });
};
// 需求出表格点击跳转 id:计划id type=1 正在做的需求 type=2所有需求
const planFormParams = ref();
useWatchChangeProduct(handleConditionSearch, async (newValue) => {
  if (searchParams.value.product_id != newValue) searchParams.value.product_id = 0;
  searchParams.value.product_id = newValue as number;

  await handleConditionSearch();
  getUserList(searchParams.value.product_id);
});

const searchArray: SearchArray = reactive({
  btnArray: [
    { id: "-1", label: "所有", key: "" },
    { id: "5", label: "我创建的", key: "create_by" },
    { id: "6", label: "我负责的", key: "staff_no" },
    { id: "3", label: "未完成", key: "status" }
  ],
  searchForm: [
    {
      type: "input",
      label: "名称",
      key: "name",
      val: ""
    },
    {
      type: "select",
      label: "计划状态",
      val: [],
      multiple: false,
      key: "status",
      listData: [
        {
          value: 1,
          label: "未开始"
        },
        {
          value: 2,
          label: "进行中"
        },
        {
          value: 3,
          label: "未完成"
        },
        {
          value: 4,
          label: "已完成"
        }
      ]
    },
    {
      type: "select",
      label: "创建人",
      val: [],
      key: "create_by",
      showRecord: true,
      multiple: true,
      valueKey: ["staff_no", "staff_name"],
      listData: userList
    },
    {
      type: "select",
      label: "指派给",
      val: [],
      key: "staff_no",
      showRecord: true,
      multiple: true,
      valueKey: ["staff_no", "staff_name"],
      listData: userList
    },
    {
      type: "daterange",
      label: "预计开始",
      val: [],
      key: "times",
      valueKey: []
    }
  ]
});

watch(
  () => route.query,
  (newVal) => {
    // 从需求池跳转过来
    if (newVal.where === "demand") {
      const { productId, plan_name } = route.query as Record<string, any>;
      const productInfo = getSession("productInfo", true) as Record<string, any>;
      // 重写将默认值赋给searchParams
      searchParams.value = JSON.parse(JSON.stringify(defaultSearchParams));
      searchParams.value.product_id = productInfo.id;
      searchParams.value.name = plan_name;
      currentActive.value = "-10";
      searchArray.searchForm[0].val = plan_name;
      searchData();
      // 去掉路由的参数
      router.replace({
        path: route.path,
        query: { productId, name: undefined, where: undefined }
      });
    }
    // 从工作台-仪表盘跳转过来
    if (newVal.where === "workbench") {
      const { productId, name } = route.query as Record<string, any>;
      const productInfo = getSession("productInfo", true) as Record<string, any>;
      // 重写将默认值赋给searchParams
      searchParams.value = JSON.parse(JSON.stringify(defaultSearchParams));
      searchParams.value.product_id = productInfo.id;
      searchParams.value.name = name;
      currentActive.value = "-10";
      searchArray.searchForm[0].val = name;
      searchData();
      // 去掉路由的参数
      router.replace({
        path: route.path,
        query: { productId, name: undefined, where: undefined }
      });
    }
  },
  {
    immediate: true
  }
);
</script>
<style lang="less" scoped>
.rp-plan-management {
  background-color: #fff;
  height: 100%;
  overflow: hidden;
  .app-name {
    color: @rp-color-text-link;
    &:hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
  .demand-num {
    color: @rp-color-text-link;
    &:hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
  .search-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
}

// 不要删掉，应对全屏名称的样式问题
:global(.rp-plan-management .table-column-left) {
  font-size: 14px;
}
</style>
