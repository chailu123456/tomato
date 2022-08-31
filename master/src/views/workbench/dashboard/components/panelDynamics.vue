<template>
  <div class="project-dynamics" :key="`panel-${type}`">
    <div class="project-dynamics-title" v-if="type === 1">
      <div class="project-dynamics-timer">
        <WorkCalendarTitle :workRefs="workRefs" />
      </div>
    </div>
    <!-- 列表 -->
    <div class="project-dynamics-list" v-if="type === 2">
      <template v-if="!workIsEmpty">
        <div :class="[item.id === curId ? 'active' : '', 'dynamics-list-msg']" v-for="(item, index) in workList" :key="index">
          <span class="type-status-tag" :style="statusType(item.type, 1)">{{ statusType(item.type, 0) }}</span>
          <span :class="`project-title ${item.status === 3 ? 'color2' : 'color1'}`" @click.stop="handleWorkBtn(item)">
            {{ item.name }}
          </span>
          <span class="project-time" :style="stypeStatus(item)" v-if="item.end_time">
            {{ dayjs(item.end_time).format("YYYY-MM-DD HH:mm") }}
          </span>
        </div>
      </template>
      <div v-else class="todo-empty-container"><el-empty class="todo-empty-img" style="padding: 0; margin-top: 0px" description="暂无数据" /></div>
    </div>
    <!-- 日历 -->
    <div class="project-dynamics-list" v-if="type === 1" :key="`work-calendar-${update}`">
      <WorkCalendar @lookDetail="lookDetail" ref="workRefs" />
    </div>
    <!-- TODO -->
    <div class="project-dynamics-list" v-if="type === 3" :key="`todo-list-${update}`">
      <todoList @lookDetail="lookDetail" :formParams="formParams" :defaultMenu="radio" />
    </div>
  </div>
</template>

<script lang="ts">
import dayjs from "dayjs";
import { WORK_TYPE } from "@/utils/index";
import WorkCalendar from "../../work/index.vue";
import { getSession } from "@/utils";
import VueEvent from "@/utils/mitt";
import { useRoute } from "vue-router";

import type { WORKLIST } from "../../useMixin";
import useDashboard from "@/composables/useDashboard";
import todoList from "../../workItem/components/todoList.vue";
import WorkCalendarTitle from "./calendarTitle.vue";
import type { WorkItemForm, ResponseDataSuccess } from "@/types/interface";
import { getWorkTeam } from "@/api/request-modules/workbench";
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
  },
  update: {
    type: Number,
    default: () => {
      return 0;
    }
  }
});
const emit = defineEmits(["lookDetail"]);
const route = useRoute();
// 日历显示时间
const timer = ref();
const loading = ref(false);

const curId = ref(0);

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

// 工作项数据
const workList = ref<Array<WORKLIST>>([]);
const workIsEmpty = ref(false);

watch(
  () => props.update,
  (newVal, oldVal) => {
    if (newVal && newVal != oldVal) {
      getDashboardData();
    }
  }
);

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
  radio.value = getSession("dashboardSelectTab") ? getSession("dashboardSelectTab") : "日历";
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
    curId.value = item.id;
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
  if (route.path === "/workbench/dashboard") {
    if (!val) {
      curId.value = 0;
      getDashboardData();
    }
  }
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
  if (it.is_delay) return { backgroundColor: "#ffedec" };
  return { backgroundColor: "#f0f9ea" };
};

// 获取剩余工作统计数据
let times: ReturnType<typeof setTimeout>;
const getDashboardData = async () => {
  clearTimeout(times);
  loading.value = true;
  times = setTimeout(async () => {
    // 获取工作项列表
    const workFrom = JSON.parse(JSON.stringify(formParams));
    workFrom.status = [1, 2];
    const workData: ResponseDataSuccess = await getWorkTeam(workFrom);
    if (workData.data) {
      workList.value = workData.data.list;
      workIsEmpty.value = workData.data.count === 0;
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
  .todo-empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
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
      &:hover {
        background-color: #f2f5f9;
      }
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
        font-size: 10px;
        line-height: 18px;
        white-space: nowrap;
        border-radius: 3px;
        line-height: 18px;
        margin-right: 10px;
        float: left;
        color: #fff;
      }
      .project-time {
        // width: 250px;
        // font-size: 12px;
        // text-align: right;
        // font-size: 10px;
        font-size: 10px;
        color: #666;
        padding: 0px 7px;
        height: 20px;
        line-height: 20px;
        border-radius: 10px;
        background-color: #f0f9ea;
      }
      .project-title {
        display: inline-block;
        width: calc(100% - 180px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        float: left;
        font-size: 14px;
        margin-left: 10px;
        color: #333;
        &:hover {
          cursor: pointer;
        }
      }
      .color1 {
        color: #333;
      }
      .color2 {
        color: #a0a0a0;
      }
    }
    .active {
      background-color: #ebf5f3;
    }
  }
}
</style>
