<template>
  <div class="rp-content-dashboard">
    <div class="dashboard-head">
      <div class="head-tip">
        <h3>{{ currentDate }}，{{ user && user.name }}，欢迎使用Tomato</h3>
        <div class="tip-guide">
          <div class="guide-img">
            <img src="@/assets/use-guide-card-retina.png" alt="" />
          </div>
          <ul class="tip-guide-btn">
            <li>
              <span>新手指引：</span>
              <a target="_blank" class="table-link" href="https://tomato.petrvet.com/#/document/padIframe?5L6pZSU7g">番茄系统使用指南</a>
            </li>
            <li>
              <span>更新日志：</span>
              <a class="table-link" target="_blank" href="https://tomato.petrvet.com/#/document/padIframe?BBBhWIUng"> 番茄更新日志 </a>
            </li>
            <li>
              <span>员工须知：</span>
              <a class="table-link" target="_blank" href="https://tomato.petrvet.com/#/document/padIframe?xkmoZIU7R"> 迭代流程 <em>|</em> </a>
              <a class="table-link" target="_blank" href="https://tomato.petrvet.com/#/document/documentCenter?name=guifan"> 开发规范 </a>
            </li>
          </ul>
          <div class="dashboard-line"></div>
        </div>
      </div>
      <div class="head-work-statistics">
        <div class="work-statistics-title">剩余工作统计:</div>
        <ul class="work-statistics-list">
          <li v-for="(item, index) in statisticsWork" :key="index">
            <p>{{ item.name }}</p>
            <h3 class="statistics-num" @click="handleJump(item)">{{ item.cont }}</h3>
            <div class="work-delay" v-if="item.delay" @click="handleJump(item)">
              <span v-if="index < 2">已延期 {{ item.delay }} 个</span>
              <span v-if="index === 2">严重 {{ item.delay }} 个</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="dashboard-body">
      <div class="dashboard-body-left">
        <div class="project-dynamics">
          <div class="project-dynamics-title">
            <p>项目动态</p>
            <p style="font-size: 14px">
              <router-link style="color: #000; font-size: 12px" to="/workbench/projectDynamics">
                更多<i class="iconfont icon-shuangjiantou-you"></i>
              </router-link>
            </p>
          </div>
          <div class="project-dynamics-list">
            <ul class="project-dynamics-list" style="height: 100%" v-if="dynamicData.length">
              <li v-for="(item, index) in dynamicData" :key="index">
                <div class="project-title" @click="handleBtn(item)" v-html="item.content"></div>
              </li>
            </ul>
            <el-empty v-else description="您未参与项目或参与的项目暂无动态" />
          </div>
        </div>
      </div>
      <div class="dashboard-body-right">
        <div class="project-dynamics">
          <div class="project-dynamics-title">
            <p>工作项</p>
            <div class="project-dynamics-timer" v-if="radio === '日历'">
              <WorkCalendarTitle :workRefs="workRefs" />
            </div>
            <div class="dynamics-more">
              <el-radio-group v-model="radio" @change="handleTab">
                <el-radio label="列表">
                  <i class="iconfont icon-caidan" style="font-weight: 700"></i>
                </el-radio>
                <el-radio label="日历"><i class="iconfont icon-rili"></i></el-radio>
                <el-radio label="TODO"><i class="iconfont icon-lieshicunchu" style="font-weight: 700"></i></el-radio>
              </el-radio-group>
              <p>
                <router-link style="color: #000; font-size: 12px" to="/workbench/workItem"> 更多<i class="iconfont icon-shuangjiantou-you"></i> </router-link>
              </p>
            </div>
          </div>
          <div class="project-dynamics-list" v-if="radio === '列表'">
            <div class="dynamics-list-msg" v-for="(item, index) in workList" :key="index">
              <span class="project-status" :style="statusType(item.type, 1)">{{ statusType(item.type, 0) }}</span>
              <span class="project-title" :style="{ color: item.status === 3 ? 'rgb(160, 160, 160)' : '#333' }" @click="handleWorkBtn(item)">{{
                item.name
              }}</span>
              <span class="project-time 111" :style="stypeStatus(item)">
                {{ dayjs(item.start_time).format("YYYY-MM-DD HH:mm") }}
                {{ item.end_time ? "- " + dayjs(item.end_time).format("YYYY-MM-DD HH:mm") : "" }}
              </span>
            </div>
          </div>
          <div class="project-dynamics-list" v-if="radio === '日历'">
            <Work ref="workRefs" />
          </div>
          <div class="project-dynamics-list" v-if="radio === 'TODO'">
            <todoList :formParams="formParams" :defaultMenu="radio" />
          </div>
        </div>
      </div>
    </div>

    <HandleWaitDialog :personInfo="curInfo" @handleItem="handleItem" :item="tipsItem" @show="onShow" @updateData="onUpdateData" v-model:visible="visible" />
    <CalendarSlotTips :personInfo="curInfo" @handleItem="handleItem" :item="tipsItem" :type="4" @updateData="onUpdateData" v-model:tipsVisible="tipsVisible" />
    <HandlePerson @submit="onSubmit" v-model:visible="personVisible" :item="curInfo.abeyancenEditItem" />
  </div>
