<!--
 * @Author: 宋绍华
 * @Date: 2022-04-21 10:46:11
 * @LastEditTime: 2022-06-23 20:45:39
 * @LastEditors: 宋绍华
 * @Description:
 * @FilePath: \tomato-pc\src\views\lookBoard\personal\jobEvaluation\table.vue
-->
<template>
  <div class="job-table">
    <page-table
      :hiddenPagation="!hiddenPagation"
      stripe
      :pageSize="tableData.pageSize"
      @sort-change="sortChange"
      :tableData="tableData.list"
      @handlePagationChange="currentChange"
      :total="tableData.tempList.length"
      ref="pageTableRef"
      :stopAutoGetData="tableData.stopAutoGetData"
      :isFullScreen="fullscreen"
      :currentPage="tableData.currentPage"
      className="job-evaluation-table"
    >
      <template #main>
        <el-table-column label="基本信息" label-class-name="job-table-column">
          <el-table-column sortable="custom" label="姓名" prop="staff_name" min-width="60"></el-table-column>
          <el-table-column sortable="custom" label="岗位" prop="job_name" min-width="90"></el-table-column>
        </el-table-column>
        <el-table-column label="工作项（需求+任务)" label-class-name="job-table-column">
          <template #header="scope">
            <div style="display: inline-block; position: relative">
              <span>{{ scope.column.label }}</span>
              <TipsView>
                <div>
                  <span style="font-weight: bold">计划完成数：</span>
                  计划完成时间在本月的任务和需求数量；
                </div>
                <div>
                  <span style="font-weight: bold"> 实际完成数：</span>
                  实际完成时间在本月的任务和需求数量；
                </div>
                <div>
                  <span style="font-weight: bold"> 已完成计划耗时：</span>
                  即已完成的工作项计划消耗工时，本月实际完成的任务，计划消耗的工时；
                </div>
                <div>
                  <span style="font-weight: bold"> 已完成实际耗时：</span>
                  即已完成的工作项实际消耗工时，本月实际完成的任务，实际消耗的工时；
                </div>
                <div>
                  <span style="font-weight: bold"> 按时完成率：</span>
                  计划完成时间在本月1日到当日且按时完成的工作项数量/计划完成时间在本月1日到当日的工作项数量
                </div>
              </TipsView>
            </div>
          </template>
          <el-table-column sortable="custom" label="计划完成数" prop="plan_num" min-width="90"></el-table-column>
          <el-table-column sortable="custom" label="实际完成数" prop="real_num" min-width="90"></el-table-column>
          <el-table-column sortable="custom" label="已完成计划耗时" prop="plan_hours" min-width="90"></el-table-column>
          <el-table-column sortable="custom" label="已完成实际耗时" prop="real_hours" min-width="90"></el-table-column>
          <el-table-column sortable="custom" label="按时完成率" prop="on_time_rate" min-width="90">
            <template #default="scope">
              <span>{{ scope.row.on_time_rate }}%</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="缺陷" label-class-name="job-table-column">
          <template #header="scope">
            <div style="display: inline-block; position: relative">
              <span>{{ scope.column.label }}</span>
              <TipsView>
                <div>
                  <span style="font-weight: bold">缺陷密度：</span>
                  单位测试时间内，（BUG*级别）之和
                </div>
              </TipsView>
            </div>
          </template>
          <el-table-column sortable="custom" label="产生缺陷数" prop="bug_num" min-width="90"></el-table-column>
          <el-table-column sortable="custom" label="修复耗时" prop="bug_hours" min-width="90"></el-table-column>
          <el-table-column sortable="custom" label="缺陷密度" prop="bug_rate" min-width="90"></el-table-column>
          <el-table-column sortable="custom" label="提交缺陷数" prop="post_bug_num" min-width="90"></el-table-column>
          <el-table-column sortable="custom" label="提交缺陷密度" prop="post_bug_rate" min-width="100"> </el-table-column>
        </el-table-column>
        <el-table-column label="利用率">
          <template #header="scope">
            <div style="display: inline-block; position: relative">
              <span>{{ scope.column.label }}</span>
              <TipsView>
                <div>
                  <span style="font-weight: bold">利用率：</span>
                  （实际工作项耗时 + 修复缺陷耗时）/ 本月工作日工时
                </div>
              </TipsView>
            </div>
          </template>
          <el-table-column sortable="custom" label="工时利用率" prop="hours_rate" min-width="90">
            <template #default="scope">
              <span>{{ scope.row.hours_rate }}%</span>
            </template>
          </el-table-column>
        </el-table-column>
      </template>
    </page-table>

    <div class="statistics" v-if="!hiddenPagation">
      共有成员 <span>&nbsp;{{ statistic.total }}个</span>，其中产品 {{ statistic.product }}人，前端 {{ statistic.frontend }}人，后端
      {{ statistic.backend }}人，测试 {{ statistic.test }}人，其他 {{ statistic.others }}人<span></span>
      <div class="statistics-controller">
        <i @click="changePage('prev')" class="iconfont icon-arrowup"></i>
        <span class="calendar-title__text">{{ curPage }} / {{ pageTotal }}</span>
        <i @click="changePage('next')" class="iconfont icon-arrowdown"></i>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import useBoardBase, { StaffWorkQualityItems, StaffWorkQualityStatistic } from "@/composables/useBoardBase";
