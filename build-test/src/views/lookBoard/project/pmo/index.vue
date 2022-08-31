<template>
  <div class="overview" id="overview">
    <page-table
      :tableData="list"
      :isFullScreen="isFullScreen"
      :tableRowClassName="tableRowClassName"
      @handlePagationChange="getData"
      :total="total"
      :currentPage="currentPage"
      @sort-change="sortChange"
      ref="pageTableRef"
    >
      <template #header>
        <div class="overview-search">
          <search-form
            ref="searchform"
            @click="onSearchFromClick"
            :searchArray="searchArray"
            @quickSeacrh="quickSeacrh"
            @changeSearch="changeSearch"
            :currentActive="currentActive"
          ></search-form>
        </div>
      </template>
      <template #main>
        <el-table-column prop="name" label="版本名称" sortable="custom" fixed="left" class-name="table-column-left" min-width="120">
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
        <el-table-column label="迭代进度" min-width="160" prop="complete_percent" sortable="custom">
          <template #default="scope">
            <span>
              {{ scope.row.complete_percent }}%(
              <span :class="[curStatus(scope.row) >= 0 ? 'percent percent-green' : 'percent percent-red']"
                >{{ curStatus(scope.row) >= 0 ? "提前" : "落后" }}{{ Math.abs(curStatus(scope.row)) }}%</span
              >)
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100" class-name="table-column-center" sortable="custom">
          <template #default="scope">
            <div :style="getTextColor(scope.row.status)">
              <span>●</span>
              &nbsp;
              <span>{{ getStatus(scope.row.status) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="node" label="节点时间" :resizable="false" min-width="330">
          <template #header>
            <div class="flex-layout">
              <iteration-tip></iteration-tip>
              <span>节点时间</span>
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
        <el-table-column label="备注" class-name="table-column-left" width="160">
          <template #default="scope">
            <span class="overview-span">{{ scope.row.warning || "无" }}</span>
          </template>
        </el-table-column>
      </template>
    </page-table>
    <FullScreen v-model:fullscreen="isFullScreen" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, toRefs, watch, onActivated } from "vue";
import useFetchSearch from "./hooks/useFetchSearch";
import { getSession, STATUS } from "@/utils";
import { searchParams as iterationId } from "@/views/iteration/useMixin";
import useGetTableData from "@/composables/useGetTableData";
import { useRouter } from "vue-router";
import IterationTip from "@/components/iteration-tip/index.vue";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import FullScreen from "@/components/fullscreen/index.vue";
import type { SearchArray } from "@/types/interface";
import { USER } from "@/store/state";
import dayjs from "dayjs";
import useCommon, { DemandItemResp } from "@/composables/useCommon";
import { store } from "@/store";
import { ElMessage } from "element-plus";
import { MutationType } from "@/store/mutation-types";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "pmo",
  components: { IterationTip, FullScreen },
  setup() {
    const isFullScreen = ref(false); // 是否全屏
    const pageTableRef = ref();
    const productId = computed(() => store.getters.productId);
    const searchParams = reactive<{
      name: string | undefined;
      status: number | number[] | undefined;
      start_time: string | undefined;
      end_time: string | undefined;
      staff_no: string | undefined;
      demand_id: string | undefined;
      month: string | undefined;
      sort_name: string | undefined;
      sort_by: number | undefined;
      product_id: number | undefined;
      page_index: number;
      page_size: number;
    }>({
      page_index: 1,
      page_size: 20,
      sort_name: undefined,
      sort_by: undefined,
      product_id: productId.value,
      month: "",
      name: "",
      status: [],
      start_time: "",
      end_time: "",
      staff_no: "",
      demand_id: ""
    });
    const route = useRoute();

    const router = useRouter();
    const user = getSession("user", true) as USER;
    const { useGetStaffList, useGetDemandList } = useCommon();
    const dataMap = new Map();

    const currentActive = ref("-1");

    // @ts-ignore
    const searchArray: SearchArray = reactive({
      btnArray: [
        { id: "-1", label: "所有", key: "all" },
        { id: "0,1,2,3,4,5,7,8", label: "未完成", key: "status" },
        { id: "6", label: "已发布", key: "status" },
        { id: "3", label: "我参与的", key: "staff_no" },
        { id: "4", label: "本月", key: "month" },
        { id: "5", label: "上月", key: "month" }
      ],
      searchForm: [
        {
          type: "input",
          label: "名称",
          key: "name",
          val: "",
          placeholder: "请输入迭代名称"
        },
        {
          type: "select",
          label: "状态",
          val: [],
          multiple: true,
          key: "status",
          valueKey: ["value", "label"],
          listData: STATUS
        },
        {
          type: "select",
          label: "成员",
          val: [],
          key: "staff_no",
          valueKey: ["staff_no", "staff_name"],
          listData: [],
          showRecord: true
        },
        {
          type: "select",
          selectType: "virtual",
          label: "关联需求",
          key: "demand_id",
          val: "",
          listData: []
        },
        {
          type: "daterange",
          label: "时间",
          val: [],
          key: "create_time",
          hasShortcuts: true,
          valueKey: []
        }
      ]
    });

    const curStatus = computed(function () {
      return function (row: any) {
        const { complete_percent, time_percent } = row;
        return complete_percent - time_percent;
      };
    });

    watch(
      () => productId.value,
      (newVal) => {
        searchParams.product_id = newVal;
        handleConditionSearch();
      }
    );

    onActivated(() => {
      if (route.params && route.params.where === "dashboard") {
        currentActive.value = "-10";
        searchArray.searchForm[1].val = [0, 1, 2, 3, 4, 5, 7, 8];
        searchArray.searchForm[2].val = user!.name;
        searchParams.staff_no = user!.staff_no;
        searchParams.product_id = 0;
        searchParams.status = [0, 1, 2, 3, 4, 5, 7, 8];
        handleConditionSearch();
      }
    });

    const tableRowClassName = ({ row }: { row: Record<string, any>; rowIndex: number }) => {
      const { status, complete_percent, time_percent } = row;
      if (status === 0) {
        // 未开始
        return "no-start";
      } else if (status === 6 || status === 7) {
        // 已完成, 已搁置
        return "has-end";
      } else if (complete_percent - time_percent < 0) {
        // 延期
        return "delay";
      }
      // 进行中
      return "to-do";
    };

    // 查询表单搜索
    const quickSeacrh = (val: Record<string, any>) => {
      Object.keys(searchParams)
        .filter((i) => !["sort_name", "sort_by", "product_id", "page_index", "page_size"].includes(i))
        .forEach((key: string) => {
          // @ts-ignore
          searchParams[key as keyof typeof searchParams] = undefined;
        });

      switch (val.key) {
        case "status":
          searchParams.status = [val.id === "2" ? Number(val.id) : val.id.split(",")?.map((i: string) => Number(i))];
          break;
        case "staff_no":
          searchParams.staff_no = user!.staff_no;
          break;
        case "month":
          if (val.id === "4") {
            // 本月
            searchParams.month = dayjs().format("YYYY-MM");
          } else {
            // 上个月
            searchParams.month = dayjs().add(-1, "month").startOf("month").format("YYYY-MM");
          }
          break;
        default:
          break;
      }
      searchParams.product_id = productId.value;
      handleConditionSearch();
    };

    const changeSearch = (val: Record<string, any>) => {
      Object.keys(searchParams)
        .filter((i) => !["sort_name", "sort_by", "product_id", "page_index", "page_size"].includes(i))
        .forEach((key: string) => {
          if (key === "start_time" && val.create_time) {
            searchParams.start_time = val.create_time[0];
          } else if (key === "end_time" && val.create_time) {
            searchParams.end_time = val.create_time[1];
          } else {
            // @ts-ignore
            searchParams[key as keyof typeof searchParams] = val[key] || undefined;
          }
        });
      searchParams.product_id = productId.value;

      handleConditionSearch();
    };

    const getStatus = (index: number) => {
      const status = STATUS.find((v) => v.value === index);
      return status?.label;
    };

    const { getData, tableData, stopAutoGetData, currentPage } = useGetTableData(useFetchSearch, searchParams);
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
        await getData({ pageSize: searchParams.page_size, pageIndex: 1 }, true, searchParams);
        stopAutoGetData.value = false;
        const contentHeight = document.getElementsByClassName("content")[0] as HTMLDivElement;
        const headerHeight = document.getElementsByClassName("search-header")[0] as HTMLDivElement;
        pageTableRef.value.height = contentHeight.offsetHeight - headerHeight.offsetHeight - 115;
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
    };
    const handleClear = () => {
      searchParams.name = "";
      handleConditionSearch();
    };
    useWatchChangeProduct(handleConditionSearch, () => {
      handleConditionSearch();
    });
    const handleShowDetail = (id: number) => {
      store.commit(MutationType.updateIterateId, id);
      store.commit(MutationType.updateCurrentIter);
      iterationId.demand = id;
      router.push({
        name: "homepage"
      });
    };
    // 排序
    const sortChange = (e: any) => {
      const { prop, order } = e;
      if (!order) return;
      searchParams.sort_name = prop;
      searchParams.sort_by = order === "ascending" ? 1 : 2;
      getData(pageTableRef.value?.getCurrentPage(), undefined, searchParams);
    };

    const handleStatus = (val: number[]) => {
      if (!val.length) {
        searchParams.status = [];
        handleConditionSearch();
      }
    };
    const getTextColor = (status: number, type = "color") => {
      const list = STATUS.find((v: { value: number; label: string }) => v.value === status);
      return {
        [type]: list?.color
      };
    };

    // 获取成员list
    const getStaffList = async () => {
      const data = await useGetStaffList({ product_id: productId.value });
      return data;
    };

    // 获取成员list
    const getDemandList = async () => {
      const data = await useGetDemandList({ product_id: productId.value });
      return data;
    };
    // 点击的时候请求需求和成员列表
    const onSearchFromClick = async () => {
      if (!dataMap.has("data" + productId.value)) {
        const staffList = await getStaffList();
        const demandList = await getDemandList();
        // 如果两个都请求成功，就赋值
        if (staffList && demandList) {
          dataMap.set("data" + productId.value, { staffList, demandList });
          // 请求成功，清空time
          dataMap.set("time", 0);
        } else if (!dataMap.get("time") || dataMap.get("time") <= 2) {
          // 如果没有请求成功需要再次请求
          let time = dataMap.get("time") || 0;
          dataMap.set("time", time ? time++ : 1);
          onSearchFromClick();
          return;
        }
      }

      if (!dataMap.get("data" + productId.value)) return ElMessage.warning("数据异常，请刷新页面");
      const { staffList, demandList } = dataMap.get("data" + productId.value);

      searchArray.searchForm[2].listData = staffList ?? [];
      searchArray.searchForm[3].listData =
        demandList?.map((item: DemandItemResp) => {
          return {
            value: item.id,
            label: item.name
          };
        }) ?? [];
    };
    return {
      stopAutoGetData,
      sortChange,
      onSearchFromClick,
      changeSearch,
      quickSeacrh,
      searchArray,
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
      tableRowClassName,
      currentActive
    };
  }
});
</script>

<style scoped lang="less">
.container {
  padding: 10px;
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
    margin-right: 5px;
    display: flex;
  }
}
.rp-progressBar {
  min-height: 90px;
}
.overview {
  position: relative;

  &-search {
    margin-bottom: 10px;
  }
}

.fullscreen-icon {
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 26px;
  color: #999;
}

:deep(.no-start) {
  background-color: #efefef;

  .el-table__cell {
    background-color: inherit;
  }
}
:deep(.has-end) {
  background: #f4faf9;
  .el-table__cell {
    background-color: inherit;
  }
}
:deep(.to-do) {
  background: #f9fbf3;
  .el-table__cell {
    background-color: inherit;
  }
}
:deep(.delay) {
  background-color: #fff6f6;
  .el-table__cell {
    background-color: inherit;
  }
}
.percent {
  // transform: scale(0.85);
  font-size: 14px;
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
    // overflow-y: scroll;
    white-space: pre-line;
  }
}
</style>
