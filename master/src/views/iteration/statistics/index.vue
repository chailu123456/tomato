<template>
  <div v-if="iterateId" class="statistics">
    <!--第一行-->
    <el-row :gutter="10">
      <el-col :span="12">
        <div class="board">
          <div class="board-small">
            <basic-card v-for="i in taskCardList" :key="i.key" :title="i.title" :height="125" class="board-small-card">
              <span class="count">{{ i.count }}</span>
            </basic-card>
          </div>
          <div class="board-pie">
            <basic-card title="任务状态分布图" :height="400">
              <pie-chart id="pie1" :type="0" :data="taskStatusPie"></pie-chart>
            </basic-card>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <basic-card title="开发工时燃尽图" :height="400" :tooltip="tooltip.iterationHourBurnDownLine">
          <line-chart id="line1" :type="0" :data="iterationHourBurnDownLine"></line-chart>
        </basic-card>
      </el-col>
    </el-row>
    <!--第二行-->
    <el-row :gutter="10" style="margin-top: 10px">
      <el-col :span="12">
        <basic-card title="成员开发工时数" :height="400">
          <bar-chart id="bar1" :type="0" :data="staffHourBar"></bar-chart>
        </basic-card>
      </el-col>
      <el-col :span="12">
        <basic-card title="成员开发工时燃尽图" :height="400" :tooltip="tooltip.staffHourBurnDownLine">
          <line-chart id="line2" :type="1" :data="staffHourBurnDownLine"></line-chart>
        </basic-card>
      </el-col>
    </el-row>
    <!--第三行-->
    <el-row :gutter="10" style="margin-top: 10px">
      <el-col :span="12">
        <div class="board">
          <div class="board-small">
            <basic-card
              v-for="i in bugCardList"
              :key="i.key"
              :title="i.title"
              :tooltip="i.key === 1 ? tooltip.unSolvedBug : i.key === 2 ? tooltip.checkBug : ''"
              :height="125"
              class="board-small-card"
            >
              <span class="count">{{ i.count }}</span>
            </basic-card>
          </div>
          <div class="board-pie">
            <basic-card title="BUG状态分布图" :height="400">
              <pie-chart id="pie2" :type="1" :data="bugStatusPie"></pie-chart>
            </basic-card>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <basic-card title="BUG燃尽图" :height="400" :tooltip="tooltip.iterationBugCountBurnDownLine">
          <line-chart id="line3" :type="2" :data="iterationBugCountBurnDownLine"></line-chart>
        </basic-card>
      </el-col>
    </el-row>
    <!--第四行-->
    <el-row :gutter="10" style="margin-top: 10px">
      <el-col :span="12">
        <basic-card title="成员BUG数" :height="400">
          <bar-chart id="bar2" :type="2" :data="staffBugCountBar"></bar-chart>
        </basic-card>
      </el-col>
      <el-col :span="12">
        <basic-card title="成员BUG响应/存活时长" :height="400" :tooltip="tooltip.staffBugTimeDurationBar">
          <bar-chart id="bar3" :type="1" :data="staffBugTimeDurationBar"></bar-chart>
        </basic-card>
      </el-col>
    </el-row>
  </div>
  <div v-else class="empty-block">
    <el-empty></el-empty>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, Ref, watch } from "vue";
