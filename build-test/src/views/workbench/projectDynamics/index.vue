<template>
  <div class="rp-content-dynmics">
    <div class="rp-work-header">
      <search-form ref="searchform" :searchArray="searchArray" @quickSeacrh="quickSeacrh" @changeSearch="changeSearch"></search-form>
    </div>
    <div class="rp-work-content">
      <page-table
        v-if="!hasData"
        :tableData="tableData.list"
        :showHeader="false"
        @handlePagationChange="getData"
        :total="tableData.total"
        ref="pageTableRef"
        :currentPage="page"
        :stopAutoGetData="stopAutoGetData"
      >
        <template #main>
          <el-table-column prop="name" class-name="table-column-left table-title" label="名称">
            <template #default="scope">
              <div class="project-title" @click="handleBtn(scope.row)" v-html="scope.row.content"></div>
            </template>
          </el-table-column>
        </template>
      </page-table>
      <el-empty v-if="hasData" description="您未参与项目或参与的项目暂无动态" />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, reactive, nextTick, onMounted, onActivated, computed } from "vue";
import { DYNAMICS_TYPE } from "@/utils/index";
import type { ProductDynamic, ResponseDataSuccess } from "@/types/interface";
import type { SearchArray } from "@/types/interface";

import type { Pagation } from "@/composables/usePagation";
import useRenderTable from "@/composables/useRenderTable";
import useRequest from "@/composables/useRequest";
import useFetchSearch from "./composables/useFetchSearch";
import { getProductPeople } from "@/api/request-modules/workbench";
import type { PrDynamics } from "../useMixin";
import { dynamicsInterId } from "../useMixin";
import { getSession } from "@/utils";
import { USER } from "@/store/state";
import { useStore } from "@/store";

import useMessageTip from "@/composables/useMessageTip";
export default {
  name: "projectDynamics"
};
</script>

<script lang="ts" setup>
const { tipMessage } = useMessageTip();
const store = useStore();
const userMsg = getSession("user", true) as USER;
const productListArr = computed(() => store.getters.productList);
const hasData = ref(false);
// 搜索参数
const formParams = ref<ProductDynamic>({
  page_index: 1,
  page_size: 20,
  product_id: null,
  create_time: [],
  type: null,
  sort_name: "",
  sort_by: 1,
  create_by: []
});

// 备份搜索参数
const defaultFormParams: ProductDynamic = {
  page_index: 1,
  page_size: 20,
  product_id: null,
  create_time: [],
  type: null,
  sort_name: "",
  sort_by: 1,
  create_by: []
};
const page = ref(1);

onActivated(() => {
  handleConditionSearch();
  getPeople();
});
// 列表数据
const tableData = reactive<{ list: PrDynamics[]; total: number }>({
  list: [],
  total: 0
});
const pageTableRef = ref<any>();
const stopAutoGetData = ref<boolean>(false);
const employeeLists: any = ref([]);
// 分页以及获取数据
const getData = async (pagationParams?: Pagation, flag?: boolean, params?: any) => {
  stopAutoGetData.value = flag == undefined ? false : true;
  page.value = (pagationParams && pagationParams.pageIndex) || 1;
  const { response } = useRequest(useFetchSearch, params || formParams.value);
  const { pagation } = useRenderTable(response);
  let {
    data: { list, count }
  } = await pagation(pagationParams);
  tableData.total = count;
  tableData.list = list;
  hasData.value = false;
  if (!count) {
    hasData.value = true;
  }
};
let timer: ReturnType<typeof setTimeout>;
const handleConditionSearch = async () => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    pageTableRef.value.setCurrentPage();
    page.value = 1;
    await getData({ pageIndex: 1, pageSize: 20 }, true, formParams.value);

    stopAutoGetData.value = false;
  }, 500);
};

// 获取创建人
const getPeople = async () => {
  const peopleData: ResponseDataSuccess = await getProductPeople();
  employeeLists.value = peopleData.data;
};

const searchArray: SearchArray = reactive({
  btnArray: [
    { id: "-1", label: "所有", key: "all" },
    { id: "1", label: "项目", key: "type" },
    { id: "3", label: "需求", key: "type" },
    { id: "2", label: "迭代", key: "type" },
    { id: "5", label: "任务", key: "type" },
    { id: "6", label: "缺陷", key: "type" },
    { id: userMsg?.staff_no, label: "我操作的", key: "create_by" }
  ],
  searchForm: [
    {
      type: "select",
      label: "项目",
      val: [],
      key: "product_id",
      valueKey: ["id", "name"],
      listData: productListArr
    },
    {
      type: "select",
      label: "类别",
      val: [],
      key: "type",
      valueKey: ["value", "label"],
      listData: DYNAMICS_TYPE
    },
    {
      type: "select",
      label: "操作人",
      val: [],
      showRecord: true,
      key: "create_by",
      valueKey: ["staff_no", "staff_name"],
      listData: employeeLists
    },
    {
      type: "daterange",
      label: "操作时间",
      val: [],
      key: "create_time",
      format: "YYYY-MM-DD",
      hasShortcuts: true,
      valueKey: []
    }
  ]
});

onMounted(() => {
  nextTick(() => {
    handleConditionSearch();
    getPeople();
  });
});

// 列表跳转
const handleBtn = async (item: Record<string, any>) => {
  if (!item.is_jump) {
    return tipMessage(400, "该数据已删除，无法跳转");
  } else {
    dynamicsInterId(item);
  }
};

// 快速搜索
const quickSeacrh = (val: Record<string, any>) => {
  formParams.value = JSON.parse(JSON.stringify(defaultFormParams));

  if (val.key === "create_by") {
    formParams.value.create_by = [val.id];
  } else if (val.key === "type") {
    formParams.value.type = Number(val.id);
  }
  getData();
};

// 筛选
const changeSearch = (val: Record<string, any>) => {
  formParams.value = val;
  getData();
};
</script>

<style lang="less">
.rp-content-dynmics {
  height: calc(100% - 10px) !important;
  background: #fff;
  padding: 10px !important;
  .rp-work-header {
    display: flex;
    height: 34px;
    .icon-xiasanjiaoxing {
      float: right;
      color: #8c8b8b;
      margin-top: 9px;
      font-size: 14px;
      margin-left: 4px;
    }
    .header-form-search {
      width: 80%;
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }
  .rp-work-content {
    height: calc(100% - 45px);
    overflow: hidden;
    .container {
      padding: 0;
      height: 100% !important;
      :deep(.project-title) {
        font-size: 12px;
      }
    }
  }
}
.rp-select-work {
  .el-input {
    width: 140px;
  }

  .el-select__tags {
    max-width: 120px !important;
  }
  .el-select__tags-text {
    max-width: 50px !important;
  }
  .el-date-editor {
    width: 240px;
  }
}
</style>
<style lang="less">
.conent-msg {
  word-wrap: break-word;
  font-size: 12px;

  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
  .content-title {
    color: #3370ff;
    &:hover {
      cursor: pointer;
    }
  }
  .content-name {
    color: #000;
    font-weight: 700;
  }

  .content-status {
    font-weight: 700;
    color: #000;
  }
  .content-del {
    pointer-events: none;
  }
}
</style>