</template>

<script lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch, defineEmits, onActivated } from "vue";
import Work from "../work/index.vue";
import { setSession, getSession } from "@/utils";
import { WORK_TYPE } from "@/utils/index";
import { getDashboardList, getWorkTeam, getProductDynamic } from "@/api/request-modules/workbench";
import todoList from "../workItem/components/todoList.vue";
import { useStore } from "@/store/index";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { dynamicsInterId, updateInterId } from "../useMixin";
import type { WORKLIST, PrDynamics } from "../useMixin";
import CalendarSlotTips from "../work/calendar-slot-dialog.vue";
import HandleWaitDialog from "../work/handle-wait-dialog.vue";
import HandlePerson from "@/components/handle-person/handle-person.vue";
import VueEvent from "@/utils/mitt";
import useDashboard from "@/composables/useDashboard";
import WorkCalendarTitle from "./components/calendar-title.vue";
import useMessageTip from "@/composables/useMessageTip";
import type { BackLogItemInter, BugItemInter, CalendarItemInter, IterationItemInter, TaskItemInter } from "@/composables/useDashboard";

export default {
  name: "dashboard"
};
</script>

<script lang="ts" setup>
import type { WorkItemForm, ResponseDataSuccess } from "@/types/interface";
const router = useRouter();
const emit = defineEmits(["updateData"]);
const { tipMessage } = useMessageTip();
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
const visible = ref(false);
const personVisible = ref(false);
const radio = ref<null | string | Record<string, any>>("日历");

const { getters } = useStore();
// 获取用户信息
const user = computed(() => getters.user);
// 搜索参数
const formParams: WorkItemForm = reactive({
  page_index: 1,
  page_size: 30,
  name: "",
  times: [],
  end_time: "",
  start_time: "",
  type: null,
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
const currentDate = computed(() => {
  const timeRang: Record<string, any> = {
    早上好: { min: 5, max: 12 },
    中午好: { min: 12, max: 14 },
    下午好: { min: 14, max: 18 },
    晚上好: [
      { min: 0, max: 5 },
      { min: 18, max: 25 }
    ]
  };
  const date = +new Date().getHours();
  function getText() {
    for (let key in timeRang) {
      if (Array.isArray(timeRang[key])) {
        for (let i = 0; i < timeRang[key].length; i++) {
          if (isRang(timeRang[key][i])) {
            return key;
          }
        }
      } else {
        if (isRang(timeRang[key])) {
          return key;
        }
      }
    }
  }
  function isRang(rule: Record<string, any>) {
    if (date >= rule.min && date < rule.max) {
      return true;
    }
  }
  return getText();
});

watch(
  () => radio.value,
  (newVal) => {
    if (newVal === "日历") nextTick(() => handleTimer(""));
  }
);
onMounted(() => {
  // 工作项视图菜单默认展示
  radio.value = getSession("dashboardDefauldTab") ? getSession("dashboardDefauldTab") : "日历";
  getDashboardData();
});

const onUpdateData = () => {
  emit("updateData");
  tipsVisible.value = false;
  getDashboardData();
};

// 处理待办
const handleItem = async (item: CalendarItemInter) => {
  visible.value = true;
};

const onShow = (show: boolean) => {
  personVisible.value = show;
};

const onSubmit = (info: { department: number[]; team_worker: string[]; selectPerson: string[] }) => {
  const { department, team_worker, selectPerson } = info;
  curInfo.department = department as any;
  curInfo.team_worker = team_worker as any;
  curInfo.selectPerson = selectPerson as any;
};

// 剩余工作统计跳转
const handleJump = (val: Record<string, any>) => {
  if (val.type) {
    router.push({
      name: "workItem",
      query: {
        type: val.type
      }
    });
  } else {
    // 将事件传递到 layout/header/index.vue  调用事件
    VueEvent.emit("tomsg", "消息弹框弹出");
  }
};

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
    updateInterId(item);
  }
};