import barChart from "./components/barChart.vue";
import pieChart from "./components/pieChart.vue";
import basicCard from "./components/basicCard.vue";
import lineChart from "./components/lineChart.vue";
import getChartData from "./hooks/getChartData";
import { searchParams } from "../useMixin";
import { store } from "@/store";
interface boardTypeParams {
  key: number;
  title: string;
  count: number;
}
interface pieParams {
  value: number;
  name: string;
}
interface lineParams {
  xName: string;
  yName: string;
  xData: Array<string>;
  list: Array<{ label: string; data: [] }>;
}
interface barParams {
  xName: string;
  yName: string;
  xData: Array<string>;
  list: Array<{ label: string; data: [] }>;
}
export default defineComponent({
  components: {
    barChart,
    pieChart,
    basicCard,
    lineChart
  },
  setup() {
    const tooltip = reactive({
      iterationHourBurnDownLine: [
        { title: "工时燃尽图", content: "迭代周期内，每天剩余未完成的任务工时曲线" },
        {
          title: "计划曲线",
          content: "当前迭代开始时包含的所有任务工时，在开发周期内平均分布所呈现的曲线;即：当天剩余工时\n = 总工时 / 迭代周期天数 * 迭代剩余天数"
        },
        {
          title: "实际曲线",
          content: "当前迭代实际每天剩余未完成的任务工时曲线；即：当天剩余工时 = 所有任务的未完成工时之和"
        }
      ],
      iterationBugCountBurnDownLine: [
        {
          title: "剩余BUG数",
          content: "即未关闭BUG数，指当前迭代中，状态为待解决、进行中、重新打开、不予处理、已解决的BUG数之和"
        }
      ],
      staffHourBurnDownLine: [
        {
          title: "成员开发工时燃尽图",
          content: "迭代周期内，开发成员每天剩余未完成的开发任务工时曲线；\n即员工当天剩余工时 = 指派给当前员工的所有开发任务的未完成工时之和"
        }
      ],
      staffBugTimeDurationBar: [
        { title: "BUG存活时长", content: "BUG从创建到状态变更为已关闭或延期处理所消耗的时间" },
        { title: "BUG响应时长", content: "BUG从创建到第一次状态变更所消耗的时间" }
      ],
      unSolvedBug: [{ title: "未解决BUG数", content: "当前迭代中，状态为待解决、进行中、重新打开的BUG数之和" }],
      checkBug: [{ title: "待验证BUG数", content: "当前迭代中，状态为已解决、不予处理的BUG数之和" }]
    });
    const taskCardList: Array<boardTypeParams> = reactive([
      { key: 0, title: "迭代成员 (个)", count: 0 },
      { key: 1, title: "任务总工时 (h)", count: 0 },
      { key: 2, title: "迭代任务数 (个)", count: 0 }
    ]);
    const bugCardList: Array<boardTypeParams> = reactive([
      { key: 0, title: "迭代BUG数 (个)", count: 0 },
      { key: 1, title: "未解决BUG数 (个)", count: 0 },
      { key: 2, title: "待验证BUG数 (个)", count: 0 }
    ]);
    // bug状态分布饼图
    let bugStatusPie = ref([]) as Ref<Array<pieParams>>;
    // 任务状态分布饼图
    let taskStatusPie = ref([]) as Ref<Array<pieParams>>;
    // 成员开发工时燃尽图
    let staffHourBurnDownLine: lineParams = reactive({ xName: "", yName: "", xData: [], list: [] });
    // 工时燃尽图
    let iterationHourBurnDownLine: lineParams = reactive({ xName: "", yName: "", xData: [], list: [] });
    // bug燃尽图
    let iterationBugCountBurnDownLine: lineParams = reactive({ xName: "", yName: "", xData: [], list: [] });
    // 成员任务工时数
    let staffHourBar: barParams = reactive({ xName: "", yName: "", xData: [], list: [] });
    // 成员bug数
    let staffBugCountBar: barParams = reactive({ xName: "", yName: "", xData: [], list: [] });
    // 成员bug响应存活时间
    let staffBugTimeDurationBar: barParams = reactive({ xName: "", yName: "", xData: [], list: [] });
    const iterateId = computed(() => store.getters.iterateId);
    const getData = async () => {
      const {
        staff_count,
        total_hour,
        total_task,
        total_bug,
        pending_fixed_bug,
        pending_verified_bug,
        bug_status_pie,
        task_status_pie,
        staff_hour_burn_down_line,
        iteration_hour_burn_down_line,
        iteration_bug_count_burn_down_line,
        staff_hour_bar,
        staff_bug_count_bar,
        staff_bug_time_duration_bar
      } = await getChartData(iterateId.value);
      // 迭代任务
      taskCardList[0].count = staff_count;
      taskCardList[1].count = total_hour;
      taskCardList[2].count = total_task;
      // 迭代bug
      bugCardList[0].count = total_bug;
      bugCardList[1].count = pending_fixed_bug;
      bugCardList[2].count = pending_verified_bug;
      // bug状态分布饼图
      bugStatusPie.value = [];
      bug_status_pie.forEach((i: { label: string; percent: number }) => {
        bugStatusPie.value.push({
          value: i.percent,
          name: i.label
        });
      });
      // 任务状态分布饼图
      taskStatusPie.value = [];
      task_status_pie.forEach((i: { label: string; percent: number }) => {
        taskStatusPie.value.push({
          value: i.percent,
          name: i.label
        });
      });
      // 迭代成员工时燃尽图
      staffHourBurnDownLine.xName = `时间  (年份:   ${staff_hour_burn_down_line.title})`;
      staffHourBurnDownLine.yName = "工时  (单位:   h)";
      staffHourBurnDownLine.xData = staff_hour_burn_down_line.category;
      staffHourBurnDownLine.list = staff_hour_burn_down_line.list;
      // 工时燃尽图
      iterationHourBurnDownLine.xName = `时间  (年份:   ${iteration_hour_burn_down_line.title})`;
      iterationHourBurnDownLine.yName = "工时  (单位:   h)";
      iterationHourBurnDownLine.xData = iteration_hour_burn_down_line.category;
      iterationHourBurnDownLine.list = iteration_hour_burn_down_line.list.reverse();
      // bug燃尽图
      iterationBugCountBurnDownLine.xName = `时间  (年份:   ${iteration_bug_count_burn_down_line.title})`;
      iterationBugCountBurnDownLine.yName = "BUG数  (单位:   个)";
      iterationBugCountBurnDownLine.xData = iteration_bug_count_burn_down_line.category;
      iterationBugCountBurnDownLine.list = iteration_bug_count_burn_down_line.list;
      // 成员任务工时数
      // staffHourBar.xName = "迭代成员";
      staffHourBar.yName = "工时数  (单位:   h)";
      staffHourBar.xData = staff_hour_bar.category;
      staffHourBar.list = staff_hour_bar.data;
      // 成员bug数
      // staffBugCountBar.xName = "迭代成员";
      staffBugCountBar.yName = "BUG数  (单位:   个)";
      staffBugCountBar.xData = staff_bug_count_bar.category;
      staffBugCountBar.list = staff_bug_count_bar.data;
      // 成员bug响应存活时间
      staffBugTimeDurationBar.xName = "";
      staffBugTimeDurationBar.yName = "时长  (单位:   h)";
      staffBugTimeDurationBar.xData = staff_bug_time_duration_bar.category;
      staffBugTimeDurationBar.list = staff_bug_time_duration_bar.data;
    };
    watch(
      () => iterateId.value,
      () => {
        if (iterateId.value) {
          getData();
        }
      }
    );
    onMounted(() => {
      if (iterateId.value) {
        getData();
      }
    });
    return {
      iterateId,
      searchParams,
      taskCardList,
      bugCardList,
      bugStatusPie,
      taskStatusPie,
      staffHourBurnDownLine,
      iterationHourBurnDownLine,
      iterationBugCountBurnDownLine,
      staffHourBar,
      staffBugCountBar,
      staffBugTimeDurationBar,
      getData,
      tooltip
    };
  }
});
</script>
<style lang="less" scoped>
.statistics {
  // padding: 16px;
  .board {
    display: flex;
    &-small {
      width: 30%;
      margin-right: 10px;
      .count {
        font-weight: 500;
        font-size: 24px;
      }
      &-card {
        margin-top: 10px;
        &:first-child {
          margin-top: 0px;
        }
      }
    }
    &-pie {
      flex: 1;
    }
  }
}
.empty-block {
  // margin-top: 15vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.content {
  background-color: #fff;
}
</style>
