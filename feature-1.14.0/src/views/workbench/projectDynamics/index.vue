<template>
  <div class="rp-content-dynmics">
    <div class="rp-work-header">
      <el-form :inline="true" :model="formParams" class="header-form-search">
        <el-form-item label="项目" class="rp-select-work">
          <el-select v-model="formParams.product_id" filterable placeholder="--所有--" @change="handleSlectProject" clearable>
            <el-option v-for="item in productLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类别" class="rp-select-work">
          <el-select v-model="formParams.type" placeholder="--所有--" @change="handleType" clearable>
            <el-option v-for="item in DYNAMICS_TYPE" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="rp-select-work" label="操作人">
          <el-select @change="setFiled" v-model="formParams.create_by" value-key="staff_no" filterable placeholder="请选择" clearable collapse-tags>
            <el-option-group v-for="group in employeeLists" :key="group.staff_no" :label="group.label">
              <el-option v-for="item in group.options" :key="item.staff_no" :label="item.staff_name" :value="item.staff_name"></el-option>
            </el-option-group>
          </el-select>
        </el-form-item>

        <el-form-item label="时间" class="rp-select-work" prop="create_time">
          <el-date-picker
            v-model="formParams.create_time"
            @change="handleEndTime"
            type="daterange"
            value-format="YYYY-MM-DD"
            end-placeholder="请选择日期"
            start-placeholder="请选择日期"
          ></el-date-picker>
        </el-form-item>
      </el-form>
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
import { ref, reactive, nextTick, onMounted, onActivated } from "vue";
import { DYNAMICS_TYPE } from "@/utils/index";
import type { ProductDynamic, ResponseDataSuccess } from "@/types/interface";

import type { Pagation } from "@/composables/usePagation";
import useRenderTable from "@/composables/useRenderTable";
import useRequest from "@/composables/useRequest";
import useFetchSearch from "./composables/useFetchSearch";
import { replaceProductId } from "@/views/iteration/useMixin";
import { getProductPeople } from "@/api/request-modules/workbench";
import type { PrDynamics } from "../useMixin";
import { dynamicsInterId } from "../useMixin";
import useMessageTip from "@/composables/useMessageTip";
export default {
  name: "projectDynamics"
};
</script>

<script lang="ts" setup>
const { tipMessage } = useMessageTip();
const { productLists } = replaceProductId();
const hasData = ref(false);
// 搜索参数
const formParams: ProductDynamic = reactive({
  page_index: 1,
  page_size: 20,
  product_id: null,
  create_time: [],
  type: null,
  sort_name: "",
  sort_by: 1,
  create_by: []
});
const page = ref(1);

onActivated(() => {
  handleConditionSearch();
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

  const { response } = useRequest(useFetchSearch, params || formParams);
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
    await getData({ pageIndex: 1, pageSize: 20 }, true, formParams);
    getPeople();
    stopAutoGetData.value = false;
  }, 500);
};
// 获取创建人
const getPeople = async () => {
  const peopleData: ResponseDataSuccess = await getProductPeople();
  employeeLists.value = peopleData.data;
};
const setFiled = (staff: any) => {
  if (!staff) {
    formParams.create_by = [];
    formParams.create_by_no = [];
  } else {
    const list: Record<string, any> = employeeLists.value[1];
    list.options.forEach((item: any) => {
      if (staff === item.staff_name) {
        formParams.create_by_no = [item.staff_no];
      }
    });
  }
  handleConditionSearch();
};

onMounted(() => {
  nextTick(() => {
    handleConditionSearch();
  });
});
// 类别事件
const handleType = (val: any) => {
  handleConditionSearch();
};
// 项目下拉事件
const handleSlectProject = (val: any) => {
  handleConditionSearch();
};
// 时间选择时间
const handleEndTime = (val: string[]) => {
  console.log(val);
  if (!val) {
    formParams.create_time = [];
  }
  handleConditionSearch();
};

// 列表跳转
const handleBtn = async (item: Record<string, any>) => {
  if (!item.is_jump) {
    return tipMessage(400, "该数据已删除，无法跳转");
  } else {
    dynamicsInterId(item);
  }
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
    margin-top: 10px;
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
