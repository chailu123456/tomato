<template>
  <div class="rp-work-todo">
    <div class="todo-content" v-for="(item, index) in dataList" :key="index">
      <div class="todo-list-title" :style="{ borderColor: item.borderColor }">{{ item.titleName }}</div>
      <div class="todo-list">
        <ul v-infinite-scroll="item.event" :infinite-scroll-immediate="false" class="todo-list-content">
          <li v-for="(it, idx) in item.listData" :key="idx" class="todo-list-item" @click="handleBtn(it)">
            <span class="type-status-tag" :style="statusType(it.type, 1)">{{ statusType(it.type, 0) }}</span>
            <span class="project-title" :style="{ color: item.color }">{{ it.name }}</span>
          </li>
        </ul>
      </div>
    </div>

    <HandleWaitDialog :personInfo="curInfo" @handleItem="handleItem" :item="tipsItem" @show="onShow" @updateData="onUpdateData" v-model:visible="visible" />
    <CalendarSlotTips :personInfo="curInfo" @handleItem="handleItem" :item="tipsItem" :type="4" @updateData="onUpdateData" v-model:tipsVisible="tipsVisible" />
    <HandlePerson @submit="onSubmit" v-model:visible="personVisible" :item="curInfo.abeyancenEditItem" />
  </div>
</template>

<script lang="ts">
export default {
  name: "todoList"
};
</script>
<script lang="ts" setup>
import { reactive, ref, defineProps, watch, PropType, defineEmits } from "vue";
import type { ResponseDataSuccess, WorkItemForm } from "@/types/interface";
import { WORK_TYPE } from "@/utils/index";
import { getWorkTeamToDo } from "@/api/request-modules/workbench";
import type { TODOLIST } from "../../useMixin";
// import { updateInterId } from "../../useMixin";
import CalendarSlotTips from "../../work/calendar-slot-dialog.vue";
import HandleWaitDialog from "../../work/handle-wait-dialog.vue";
import HandlePerson from "@/components/handle-person/handle-person.vue";
import useDashboard from "@/composables/useDashboard";
import useMessageTip from "@/composables/useMessageTip";
import dayjs from "dayjs";
import VueEvent from "@/utils/mitt";

import type { BackLogItemInter, BugItemInter, CalendarItemInter, IterationItemInter, TaskItemInter } from "@/composables/useDashboard";
const emit = defineEmits(["updateData", "lookDetail"]);
const props: any = defineProps({
  formParams: {
    // @ts-ignore
    type: Object as PropType<WorkItemForm>,
    default: () => ({})
  },
  defaultMenu: {
    type: String,
    default: ""
  }
});
const { tipMessage } = useMessageTip();

const tipsVisible = ref(false);
const visible = ref(false);
const personVisible = ref(false);
const tipsItem = ref<IterationItemInter | BackLogItemInter | BugItemInter | TaskItemInter>();
const curInfo = reactive({
  department: [],
  team_worker: [],
  selectPerson: [],
  day: {},
  type: 4,
  abeyancenEditItem: {} // 待办编辑item
});

let params = JSON.parse(JSON.stringify(props.formParams));

const handleTodo = () => {
  dataList[0].page_index++;
  params.page_index = dataList[0].page_index;
  getToDoData(1);
};
const handleDoIng = () => {
  dataList[1].page_index++;
  params.page_index = dataList[1].page_index;
  getToDoData(2);
};
const handleDone = () => {
  dataList[2].page_index++;
  params.page_index = dataList[2].page_index;
  getToDoData(3);
};

const dataList: TODOLIST[] = reactive([
  {
    borderColor: "#737373",
    titleName: "todo",
    status: 1,
    color: "#333",
    event: handleTodo,
    listData: [],
    hasData: true,
    page_index: 1,
    page_size: 30
  },
  {
    borderColor: "#1f9f85",
    titleName: "doing",
    event: handleDoIng,
    status: 1,
    color: "#333",
    listData: [],
    hasData: true,
    page_index: 1,
    page_size: 30
  },
  {
    borderColor: "#999",
    titleName: "done",
    event: handleDone,
    status: 1,
    color: "#a0a0a0",
    listData: [],
    hasData: true,
    page_index: 1,
    page_size: 30
  }
]);

