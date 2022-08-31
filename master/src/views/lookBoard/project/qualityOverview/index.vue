<template>
  <div class="overview" id="overview" :class="{ 'table-auto-height': Object.keys(searchCriteria).length }">
    <page-table
      :tableData="tableData.list"
      :hiddenPagation="page"
      @sort-change="sortChange"
      :tableRowClassName="tableRowClassName"
      @handlePagationChange="pageGetData"
      :total="tableData.total"
      :currentPage="currentPage"
      :pageSize="20"
      className="quality-table"
      ref="pageTableRef"
      :isFullScreen="isFullScreen"
    >
      <template v-if="head" #header>
        <div class="search-header">
          <search-form
            :searchArray="searchArray"
            ref="taskFormParams"
            :currentActive="currentActive"
            @quickSeacrh="quickSeacrh"
            @changeSearch="changeSearch"
          ></search-form>
        </div>
      </template>
      <template #main>
        <el-table-column prop="product_name" fixed="left" sortable="custom" label="项目"></el-table-column>
        <el-table-column
          prop="version_name"
          sortable="custom"
          label="迭代版本号 - 名称"
          fixed="left"
          class-name="table-column-left table-column-left1"
          min-width="140"
        >
          <template #default="scope">
            <span class="version__color" @click="handleShowDetail(scope.row)">{{ scope.row.version_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" sortable="custom" label="状态" min-width="70" class-name="table-column-center">
          <template #default="scope">
            <div :style="getTextColor(scope.row.status)">
              <span style="display: inline-block; margin-right: 2px">●</span>
              <span>{{ getStatus(scope.row.status) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="进度" prop="complete_percent" sortable="custom" min-width="140">
          <template #default="scope">
            <span>
              {{ scope.row.complete_percent }}%(
              <span v-if="scope.row.dev_time" :class="[curStatus(scope.row) >= 0 ? 'percent percent-green' : 'percent percent-red']"
                >{{ curStatus(scope.row) >= 0 ? "提前" : "落后" }}{{ Math.abs(curStatus(scope.row)) }}%</span
              >
              <span v-else class="percent percent-red"> 待排期 </span>
              )
            </span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="task_hours" min-width="100" label="任务总工时">
          <template #default="scope">
            <span class="overview-span">{{ scope.row.task_hours }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="task_precision_rate" min-width="130" label="任务准点率">
          <template #header>
            <div class="flex-layout" style="display: inline-block; margin: 0 4px 0 0">
              <iteration-tip :type="2"></iteration-tip>
              <span>任务准点率</span>
            </div>
          </template>
          <template #default="scope">
            <span class="overview-span">{{ scope.row.task_hours ? scope.row.task_precision_rate + "%" : "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="task_average_hour" min-width="110" label="任务平均工时">
          <template #default="scope">
            <span class="overview-span">{{ scope.row.task_average_hour }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="apply_rejected_num" min-width="100" label="提测次数">
          <template #default="scope">
            <span class="overview-span">{{ scope.row.apply_rejected_num }}</span>
          </template>
        </el-table-column>

        <el-table-column sortable="custom" prop="bug_num" min-width="80" label="BUG数">
          <template #default="scope">
            <span class="overview-span">{{ scope.row.bug_num }}</span>
          </template>
        </el-table-column>
        <el-table-column sortable="custom" prop="defect_density" min-width="120" label="缺陷密度">
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
            <el-button type="primary" link @click="handleLookReport(scoped.row)">内容周报</el-button>
            <el-button type="primary" link @click="handleLookPeople(scoped.row)">查看成员</el-button>
          </template>
        </el-table-column>
      </template>
      <template #qucikSelect>
        <div class="rp-test-list-num">
          <span class="rp-test-num"
            >共 {{ tableData.allData.count }}个，其中 已发布 {{ tableData.allData.released_num }}个，进行中 {{ tableData.allData.doing_num }}个，延期
            {{ tableData.allData.delay_num }}个，迭代准点率 {{ tableData.allData.iteration_precision_rate }}%，缺陷密度
            {{ tableData.allData.defect_density }}</span
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
          >迭代准点率 {{ tableData.allData.iteration_precision_rate }}%，缺陷密度 {{ tableData.allData.defect_density }}</i
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
import useBoardBase, { MultipleDemandItem, MultipleStaffItem } from "@/composables/useBoardBase";
import { SearchArray } from "@/types/interface";
import { getSession } from "@/utils";
import { USER } from "@/store/state";
// import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
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
  staff_no: string;
  demand_id: number;
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

    const user = getSession("user", true) as USER;

    const showCurrentPage = ref(1);

    const currentActive = ref("-1");

    const searchParams = ref<SearchParams | any>({
      name: "",
      status: [],
      times: [],
      product_id: [],
      end_time: "",
      start_time: "",
      sort_name: "status",
      sort_by: 1,
      page_size: 20,
      page_index: 1,
      month: "",
      staff_no: "",
      demand_id: 0
    });

    const defaultSearchParams: Record<string, any> = {
      name: "",
      status: [],
      times: [],
      product_id: [],
      end_time: "",
      start_time: "",
      sort_name: "status",
      sort_by: 1,
      page_size: 20,
      page_index: 1,
      month: "",
      staff_no: "",
      demand_id: 0
    };

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

    const { useGetMultipleProductStaffList, useInitGetProductList, boardBaseRt, disabledDate, useGetMultipleProductDemandList } = useBoardBase();

    const { getData, tableData, stopAutoGetData, currentPage } = useGetTableData(useFetchSearch, searchParams.value);
    // 监听项目集数据变化
    watch(
      () => boardBaseRt.currentProIds,
      (newVal) => {
        if (newVal && newVal.length) {
          searchParams.value.product_id = newVal;
          nextTick(() => {
            handleConditionSearch();
            getSearchData();
          });
        }
      },
      {
        deep: true,
        immediate: true
      }
    );
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
        if (row.status !== 6 && row.status !== 7 && row.status !== 0) return "is-delay";
      }

      if (row.status === 0) {
        return "no-start";
      } else if (row.status === 6 || row.status === 7) {
        return "has-end";
      }
      return "to-do";
    };
    // 指派人列表
    const employeeLists = ref<MultipleStaffItem[]>([]);
    // 需求列表
    const newDemandLists = ref<MultipleDemandItem[]>([]);
    // 获取搜索组件指派人，需求列表数据
    const getSearchData = async () => {
      if (!boardBaseRt.currentProIds.length) return;
      const data = await useGetMultipleProductStaffList({ product_id: boardBaseRt.currentProIds });

      if (data) {
        employeeLists.value = data;
        searchArray.searchForm[2].listData = data;
      }

      const data1 = await useGetMultipleProductDemandList({ product_id: boardBaseRt.currentProIds });
      if (data1) {
        newDemandLists.value = data1;
        searchArray.searchForm[3].listData = newDemandLists.value;
      }
    };

    // 设置项目集的ids
    const setIds = (currentProIds: string, currentGroupIds: string) => {
      const proIds = currentProIds?.split(",")?.map((i) => parseInt(i));
      const groupIds = currentGroupIds?.split(",")?.map((i) => parseInt(i));
      Array.isArray(proIds) && (boardBaseRt.currentProIds = proIds);
      Array.isArray(groupIds) && (boardBaseRt.currentGroupIds = groupIds);
    };

    onMounted(async () => {
      await useInitGetProductList();
      const { month = "", currentProIds, currentGroupIds } = route.query as Record<string, any>;
      if (month) {
        currentActive.value = "99";
        setIds(currentProIds, currentGroupIds);
        searchParams.value.start_time = dayjs(month).startOf("month").format("YYYY-MM-DD");
        searchParams.value.end_time = dayjs(month).endOf("month").format("YYYY-MM-DD");
        searchParams.value.times = [searchParams.value.start_time, searchParams.value.end_time];
      } else if (boardBaseRt.currentProIds.length) {
        searchParams.value.product_id = boardBaseRt.currentProIds;
      }

      if (!Object.keys(props.searchCriteria).length || month) {
        getSearchData();
      }
      getData();
    });

    const getStatus = (index: number) => {
      const status = STATUS.find((v) => v.value === index);
      return status?.label;
    };
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
        await getData({ pageIndex: 1, pageSize: 20 }, undefined, searchParams.value);
        stopAutoGetData.value = false;
      }, 600);
    };
    nextTick(() => {
      setTimeout(() => {
        const contentHeight = document.getElementsByClassName("content")[0] as HTMLDivElement;
        const headerHeight = document.getElementsByClassName("search-header")[0] as HTMLDivElement;
        pageTableRef.value.height = contentHeight.offsetHeight - headerHeight.offsetHeight - 130;
      }, 500);
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
      searchParams.value.name = "";
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
          productId: val.product_id,
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
        searchParams.value.status = [];
        handleConditionSearch();
      }
    };
    // 时间选择时间
    const handleEndTime = (val: string[]) => {
      if (val && val.length) {
        searchParams.value.start_time = val[0];
        searchParams.value.end_time = val[1];
      } else {
        searchParams.value.start_time = "";
        searchParams.value.end_time = "";
      }
      handleConditionSearch();
    };

    // 监听项目id
    watch(
      () => props.searchCriteria,
      (newValue) => {
        if (newValue && newValue.product_id?.length) {
          searchParams.value.month = newValue.month;
          searchParams.value.product_id = newValue.product_id;
          searchParams.value.page_index = 1;
          searchParams.value.page_size = 5;
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
      () => route.query,
      () => {
        const { where, productId, currentProIds, currentGroupIds } = route.query as Record<string, string>;
        if (where) {
          const proIds = currentProIds?.split(",")?.map((i) => parseInt(i));
          const groupIds = currentGroupIds?.split(",")?.map((i) => parseInt(i));
          Array.isArray(proIds) && (boardBaseRt.currentProIds = proIds);
          Array.isArray(groupIds) && (boardBaseRt.currentGroupIds = groupIds);
          currentActive.value = "99";

          setTimeout(() => {
            // 去掉路由的参数
            router.replace({
              path: route.path,
              query: { productId, where: undefined, month: undefined }
            });
          }, 700);
        }
      }
    );

    // useWatchChangeProduct(handleConditionSearch, (newValue) => {
    //   console.log(newValue, '--');

    //   searchParams.value.product_id = [newValue];
    //   defaultSearchParams.product_id = [newValue];
    //   handleConditionSearch();
    //   if (!Object.keys(props.searchCriteria).length) {
    //     getSearchData();
    //   }
    // });

    // 搜索列表数据
    const searchArray: SearchArray | Record<string, any> = reactive({
      btnArray: [
        { id: "-1", label: "所有", key: "" },
        { id: "0,1,2,3,4,5,7,8", label: "未完成", key: "status" },
        { id: "6", label: "已发布", key: "status" },
        { id: user?.staff_no, label: "我参与的", key: "staff_no" },
        { id: "99", label: "本月", key: "month" },
        { id: "999", label: "上月", key: "month" }
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
          label: "状态",
          multiple: true,
          key: "status",
          val: [],
          listData: STATUS
        },
        {
          type: "select",
          label: "成员",
          val: [],
          key: "staff_no",
          multiple: false,
          valueKey: ["staff_no", "staff_name"],
          listData: []
        },
        {
          type: "select",
          label: "关联需求",
          multiple: false,
          val: "",
          key: "demand_id",
          valueKey: ["id", "name"],
          listData: []
        },
        {
          type: "daterange",
          label: "时间",
          val: [],
          hasShortcuts: true,
          key: "times",
          valueKey: []
        }
      ]
    });

    // 快速查询
    const quickSeacrh = async (val: Record<string, any>) => {
      // 重写将默认值赋给searchParams
      defaultSearchParams.sort_by = searchParams.value.sort_by;
      defaultSearchParams.sort_name = searchParams.value.sort_name;

      searchParams.value = JSON.parse(JSON.stringify(defaultSearchParams));
      // val.key不存在代表获取所有数据
      if (val.key) {
        if (val.id === "99") {
          searchParams.value.month = dayjs().format("YYYY-MM");
        } else if (val.id === "999") {
          searchParams.value.month = dayjs().add(-1, "month").startOf("month").format("YYYY-MM");
        } else if (val.key === "status") {
          searchParams.value.status = val.id.split(",");
        } else if (val.key === "staff_no") searchParams.value.staff_no = val.id;
      }
      searchParams.value.product_id = boardBaseRt.currentProIds;
      searchData(searchParams.value);
    };
    // 点击搜索弹框选中搜索条件查询
    const changeSearch = async (val: Record<string, any>) => {
      defaultSearchParams.sort_by = searchParams.value.sort_by;
      defaultSearchParams.sort_name = searchParams.value.sort_name;
      searchParams.value = JSON.parse(JSON.stringify(defaultSearchParams));
      // // 遍历将值更新到formParams
      for (var k in val) {
        searchParams.value[k] = val[k];
      }
      if (val.times && val.times.length) {
        searchParams.value.start_time = val.times[0];
        searchParams.value.end_time = val.times[1];
      } else {
        searchParams.value.start_time = "";
        searchParams.value.end_time = "";
      }
      searchParams.value.product_id = boardBaseRt.currentProIds;
      searchData(searchParams.value);
    };

    // quick存在代表是使用快速搜索
    const searchData = async (params?: any) => {
      pageTableRef.value.setCurrentPage();

      getData(pageTableRef.value.getCurrentPage(), undefined, params);
    };

    const pageGetData = (val: { pageSize: number; pageIndex: number }) => {
      searchParams.value.page_size = val.pageSize;
      defaultSearchParams.page_size = val.pageSize;
      getData(pageTableRef.value.getCurrentPage(), undefined, searchParams.value);
    };

    // 分页
    const changePage = (cur: "prev" | "next") => {
      if (cur === "prev") {
        if (showCurrentPage.value === 1) return;
        --showCurrentPage.value;
      } else {
        if (showCurrentPage.value === Math.ceil(tableData.allData.count / 5)) return;
        ++showCurrentPage.value;
      }
      searchParams.value.page_index = showCurrentPage.value;
      handleConditionSearch();
    };

    // 排序
    const sortChange = (e: any) => {
      const { prop, order } = e;
      if (!order) return;
      searchParams.value.sort_name = prop;
      searchParams.value.sort_by = order === "ascending" ? 1 : 2;
      getData(pageTableRef.value.getCurrentPage(), undefined, searchParams.value);
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
      showCurrentPage,
      searchArray,
      currentActive,
      quickSeacrh,
      changeSearch,
      pageGetData
    };
  }
});
</script>

<style scoped lang="less">
.container {
  padding-top: 10px !important;
}
.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  margin-right: 50px;
}
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
  font-size: 14px;
  &-green {
    color: #49b513;
  }
  &-red {
    // font-size: 12px;
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
      i {
        font-style: normal;
      }
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
    i {
      font-style: normal;
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

// 不要删掉，应对全屏名称的样式问题
:global(.overview .table-column-left1) {
  font-size: 14px;
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
