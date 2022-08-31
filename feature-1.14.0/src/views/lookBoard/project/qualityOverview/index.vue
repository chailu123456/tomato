<template>
  <div class="overview" id="overview">
    <page-table
      :tableData="tableData.list"
      :hiddenPagation="page"
      @sort-change="sortChange"
      :tableRowClassName="tableRowClassName"
      @handlePagationChange="getData"
      :total="tableData.total"
      :currentPage="currentPage"
      :pageSize="20"
      className="quality-table"
      ref="pageTableRef"
      :isFullScreen="isFullScreen"
    >
      <template v-if="head" #header>
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="项目">
            <el-select
              @change="handleConditionSearch"
              clearable
              style="width: 200px"
              value-key="id"
              v-model="searchParams.product_id"
              filterable
              placeholder="请选择"
            >
              <el-option v-for="item in productLists" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="迭代名称">
            <el-input
              v-model.trim.lazy="searchParams.name"
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
          <el-form-item label="时间" class="rp-select-workItem" prop="end_time">
            <el-date-picker
              v-model="searchParams.times"
              @change="handleEndTime"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="至"
              unlink-panels
              end-placeholder="请选择日期"
              start-placeholder="请选择日期"
              :shortcuts="shortcuts"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </template>
      <template #main>
        <el-table-column prop="version_name" sortable="custom" label="迭代版本号 - 名称" fixed="left" class-name="table-column-left" min-width="130">
          <template #default="scope">
            <span class="version__color" @click="handleShowDetail(scope.row)">{{ scope.row.version_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" sortable="custom" label="状态" min-width="60" class-name="table-column-center">
          <template #default="scope">
            <div :style="getTextColor(scope.row.status)">
              <span style="display: inline-block; margin-right: 2px">●</span>
              <span>{{ getStatus(scope.row.status) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="进度" prop="complete_percent" sortable="custom" width="140">
          <template #default="scope">
            <span style="font-size: 14px">
              {{ scope.row.complete_percent }}%(
              <span :class="[curStatus(scope.row) >= 0 ? 'percent percent-green' : 'percent percent-red']"
                >{{ curStatus(scope.row) >= 0 ? "提前" : "落后" }}{{ Math.abs(curStatus(scope.row)) }}%</span
              >)
            </span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="task_hours" min-width="90" label="任务总工时">
          <template #default="scope">
            <span class="overview-span">{{ scope.row.task_hours }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="task_precision_rate" min-width="110" label="任务准点率">
          <template #header>
            <div class="flex-layout" style="display: inline-block; margin: 0 4px 0 0">
              <iteration-tip :type="2"></iteration-tip>
              <span>任务准点率</span>
            </div>
          </template>
          <template #default="scope">
            <span class="overview-span">{{ scope.row.task_precision_rate }}%</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="task_average_hour" min-width="90" label="任务平均工时">
          <template #default="scope">
            <span class="overview-span">{{ scope.row.task_average_hour }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="apply_rejected_num" min-width="80" label="提测驳回数">
          <template #default="scope">
            <span class="overview-span">{{ scope.row.apply_rejected_num }}</span>
          </template>
        </el-table-column>

        <el-table-column sortable="custom" prop="bug_num" min-width="60" label="BUG数">
          <template #default="scope">
            <span class="overview-span">{{ scope.row.bug_num }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="defect_density" min-width="95" label="缺陷密度">
          <template #header>
            <div class="flex-layout" style="">
              <iteration-tip :type="3"></iteration-tip>
              <span>缺陷密度</span>
            </div>
          </template>
          <template #default="scope">
            <span class="overview-span">{{ scope.row.defect_density }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="real_dev_time" label="迭代节点" :resizable="false" width="320">
          <template #header>
            <div class="flex-layout" style="display: inline-block; margin: 0 4px 0 0">
              <iteration-tip></iteration-tip>
              <span>迭代节点</span>
            </div>
          </template>
          <template #default="scope">
            <div>
              <progress-bar :isShowStart="false" :status="scope.row.stage" :dataTime="progressNode(scope.row)" class="progress-padding"></progress-bar>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="scoped">
            <el-button type="text" @click="handleLookReport(scoped.row)">内容周报</el-button>
            <el-button type="text" @click="handleLookPeople(scoped.row)">查看成员</el-button>
          </template>
        </el-table-column>
      </template>
      <template #qucikSelect>
        <div class="rp-test-list-num">
          <span class="rp-test-num"
            >共 {{ tableData.allData.count }}个，其中 已发布 {{ tableData.allData.released_num }}个，进行中 {{ tableData.allData.doing_num }}个，延期
            {{ tableData.allData.delay_num }}个，总任务工时 {{ tableData.allData.total_task_hours }}h，迭代准点率
            {{ tableData.allData.iteration_precision_rate }}%，缺陷密度 {{ tableData.allData.defect_density }}</span
          >
        </div>
      </template>
    </page-table>
    <div class="table-show-msg" v-if="!head">
      <div class="quality-table-page" v-if="Math.ceil(tableData.allData.count / 5)">
        <i @click="changePage('prev')" class="iconfont icon-arrowup"></i>
        <span class="calendar-title__text">{{ showCurrentPage }} / {{ Math.ceil(tableData.allData.count / 5) }}</span>
        <i @click="changePage('next')" class="iconfont icon-arrowdown"></i>
      </div>
      <span style="font-size: 12px" class="rp-test-num"
        >本月共迭代 <i style="color: rgb(230, 162, 60)"> {{ tableData.allData.count }}个</i>，其中<i style="color: rgb(31, 159, 133)"
          >已发布 {{ tableData.allData.released_num }}个 </i
        >， <i style="color: #7fad0a"> 进行中 {{ tableData.allData.doing_num }}个</i>，<i style="color: #ff4c4b">延期 {{ tableData.allData.delay_num }}个</i
        >，<i style="color: rgb(230, 162, 60)"
          >总任务工时 {{ tableData.allData.total_task_hours }}h，任务平均工时 {{ tableData.allData.avg_task_hours }}h，迭代准点率
          {{ tableData.allData.iteration_precision_rate }}%，缺陷密度 {{ tableData.allData.defect_density }}</i
        ></span
      >
    </div>
    <FullScreen v-if="head" v-model:fullscreen="isFullScreen" />

    <ReportContent v-model:visible="isOpen" :iteration="currentIteration" v-if="isOpen"></ReportContent>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch, onMounted, nextTick } from "vue";
import useFetchSearch from "./hooks/useFetchSearch";
import { STATUS } from "@/utils";
import useGetTableData from "@/composables/useGetTableData";
import { useRouter, useRoute } from "vue-router";
import IterationTip from "@/components/iteration-tip/index.vue";
import { replaceProductId } from "@/views/iteration/useMixin";
import ReportContent from "./components/reportContent.vue";
import { updateInterId } from "@/views/workbench/useMixin";
import FullScreen from "@/components/fullscreen/index.vue";
import dayjs from "dayjs";
import useBoardBase from "@/composables/useBoardBase";

interface SearchParams {
  name: string;
  status: string[];
  times: string[];
  product_id: null | number;
  end_time: string;
  start_time: string;
  sort_name: string;
  sort_by: number;
  page_size: number;
  page_index: number;
  month: string;
}

export default defineComponent({
  name: "qualityOverview",
  components: { IterationTip, ReportContent, FullScreen },
  props: {
    // head判断是否显示搜索条件，分页
    head: {
      type: Boolean,
      default: () => true
    },
    page: {
      type: Boolean,
      default: () => false
    },
    searchCriteria: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    const { productLists } = replaceProductId();
    const isOpen = ref(false);
    const isFullScreen = ref(false);

    const pageTableRef = ref();

    const showCurrentPage = ref(1);

    const searchParams: SearchParams = reactive({
      name: "",
      status: [],
      times: [],
      product_id: null,
      end_time: "",
      start_time: "",
      sort_name: "",
      sort_by: 0,
      page_size: 10,
      page_index: 1,
      month: ""
    });
    const router = useRouter();
    const route = useRoute();
    const shortcuts = reactive([
      {
        text: "最近一周",
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
          console.log(start);
          return [start, end];
        }
      },
      {
        text: "最近一个月",
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
          return [start, end];
        }
      },
      {
        text: "最近三个月",
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
          return [start, end];
        }
      }
    ]);

    const { disabledDate } = useBoardBase();

    onMounted(() => {
      const { product_id = "", month = "" } = route.query as Record<string, any>;
      if (month) {
        searchParams.start_time = dayjs(month).startOf("month").format("YYYY-MM-DD");
        searchParams.end_time = dayjs(month).endOf("month").format("YYYY-MM-DD");
        searchParams.product_id = product_id ? parseInt(product_id) : null;
        searchParams.times = [searchParams.start_time, searchParams.end_time];
      }
      getData();
    });
    // 进度判断落后还是提前
    const curStatus = computed(function () {
      return function (row: Record<string, any>) {
        const { complete_percent, time_percent } = row;
        return complete_percent - time_percent;
      };
    });
    // 表格行颜色设置  迭代状态：0待开始，1设计中，2开发中，3联调中，4测试中，5待发版，6已发版，7已搁置，8待测试
    const tableRowClassName = ({ row }: { row: Record<string, any>; rowIndex: number }) => {
      // 延期
      if (row.is_delay) {
        if (row.status !== 6 && row.status !== 7) return "is-delay";
      }

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
      pageTableRef.value?.setCurrentPage();
      currentPage.value = 1;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        // 获取当前page_size，如果有缓存，不设置，没有缓存默认第一页
        await getData({ pageIndex: 1, pageSize: 20 }, true, searchParams);
        stopAutoGetData.value = false;
      }, 600);
    };
    nextTick(() => {
      const contentHeight = document.getElementsByClassName("content")[0] as HTMLDivElement;
      const headerHeight = document.getElementsByClassName("search-header")[0] as HTMLDivElement;
      pageTableRef.value.height = contentHeight.offsetHeight - headerHeight.offsetHeight - 130;
    });
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
    const handleShowDetail = (val: Record<string, any>) => {
      updateInterId(val, "homepage");
    };
    // 查看成员  在月度总览模块传月份，质量概览不需要
    const handleLookPeople = (val: Record<string, any>) => {
      const { href } = router.resolve({
        path: "/lookBoard/personal/jobEvaluation",
        query: {
          product_id: val.product_id,
          iterationId: val.iteration_id
        }
      });
      window.open(href, "_blank");
    };
    const currentIteration = reactive<{ id: number; name: string }>({
      id: 0,
      name: ""
    });
    // 查看周报
    const handleLookReport = (val: Record<string, any>) => {
      isOpen.value = true;
      currentIteration.id = val.iteration_id;
      currentIteration.name = val.version_name;
    };
    const handleStatus = (val: number[]) => {
      if (!val.length) {
        searchParams.status = [];
        handleConditionSearch();
      }
    };
    // 时间选择时间
    const handleEndTime = (val: string[]) => {
      if (val && val.length) {
        searchParams.start_time = val[0];
        searchParams.end_time = val[1];
      } else {
        searchParams.start_time = "";
        searchParams.end_time = "";
      }
      handleConditionSearch();
    };

    // 监听项目id
    watch(
      () => props.searchCriteria,
      (newValue) => {
        if (newValue && newValue.product_id) {
          searchParams.month = newValue.month;
          searchParams.product_id = newValue.product_id;
          searchParams.page_index = 1;
          searchParams.page_size = 5;
          showCurrentPage.value = 1;
          handleConditionSearch();
          setTimeout(() => {
            emit("count", tableData.total);
          }, 1000);
        }
      },
      {
        deep: true,
        immediate: true
      }
    );
    watch(
      () => searchParams.name,
      () => {
        handleConditionSearch();
      }
    );

    // 分页
    const changePage = (cur: "prev" | "next") => {
      if (cur === "prev") {
        if (showCurrentPage.value === 1) return;
        --showCurrentPage.value;
      } else {
        if (showCurrentPage.value === Math.ceil(tableData.allData.count / 5)) return;
        ++showCurrentPage.value;
      }
      searchParams.page_index = showCurrentPage.value;
      handleConditionSearch();
    };

    // 排序
    const sortChange = (e: any) => {
      const { prop, order } = e;
      if (!order) return;
      searchParams.sort_name = prop;
      searchParams.sort_by = order === "ascending" ? 1 : 2;
      getData(pageTableRef.value.getCurrentPage(), undefined, searchParams);
    };

    const getTextColor = (status: number) => {
      const list = STATUS.find((v: { value: number; label: string }) => v.value === status);
      return {
        color: list?.color
      };
    };

    return {
      disabledDate,
      curStatus,
      isFullScreen,
      getTextColor,
      getStatus,
      getData,
      handleShowDetail,
      progressNode,
      handleConditionSearch,
      STATUS,
      tableData,
      searchParams,
      pageTableRef,
      handleClear,
      handleStatus,
      tableRowClassName,
      productLists,
      handleEndTime,
      handleLookReport,
      isOpen,
      handleLookPeople,
      currentIteration,
      sortChange,
      shortcuts,
      changePage,
      currentPage,
      showCurrentPage
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
:deep(.fullscreen-ele-global) {
  .el-table {
    font-size: 13px;
  }
}
:deep(.page) {
  bottom: 22px;
  .el-pagination__total {
    display: none !important;
  }
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
  display: inline-block;
  position: relative;
  margin: 0 4px 0 0;
  div {
    vertical-align: middle;
    margin-left: 10px;
    margin-right: 3px;
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
  background: #efefef;
  .el-table-fixed-column--left {
    background: #efefef;
  }
}
:deep(.is-delay) {
  background: #fff6f6;
  .el-table-fixed-column--left {
    background: #fff6f6;
  }
}
:deep(.has-end) {
  background: #f4faf9;
  .el-table-fixed-column--left {
    background: #f4faf9;
  }
}
:deep(.to-do) {
  background: #f9fbf3;
  .el-table-fixed-column--left {
    background: #f9fbf3;
  }
}
.percent {
  display: inline-block;
  &-green {
    color: #49b513;
  }
  &-red {
    font-size: 12px;
    color: red;
  }
}
:deep(.el-date-editor) {
  width: 240px;
}
.overview {
  &-span {
    display: inline-block;
    max-height: 400px;
    overflow-y: scroll;
    white-space: pre-line;
  }

  .table-show-msg {
    height: 40px;
    line-height: 40px;
    overflow: hidden;
    .quality-table-page {
      margin: 0 10px;
      line-height: 39px;
      i {
        cursor: pointer;
        font-size: 13px;
        &:hover {
          color: #222;
        }
      }
      span {
        padding: 0 10px;
        color: #222;
        font-size: 12px;
      }
    }
    .rp-test-num {
      float: right;
      margin-right: 10px;
    }
    .quality-table-page {
      display: inline-block;
      float: right;
    }
  }
}
.rp-test-list-num {
  float: left;
  span.rp-test-num {
    display: inline-block;
    padding: 0px 6px;
    font-size: 13px;
    margin: 0 6px;
    // background: #c4efe6;
    color: #606266;
    border-radius: 4px;
    font-weight: 500;
    &:hover {
      cursor: pointer;
      color: #3f3f40;
    }
  }
  :deep(.el-pagination__total) {
    display: inline-block;
    background: #f4f4f5;
    padding: 2px 6px;
    line-height: 20px;
    height: 20px;
    margin-top: 4px;
    border-radius: 4px;
    box-sizing: none;
  }
}
</style>

<style lang="less">
.overview {
  .mian {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  th .cell {
    padding: 0 0 0 6px !important;
  }
}
</style>