// 获取TODO列表数据
let timer: ReturnType<typeof setTimeout>;
// type存在说明是滑动翻页
const getToDoData = (type?: number) => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const WorkToDo: ResponseDataSuccess = await getWorkTeamToDo(params);
    if (WorkToDo.data) {
      const { doing_row, done_row, todo_row } = WorkToDo.data;
      if (type) {
        if (type === 1) {
          if (!doing_row) {
            return tipMessage(200, "到底啦~~");
          } else {
            dataList[0].listData = [...dataList[0].listData, ...doing_row];
          }
        }
        if (type === 2) {
          if (!done_row) {
            return tipMessage(200, "到底啦~~");
          } else {
            dataList[1].listData = [...dataList[1].listData, ...done_row];
          }
        }
        if (type === 3) {
          if (!todo_row) {
            return tipMessage(200, "到底啦~~");
          } else {
            dataList[2].listData = [...dataList[2].listData, ...todo_row];
          }
        }
      } else {
        dataList[0].listData = todo_row || [];
        dataList[1].listData = doing_row || [];
        dataList[2].listData = done_row || [];
      }
    } else {
      dataList[0].listData = [];
      dataList[1].listData = [];
      dataList[2].listData = [];
    }
  }, 300);
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
const { useGetBackLogDetail } = useDashboard();
// 获取待办详情
const getBackLogDetail = async (params: { id: number; month?: string }) => {
  const data = await useGetBackLogDetail(params);
  return data;
};
// 列表跳转
const handleBtn = async (item: Record<string, any>) => {
  if (item.type === 4) {
    const data = await getBackLogDetail({ id: item.target_id, month: dayjs(item.start_time).format("YYYY-MM-DD") });
    if (data) {
      curInfo.abeyancenEditItem = data;
      curInfo.day = { day: item.start_time };
      tipsItem.value = data;
      tipsVisible.value = true;
    }
  } else {
    emit("lookDetail", item);
    // updateInterId(item);
  }
};

const onUpdateData = () => {
  emit("updateData");
  tipsVisible.value = false;
  getToDoData();
};

// 监听抽屉组件状态 val 抽屉状态true：开 false: 关
VueEvent.on("drawStatus", (val) => {
  if (!val) getToDoData();
});

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

// 监听父组件formParams
watch(
  () => props.formParams,
  () => {
    params = JSON.parse(JSON.stringify(props.formParams));
    getToDoData();
  },
  { deep: true, immediate: true }
);
// 监听父组件defaultMenu
watch(
  () => props.defaultMenu,
  () => {
    params = JSON.parse(JSON.stringify(props.formParams));
    getToDoData();
  },
  { deep: true, immediate: true }
);
</script>

<style lang="less" scoped>
.rp-work-todo {
  height: 100%;
  overflow: hidden;
  display: flex;
  .todo-content {
    width: 33.333%;
    height: 100%;
    background: #fff;
    .todo-list-title {
      text-align: center;
      height: 40px;
      line-height: 40px;
      font-weight: 700;
      border-bottom: 4px solid #999;
    }
    .todo-list {
      height: calc(100% - 46px);
      .todo-list-content {
        height: 100%;
        overflow: auto;
        padding: 0;
        margin: 0;
        list-style: none;
        border-right: 1px solid #ccc;
        .todo-list-item {
          display: flex;
          align-items: center;
          min-height: 30px;
          margin: 6px;
          span:first-child {
            display: inline-block;
            width: 30px;
            text-align: center;
          }
          span:last-child {
            display: inline-block;
            font-size: 14px;
            width: calc(100% - 40px);
            color: #333;
            &:hover {
              cursor: pointer;
              text-decoration: underline;
            }
          }
        }
        .todo-list-item + .list-item {
          margin-top: 10px;
        }
      }
    }
  }
  .todo-content:nth-of-type(3) {
    .todo-list-content {
      border: none;
    }
  }
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
  color: #fff;
  margin-left: 8px;
}

.project-title {
  margin-left: 10px;
}
</style>
