<template>
  <div class="rp-test-overflow">
    <page-table :tableData="list" @handlePagationChange="getData" :total="total" ref="pageTableRef">
      <template #header>
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="版本名称">
            <el-input
              v-model="searchParams.name"
              :currentPage="currentPage"
              @clear="handleClear"
              @keyup.enter="handleConditionSearch"
              placeholder="请输入版本名称"
              clearable
            ></el-input>
          </el-form-item>
          <!-- <el-form-item label="所属项目">
            <el-select v-model="searchParams.product_id" placeholder="请选择" clearable>
              <el-option v-for="item in productLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="状态">
            <el-select
              v-model="searchParams.status"
              @change="handleStatus"
              placeholder="请选择"
              clearable
              multiple
              collapse-tags
              @visible-change="handleConditionSearch"
              @remove-tag="handleConditionSearch"
            >
              <el-option v-for="item in TEST_OVERVIEW_STATUS" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item>
            <el-button type="primary" @click="handleConditionSearch">搜 索</el-button>
          </el-form-item> -->
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="product_name" label="所属项目" min-width="120" class-name="table-column-center"> </el-table-column>
        <el-table-column prop="name" class-name="table-column-left" min-width="120" label="版本名称">
          <template #default="scoped">
            <span class="app-name" @click="handleDetail(scoped.row.id)">{{ scoped.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="apply_test_times" label="提测次数" width="80">
          <template #default="scoped">
            <span :style="{ color: scoped.row.apply_test_times > 1 ? 'red' : '' }">{{ scoped.row.apply_test_times }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="bug_num" label="bug数" width="80"></el-table-column>
        <el-table-column prop="serious_num" label="严重bug数" width="100"></el-table-column>
        <el-table-column prop="reopen_times" label="重开bug数" width="100"></el-table-column>
        <el-table-column prop="test_finished_time" width="150" label="封测时间"></el-table-column>
        <el-table-column prop="apply_test_days" label="测试天数" width="80"></el-table-column>
        <el-table-column prop="node" label="时间节点" min-width="550">
          <template #default="scope">
            <div style="padding-top: 10px; padding-left: 30px">
              <progress-bar :isShowStart="false" :status="scope.row.stage" :dataTime="progressNode(scope.row)" class="progress-padding"></progress-bar>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="remark" min-width="150" class-name="table-column-left" label="备注"> </el-table-column>
        <el-table-column label="操作" class-name="table-column-center">
          <template #default="scope">
            <el-button type="text" @click="handleShowDetail(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <!-- 更改状态弹框 -->
    <el-dialog title="测试备注" v-model="statusModal" width="30%" center>
      <el-form class="rp-dialog-remark">
        <el-form-item prop="remark">
          <el-input rows="8" show-word-limit placeholder="请输入备注" type="textarea" v-model="temp_rowData.remark" maxlength="100"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleConfirmChange">保 存</el-button>
          <el-button @click="statusModal = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from "vue";
import useFetchSearch from "./hooks/useFetchSearch";
import { TEST_OVERVIEW_STATUS } from "@/utils";
import { ResponseParams } from "@/types/response";
import useGetTableData from "@/composables/useGetTableData";
import { updateTestRemark } from "@/api/request-modules/iteration";
import useMessageTip from "@/composables/useMessageTip";
import { useRouter } from "vue-router";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
export default defineComponent({
  name: "testOverview",
  setup() {
    const pageTableRef = ref();
    const searchParams = reactive({
      status: [],
      product_id: null as string | null,
      name: ""
    });
    const { tipMessage } = useMessageTip();
    const getStatus = (index: number) => {
      const status = TEST_OVERVIEW_STATUS.find((v) => v.value === index);
      return status?.label;
    };
    const { getData, tableData, stopAutoGetData, currentPage } = useGetTableData(useFetchSearch, searchParams);
    // getData();
    let timer: ReturnType<typeof setTimeout>;
    const handleConditionSearch = async (isHiddenSelect?: boolean) => {
      if (isHiddenSelect === true) {
        return;
      }
      // 去除空格
      if (searchParams.name) searchParams.name = searchParams.name.replace(/\s*/g, "");
      if (!searchParams.product_id) return;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        // 获取当前page_size，如果有缓存，不设置，没有缓存默认第一页
        await getData(pageTableRef.value.getCurrentPage(), true, searchParams);
        stopAutoGetData.value = false;
        const contentHeight = document.getElementsByClassName("content")[0] as HTMLDivElement;
        const headerHeight = document.getElementsByClassName("search-header")[0] as HTMLDivElement;
        pageTableRef.value.height = contentHeight.offsetHeight - headerHeight.offsetHeight - 130;
      }, 300);
    };
    const progressNode = (row: Record<string, any>) => {
      let createTime = row.create_time ? row.create_time : "";
      return [
        {
          time: createTime,
          realTime: createTime
        },
        {
          time: row.dev_time,
          realTime: row.real_dev_time
        },
        {
          time: row.union_time,
          realTime: row.real_union_time
        },
        {
          time: row.test_time,
          realTime: row.real_test_time
        },
        {
          time: row.release_time,
          realTime: row.real_release_time
        }
      ];
    };
    const router = useRouter();
    // 版本名称点击
    const handleDetail = (id: number) => {
      router.push({
        name: "statistics",
        query: { id }
      });
    };
    const statusModal = ref(false);

    let temp_rowData = reactive({
      iteration_id: 0,
      remark: ""
    });
    const handleShowDetail = (row: Record<string, any>) => {
      temp_rowData.iteration_id = row.id;
      temp_rowData.remark = row.remark;
      statusModal.value = true;
    };
    // 弹窗点击确定
    const handleConfirmChange = () => {
      updateTestRemark<ResponseParams.ResponseDataSuccess>(temp_rowData).then((res) => {
        tipMessage(res.code);
        getData(pageTableRef.value.getCurrentPage());
        statusModal.value = false;
      });
    };
    const handleStatus = (val: number[]) => {
      if (!val.length) {
        searchParams.status = [];
        handleConditionSearch();
      }
    };

    const handleClear = () => {
      searchParams.name = "";
      handleConditionSearch();
    };
    useWatchChangeProduct(handleConditionSearch, (newValue) => {
      searchParams.product_id = newValue as string;
      handleConditionSearch();
    });
    // const { productLists } = replaceProductId();
    return {
      getStatus,
      getData,
      handleShowDetail,
      progressNode,
      // productLists,
      handleConditionSearch,
      TEST_OVERVIEW_STATUS,
      ...toRefs(tableData),
      searchParams,
      pageTableRef,
      statusModal,
      handleConfirmChange,
      temp_rowData,
      handleDetail,
      handleStatus,
      handleClear,
      currentPage
    };
  }
});
</script>

<style scoped lang="less">
.status-enabled {
  color: rgb(108, 188, 1);
}
.app-name {
  color: @rp-color-text-link;
  &:hover {
    cursor: pointer;
  }
}
:deep(.page) {
  bottom: 22px;
}
.dialog-footer {
  margin-top: -26px;
  display: inline-block;
}
</style>