// 项目动态列表跳转 is_jump=2代表登录信息
const handleBtn = async (item: Record<string, any>) => {
  if (item.is_jump === 2) return;
  if (!item.is_jump) {
    return tipMessage(400, "该数据已删除，无法跳转");
  } else {
    dynamicsInterId(item);
  }
};

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

const handleTab = (val: string) => {
  if (val === "列表") getDashboardData();
  setSession("dashboardDefauldTab", val);
};

onActivated(() => {
  getDashboardData();
});
</script>

<style lang="less">
.rp-content-dashboard {
  height: calc(100% - -10px) !important;
  overflow: hidden;
  .table-link {
    &:hover {
      text-decoration: underline;
    }
  }
  .dashboard-head {
    display: flex;
    justify-content: space-around;
    width: 100%;
    height: 180px;
    overflow: hidden;
    .head-tip {
      width: calc(40% - 10px);
      background: #fff;
      border-radius: 8px;
      padding: 10px;
      padding-right: 0;
      font-weight: 700;
      // border-right: 2px dashed #ccc;
      h3 {
        margin: 10px;
        color: @rp-color-text-title;
      }
      .tip-guide {
        display: flex;
        justify-content: space-around;
        .guide-img {
          width: 40%;
          img {
            width: 80%;
            height: 110px;
            margin-left: 10%;
          }
        }
        ul.tip-guide-btn {
          width: 60%;

          li {
            margin: 10px 0;
            font-size: 14px;
            list-style: disc;
            em {
              font-style: normal;
              display: inline-block;
              color: @rp-color-text-title;
            }

            span:first-child {
              color: @rp-color-text-title;
            }
          }
        }
      }
      .dashboard-line {
        float: right;
        height: 130px;
        margin-top: -30px;
        border-right: 2px dashed #d3d0d0;
      }
    }

    .head-work-statistics {
      width: calc(60% - 20px);
      border-radius: 8px;
      background: #fff;
      padding: 10px;
      .work-statistics-title {
        font-size: 12px;
      }
      .work-statistics-list {
        display: flex;
        li {
          width: 20%;
          text-align: center;
          h3 {
            color: @rp-color-text-title;
            font-size: 30px;
            margin-top: 18px;
            margin-bottom: 0px;
          }
          h3.statistics-num {
            &:hover {
              cursor: pointer;
              text-decoration: underline;
            }
          }
          p {
            font-size: 14px;
            margin-bottom: 0;
            margin-top: 26px;
          }
          .work-delay {
            display: inline;
            color: @rp-color-danger;
            font-size: 12px;
            padding: 2px 6px;
            border: 1px solid @rp-color-danger;
            border-radius: 4px;
            &:hover {
              cursor: pointer;
            }
          }
        }
      }
    }
  }
  .dashboard-body {
    margin-top: 6px;
    height: calc(100% - 186px);
    display: flex;
    justify-content: space-around;
    .icon-shuangjiantou-you {
      font-size: 20px;
      float: right;
      margin-top: 1px;
      margin-right: 3px;
      width: 16px;
    }
    .dashboard-body-left {
      width: calc(40% - 25px);
      border-radius: 8px;
      padding: 10px;
      background: #fff;

      .project-dynamics {
        height: 100%;
        .project-dynamics-title {
          display: flex;
          justify-content: space-between;
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
        }
        ::-webkit-scrollbar {
          display: none; /* Chrome Safari */
        }
      }
    }
    .dashboard-body-right {
      width: calc(60% - 25px);
      border-radius: 8px;
      padding: 10px;
      background: #fff;
      .project-dynamics {
        height: 100%;
        .project-dynamics-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 30px;
          .dynamics-more {
            display: flex;
            align-items: center;
            .el-radio-group {
              .el-radio {
                margin: 0;
              }
              span.el-radio__input {
                display: none;
              }
            }
            p {
              font-size: 14px;
              margin-left: 10px;
            }
          }
        }
        .project-dynamics-list {
          height: calc(100% - 20px);
          overflow: hidden;
          overflow-y: scroll;

          .dynamics-list-msg {
            font-size: 13px;
            padding: 0 10px;

            height: 40px;
            line-height: 40px;
            border-top: 1px solid #eee;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
              overflow: hidden;
              font-size: 14px;
              color: #333;
              &:hover {
                text-decoration: underline;
                cursor: pointer;
              }
            }
          }
        }
        ::-webkit-scrollbar {
          display: none; /* Chrome Safari */
        }
      }
    }
  }
}
.conent-msg {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  }
}
</style>