import { reactive, ref, defineProps, watch, nextTick, computed, defineExpose } from "vue";
import TipsView from "@/components/tips-view/index.vue";
import { customSortFunc } from "@/utils";
import VueEvent from "@/utils/mitt";
export default {
  name: "job-table"
};
</script>

<script setup lang="ts">
const props = defineProps({
  form: {
    type: Object,
    default: () => ({})
  },
  hiddenPagation: {
    type: Boolean,
    default: false
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  pageSize: {
    type: Number,
    default: 20
  }
});
const pageTableRef = ref();
// 列表数据
const tableData = reactive<{
  list: StaffWorkQualityItems[];
  tempList: StaffWorkQualityItems[];
  tempPageIndex: number;
  stopAutoGetData: boolean;
  columnList: { prop: string; label: string; sort?: boolean; width?: number; minWidth?: number }[];
  statistic: StaffWorkQualityStatistic;
  pageSize: number;
  currentPage: number;
  total: number;
}>({
  list: [],
  tempList: [],
  total: 0,
  tempPageIndex: 0,
  stopAutoGetData: false,
  pageSize: props.pageSize,
  currentPage: 1,
  columnList: [
    {
      prop: "staff_name",
      label: "姓名",
      minWidth: 60
    },
    {
      prop: "job_name",
      label: "岗位",
      minWidth: 90
    },
    {
      prop: "iteration_num",
      label: "参与迭代数",
      minWidth: 80
    },
    {
      prop: "task_completed_hours",
      label: "完成工作工时",
      minWidth: 90
    },
    {
      prop: "task_completed_num",
      label: "完成工作数",
      minWidth: 90
    },
    {
      prop: "task_on_time_rate2",
      label: "工作准点率",
      minWidth: 110
    },
    {
      prop: "task_avg_hours",
      label: "工作项平均工时",
      minWidth: 90
    },
    {
      prop: "bug_num",
      label: "产生bug数"
    },
    {
      prop: "bug_rate",
      label: "缺陷密度",
      minWidth: 110
    },
    {
      prop: "post_bug_num",
      label: "提交bug数"
    },
    {
      prop: "post_bug_rate",
      label: "提交缺陷密度",
      minWidth: 120
    }
  ],
  statistic: {
    backend: 0, // 后端成员数量
    frontend: 0, // 前端成员数量
    others: 0, // 其他人员数量
    participant: 0, // 参与成员数量
    product: 0, // 产品成员数量
    test: 0, // 测试成员数量
    total: 0 // 成员总数量
  }
});
let curPage = ref(1);
// 总的页数
const pageTotal = computed(() => {
  const { total, pageSize } = tableData;
  // 获取total，在月度总览模块监听，计算高度
  VueEvent.emit("total", total);
  if (!total || !pageSize) return 0;
  return Math.ceil(total / pageSize);
});

// 统计
const statistic = computed(() => tableData.statistic);
// 迭代参与率
// const partPecent = computed(() => {
//   const { total, participant } = tableData.statistic;
//   if (!total || !participant) return "0%";
//   // 处理精度问题
//   return (+parseFloat(String(participant / total)).toFixed(3) * 1000) / 10 + "%";
// });

watch(
  () => props.form,
  () => {
    nextTick(() => {
      curPage.value = 1;
      getData();
      pageTableRef.value?.pageTable?.clearSort();
    });
  },
  {
    immediate: true,
    deep: true
  }
);

const { useGetStaffWorkQualityList } = useBoardBase();

// 切换分页
const currentChange = (pag: { pageIndex: number; pageSize: number }) => {
  let { pageIndex, pageSize } = pag;
  if (pageSize !== tableData.pageSize) {
    tableData.currentPage = 1;
  } else {
    tableData.currentPage = pageIndex;
  }
  tableData.pageSize = pageSize;
  tableData.list = tableData.tempList.slice((tableData.currentPage - 1 || 0) * pageSize, tableData.currentPage * pageSize);
};

// 获取列表数据
const getData = async () => {
  const params = Object.assign({}, props.form);
  const data = await useGetStaffWorkQualityList(params);
  if (data && data.list) {
    tableData.tempPageIndex = 1;
    tableData.total = data.count;
    tableData.tempList = data.list?.map((i) => {
      return {
        ...i,
        task_on_time_rate2: i.task_on_time_rate ? `${i.task_on_time_rate}%` : 0
      };
    });
    tableData.list = tableData.tempList.slice(0, pageTableRef.value.pageSize);
    tableData.statistic = data.statistic;
  } else {
    tableData.list = [];
    tableData.tempList = [];
    tableData.total = 0;
  }
};

// 上下页切换
const changePage = (cur: "prev" | "next") => {
  const { pageSize } = pageTableRef.value;
  let start = 0;
  let end = 0;
  // 上一页
  if (cur === "prev") {
    if (curPage.value >= 1) {
      curPage.value > 1 && (curPage.value -= 1);
      start = curPage.value - 1;
      end = curPage.value;
    }
  } else {
    // 如果当前页码大于等于总的页码数立刻阻止执行
    if (curPage.value >= pageTotal.value) return;
    if (curPage.value < pageTotal.value) {
      curPage.value += 1;
      start = curPage.value - 1 || 0;
      end = curPage.value;
    } else if (curPage.value >= 1) {
      curPage.value -= 1;
      start = curPage.value || 0;
      end = curPage.value + 1;
    }
  }
  tableData.list = tableData.tempList.slice(start * pageSize, end * pageSize);
};

// 自定义排序
const sortChange = (column: any) => {
  const { prop, order } = column;
  tableData.currentPage = 1;
  curPage.value = 1;
  // 这里task_on_time_rate 要更换下，是task_on_time_rate2含有百分号，不好比较，因此还是需要用task_on_time_rate 纯数字来比较
  tableData.tempList = tableData.tempList.sort(customSortFunc(prop === "task_on_time_rate2" ? "task_on_time_rate" : prop, order === "ascending"));

  tableData.list = tableData.tempList.slice(0, tableData.pageSize);
};

// 对外输出
defineExpose({
  tableData
});
</script>
<style scoped lang="less">
.statistics {
  font-size: 12px;
  padding: 20px 0;
  display: flex;
  justify-content: flex-end;

  span {
    color: #ffb418;
  }

  &-controller {
    margin: 0 10px;

    i {
      cursor: pointer;
      font-size: 13px;
    }
    span {
      padding: 0 10px;
      color: #222;
    }
  }
}

:global(.statistics .el-table th > .cell) {
  padding: 0;
}

:global(.job-table .el-table--small .el-table__cell.job-table-column) {
  border-right: 1px solid var(--el-table-border-color) !important;
}

:global(.el-table thead.is-group th.el-table__cell) {
  background-color: #fff;
}
</style>
