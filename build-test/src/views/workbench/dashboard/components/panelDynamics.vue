<template>
  <div class="project-dynamics" :key="`panel-${type}`">
    <div class="project-dynamics-title" v-if="type === 1">
      <div class="project-dynamics-timer">
        <WorkCalendarTitle :workRefs="workRefs" />
      </div>
    </div>
    <div class="project-dynamics-list" v-if="type === 2">
      <div class="dynamics-list-msg" v-for="(item, index) in workList" :key="index">
        <span class="type-status-tag" :style="statusType(item.type, 1)">{{ statusType(item.type, 0) }}</span>
        <span class="project-title" :style="{ color: item.status === 3 ? '#a0a0a0' : '#333' }" @click="handleWorkBtn(item)">{{ item.name }}</span>
        <span class="project-time" :style="stypeStatus(item)">
          {{ dayjs(item.start_time).format("YYYY-MM-DD HH:mm") }}
          {{ item.end_time ? "- " + dayjs(item.end_time).format("YYYY-MM-DD HH:mm") : "" }}
        </span>
      </div>
    </div>
    <div class="project-dynamics-list" v-if="type === 1">
      <Work ref="workRefs" />
    </div>
    <div class="project-dynamics-list" v-if="type === 3">
      <todoList @lookDetail="lookDetail" :formParams="formParams" :defaultMenu="radio" />
    </div>
  </div>
</template>
<script lang="ts">
import dayjs from "dayjs";
import { WORK_TYPE } from "@/utils/index";
import Work from "../../work/index.vue";
import { getSession } from "@/utils";
import VueEvent from "@/utils/mitt";

import type { WORKLIST, PrDynamics } from "../../useMixin";
import useDashboard from "@/composables/useDashboard";
import todoList from "../../workItem/components/todoList.vue";
import WorkCalendarTitle from "./calendarTitle.vue";
import type { WorkItemForm, ResponseDataSuccess } from "@/types/interface";
import { getDashboardList, getWorkTeam, getProductDynamic } from "@/api/request-modules/workbench";
import { nextTick, onMounted, reactive, ref, watch, defineProps, defineEmits } from "vue";
import type { BackLogItemInter, BugItemInter, IterationItemInter, TaskItemInter } from "@/composables/useDashboard";

export default {
  name: "panelDynamics"
};
</script>
<script lang="ts" setup>
const props = defineProps({
  type: {
    type: Number,
    default: () => {
      return 2;
    }
  }
});
const emit = defineEmits(["lookDetail"]);

// 日历显示时间
const timer = ref();
const loading = ref(false);
// carlendar refs
const workRefs = ref();
const tipsItem = ref<IterationItemInter | BackLogItemInter | BugItemInter | TaskItemInter>();
const curInfo = reactive({
  department: [],
  team_worker: [],
  selectPerson: [],
  day: {},
  type: 4,
  abeyancenEditItem: {} // 待办编辑item
});
const tipsVisible = ref(false);
const radio = ref<null | string | Record<string, any>>("");

// 搜索参数
const formParams: WorkItemForm = reactive({
  page_index: 1,
  page_size: 30,
  name: "",
  times: [],
  end_time: "",
  start_time: "",
  type: [],
  sort_name: "",
  sort_by: 1
});
interface STATISTICWORK {
  name: string;
  cont: number;
  delay: number;
  type?: number;
}
// 工作统计
const statisticsWork: Array<STATISTICWORK> = reactive([
  {
    name: "进行中迭代",
    cont: 0,
    delay: 0,
    type: 1
  },
  {
    name: "任务",
    cont: 0,
    delay: 0,
    type: 2
  },
  {
    name: "BUG",
    cont: 0,
    delay: 0,
    type: 3
  },
  {
    name: "待办",
    cont: 25,
    delay: 0,
    type: 4
  },
  {
    name: "未读消息",
    cont: 0,
    delay: 0
  }
]);

// 工作项数据
const workList = ref<Array<WORKLIST>>([]);
const dynamicData = ref<Array<PrDynamics>>([]);

watch(
  () => props.type,
  (newVal) => {
    if (newVal === 1) {
      radio.value = "日历";
      nextTick(() => handleTimer(""));
    } else if (newVal === 2) {
      radio.value = "列表";
    } else if (newVal === 3) {
      radio.value = "TODO";
    }
  }
);

onMounted(() => {
  // 工作项视图菜单默认展示
  radio.value = getSession("dashboardDefauldTab") ? getSession("dashboardDefauldTab") : "日历";
  getDashboardData();
});

