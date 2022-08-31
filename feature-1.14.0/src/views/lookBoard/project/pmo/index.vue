<template>
  <div class="overview" id="overview">
    <page-table
      :tableData="list"
      :isFullScreen="isFullScreen"
      :tableRowClassName="tableRowClassName"
      @handlePagationChange="getData"
      :total="total"
      :currentPage="currentPage"
      ref="pageTableRef"
    >
      <template #header>
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="迭代名称">
            <el-input
              v-model.trim.lazy="searchParams.name"
              @blur="handleConditionSearch"
              @clear="handleClear"
              @keyup.enter="handleConditionSearch"
              clearable
              placeholder="请输入迭代名称"
            ></el-input>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchParams.status"
              placeholder="请选择"
              @change="handleStatus"
              clearable
              multiple
              collapse-tags
              @visible-change="handleConditionSearch"
              @remove-tag="handleConditionSearch"
            >
              <el-option v-for="item in STATUS" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="name" label="版本名称" fixed="left" class-name="table-column-left" min-width="120">
          <template #default="scope">
            <span class="version__color" @click="handleShowDetail(scope.row.id)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="迭代内容" class-name="table-column-left" fixed="left" min-width="200">
          <!-- demand -->
          <template #default="scope">
            <div v-for="(item, index) in scope.row.demand" :key="index">
              <span v-if="scope.row.demand.length > 1">{{ index + 1 }}、</span>
              <span>{{ item.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成员" width="170" class-name="table-column-left">
          <template #default="scope">
            <div>产品负责人：{{ scope.row.iteration_manager.staff_name }}</div>
            <div v-if="scope.row.user_list.length">
              成员：
              <span v-for="(n, i) in scope.row.user_list" :key="i">
                {{ n.staff_name }}
                <span v-if="i !== scope.row.user_list.length - 1">，</span>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="迭代进度" width="140">
          <template #default="scope">
            <span style="font-size: 14px">
              {{ scope.row.complete_percent }}%(
              <span :class="[curStatus(scope.row) >= 0 ? 'percent percent-green' : 'percent percent-red']"
                >{{ curStatus(scope.row) >= 0 ? "提前" : "落后" }}{{ Math.abs(curStatus(scope.row)) }}%</span
              >)
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" class-name="table-column-center">
          <template #default="scope">
            <div :style="getTextColor(scope.row.status)">
              <span>●</span>
              &nbsp;
              <span>{{ getStatus(scope.row.status) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="node" label="节点时间" :resizable="false" width="320">
          <template #header>
            <div class="flex-layout">
              <span>节点时间</span>
              <iteration-tip></iteration-tip>
            </div>
          </template>
          <template #default="scope">
            <div>
              <progress-bar :isShowStart="false" :status="scope.row.stage" :dataTime="progressNode(scope.row)" class="progress-padding"></progress-bar>
            </div>
          </template>
        </el-table-column>
        <el-table-column class-name="table-column-left" prop="last_week_summary" label="上周总结" min-width="180">
          <template #default="scope">
            <span class="overview-span">{{ scope.row.last_week_summary || "无" }}</span>
          </template>
        </el-table-column>
        <el-table-column class-name="table-column-left" prop="week_plan" label="本周计划" min-width="180">
          <template #default="scope">
            <span class="overview-span">{{ scope.row.week_plan || "无" }}</span>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <FullScreen v-model:fullscreen="isFullScreen" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, toRefs } from "vue";
import useFetchSearch from "./hooks/useFetchSearch";
import { STATUS } from "@/utils";
import { searchParams as iterationId } from "@/views/iteration/useMixin";
import useGetTableData from "@/composables/useGetTableData";
import { useRouter } from "vue-router";
import IterationTip from "@/components/iteration-tip/index.vue";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import FullScreen from "@/components/fullscreen/index.vue";

export default defineComponent({
  name: "pmo",
  components: { IterationTip, FullScreen },
  setup() {
    const isFullScreen = ref(false); // 是否全屏
    const pageTableRef = ref();
    const searchParams = reactive({
      name: "",
      status: [],
      product_id: ""
    });
    const router = useRouter();
    const curStatus = computed(function () {
      return function (row: any) {
        const { complete_percent, time_percent } = row;
        return complete_percent - time_percent;
      };
    });

    const tableRowClassName = ({ row }: { row: Record<string, any>; rowIndex: number }) => {
      if (row.status === 0) {
        return "no-start";
      } else if (row.status === 6 || row.status === 7) {
        return "has-end";
      }
      return "to-do";
    };

    const getStatus = (index: number) => {
      const status = STATUS.find((v) => v.value === index);
      return status?.label;
    };
    const { getData, tableData, stopAutoGetData, currentPage } = useGetTableData(useFetchSearch, searchParams);
    // getData();
    let timer: ReturnType<typeof setTimeout>;
    const handleConditionSearch = async (isHiddenSelect?: boolean) => {
      if (isHiddenSelect === true) {
        return;
      }
      pageTableRef.value.setCurrentPage();
      currentPage.value = 1;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        // 获取当前page_size，如果有缓存，不设置，没有缓存默认第一页
        await getData({ pageIndex: 1, pageSize: 10 }, true, searchParams);
        stopAutoGetData.value = false;
        const contentHeight = document.getElementsByClassName("content")[0] as HTMLDivElement;
        const headerHeight = document.getElementsByClassName("search-header")[0] as HTMLDivElement;
        pageTableRef.value.height = contentHeight.offsetHeight - headerHeight.offsetHeight - 130;
      }, 300);
    };
    const progressNode = (row: Record<string, any>) => {
      let createTime = row.plan ? row.plan.create_time : "";
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
      // return [createTime, row.dev_time, row.union_time, row.test_time, row.release_time];
    };
    const handleClear = () => {
      searchParams.name = "";
      handleConditionSearch();
    };
    useWatchChangeProduct(handleConditionSearch, (newValue) => {
      searchParams.product_id = newValue as string;
      handleConditionSearch();
    });
    const handleShowDetail = (id: number) => {
      iterationId.demand = id;
      router.push({
        name: "homepage"
      });
    };
    const handleStatus = (val: number[]) => {
      if (!val.length) {
        searchParams.status = [];
        handleConditionSearch();
      }
    };
    const getTextColor = (status: number) => {
      const list = STATUS.find((v: { value: number; label: string }) => v.value === status);
      return {
        color: list?.color
      };
    };

    return {
      curStatus,
      isFullScreen,
      getTextColor,
      getStatus,
      getData,
      handleShowDetail,
      progressNode,
      handleConditionSearch,
      STATUS,
      ...toRefs(tableData),
      searchParams,
      pageTableRef,
      handleClear,
      handleStatus,
      currentPage,
      tableRowClassName
    };
  }
});
</script>

<style scoped lang="less">
.progress-padding {
  padding-left: 20px;
  width: 400px !important;
  transform: scale(0.7);
  margin-left: -40px;
}
.version__color {
  color: rgb(5, 77, 233);
  cursor: pointer;
}
:deep(.page) {
  bottom: 22px;
}
.status-enabled {
  color: rgb(108, 188, 1);
}
.column__lineHeight {
  p {
    line-height: 10px;
  }
}
.flex-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  div {
    margin-left: 10px;
    display: inline-block;
  }
}
.rp-progressBar {
  min-height: 90px;
}
.overview {
  position: relative;
}

.fullscreen-icon {
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 26px;
  color: #999;
}

:deep(.no-start) {
  background: #fcfaf5;
}
:deep(.has-end) {
  background: #f5f7fa;
}
:deep(.to-do) {
  background: #fffdf9;
}
.percent {
  transform: scale(0.85);
  display: inline-block;
  &-green {
    color: #49b513;
  }
  &-red {
    color: red;
  }
}

.overview {
  &-span {
    display: inline-block;
    max-height: 400px;
    overflow-y: scroll;
    white-space: pre-line;
  }
}
</style>