const { useGetBackLogDetail } = useDashboard();
// 获取待办详情
const getBackLogDetail = async (params: { id: number; month?: string }) => {
  const data = await useGetBackLogDetail(params);
  return data;
};
// 工作项列表跳转 4代表待办
const handleWorkBtn = async (item: Record<string, any>) => {
  if (item.type === 4) {
    const data = await getBackLogDetail({ id: item.target_id, month: dayjs(item.start_time).format("YYYY-MM-DD") });
    if (data) {
      curInfo.day = { day: item.start_time };
      curInfo.abeyancenEditItem = data;
      tipsItem.value = data;
      tipsVisible.value = true;
    }
  } else {
    emit("lookDetail", item);
    // updateInterId(item);
  }
};

// todo事件组件传递
const lookDetail = (val: Record<string, any>) => {
  emit("lookDetail", val);
};

// 监听抽屉组件状态 val 抽屉状态true：开 false: 关
VueEvent.on("drawStatus", (val) => {
  if (!val) getDashboardData();
});

// 获取工作项状态数据 type存在则返回颜色
const statusType = (status: number, type: number) => {
  const list: Record<string, any> | undefined = WORK_TYPE.find((v: { value: number; label: string }) => v.value === status);
  if (type) {
    return { background: list?.color };
  } else {
    return list?.label;
  }
};
// 工作项时间判断是否延迟
const stypeStatus = (it: Record<string, any>) => {
  if (it.is_delay) return { color: "#ff777e" };
  return { color: "#000" };
};

// 获取剩余工作统计数据
let times: ReturnType<typeof setTimeout>;
const getDashboardData = async () => {
  clearTimeout(times);
  loading.value = true;

  times = setTimeout(async () => {
    // 获取剩余工作统计
    const dashData: ResponseDataSuccess = await getDashboardList();
    if (dashData.data) {
      const { todo_iteration_num, delay_iteration_num, todo_bug_num, todo_task_num, serious_bug_num, delay_task_num, backlog_num, unread_message_num } =
        dashData.data;
      statisticsWork[0].cont = todo_iteration_num;
      statisticsWork[0].delay = delay_iteration_num;
      statisticsWork[1].cont = todo_task_num;
      statisticsWork[1].delay = delay_task_num;
      statisticsWork[2].cont = todo_bug_num;
      statisticsWork[2].delay = serious_bug_num;
      statisticsWork[3].cont = backlog_num;
      statisticsWork[4].cont = unread_message_num;
    }
    // 获取工作项列表
    const workFrom = JSON.parse(JSON.stringify(formParams));
    workFrom.status = [1, 2];
    const workData: ResponseDataSuccess = await getWorkTeam(workFrom);
    if (workData.data && workData.data.count) {
      workList.value = workData.data.list;
    }
    const getProductDynamicData: ResponseDataSuccess = await getProductDynamic(formParams);
    loading.value = false;
    if (getProductDynamicData.data && getProductDynamicData.data.count) {
      dynamicData.value = getProductDynamicData.data.list;
    }
  }, 300);
};

// 切换月
const handleTimer = (dir: string) => {
  if (dir === "down") {
    workRefs.value?.changeMonth("next-month");
  } else if (dir === "up") {
    workRefs.value?.changeMonth("prev-month");
  }
  timer.value = workRefs.value?.curDate();
};

onMounted(() => {
  getDashboardData();
});
</script>

<style lang="less" scoped>
.project-dynamics {
  height: 100%;
  .project-dynamics-title {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
  }
  .project-dynamics-list {
    height: calc(100% - 40px);
    overflow: hidden;
    overflow-y: scroll;
    li {
      padding: 0 10px;
      font-size: 13px;
      height: 40px;
      line-height: 40px;
      border-top: 1px solid #eee;
      overflow: hidden;
    }
    .dynamics-list-msg {
      font-size: 13px;
      padding: 0 10px;
      height: 40px;
      line-height: 40px;
      border-top: 1px solid #eee;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: flex;
      align-items: center;
      .project-status {
        font-size: 12px;
        color: #fff;
        padding: 0px 2px;
        margin-right: 10px;
        float: left;
        height: 20px;
        line-height: 20px;
        margin-top: 10px;
      }
      .type-status-tag {
        display: inline-block;
        padding: 0 7px;
        font-size: 12px;
        line-height: 18px;
        white-space: nowrap;
        border-radius: 10px;
        line-height: 18px;
        margin-right: 10px;
        float: left;
        color: #fff;
      }
      .project-time {
        float: right;
        font-size: 12px;
      }
      .project-title {
        display: inline-block;
        width: 58%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        float: left;
        font-size: 14px;
        margin-left: 10px;
        color: #333;
        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
