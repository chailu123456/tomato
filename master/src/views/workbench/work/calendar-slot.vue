<template>
  <div class="work-calendar" :style="`height: ${calItemHeight || ''}px`">
    <div class="work-calendar">
      <div class="work-calendar__day">{{ curDay }}</div>
      <div class="work-calendar__list">
        <div
          class="work-calendar__list-span"
          :class="{ 'work-calendar__list-pass': item.status === 3 }"
          v-for="(item, index) in calendarItems?.slice(0, calendarItems.length <= calLen + 1 ? calendarItems.length : calLen)"
          :key="index"
          @click.stop="showCurTips(2, item)"
        >
          <span class="type-status-dot" :style="statusType(item.type, 1)"></span>
          {{ item.type === 1 ? `${item?.iteration_node}-${item.name}` : item.name }}
        </div>
      </div>
      <div class="work-calendar__list-cal" v-if="reminList?.length" @click.stop="showCurTips(1)">还有{{ reminList?.length }}个工作项</div>
      <div class="work-calendar__list-span" v-if="!reminList?.length && showTempDayText && data.isSelected">
        {{ tempDayText }}
      </div>
    </div>
    <HandleWaitDialog :personInfo="curInfo" :item="curInfo.abeyancenEditItem" @show="onShow" @updateData="onUpdateData" v-model:visible="visible" />
    <CalendarSlotTips
      :personInfo="curInfo"
      @handleItem="handleItem"
      :item="tipsItem"
      @updateData="onUpdateData"
      :type="curInfo.type"
      v-model:tipsVisible="tipsVisible"
    />
    <CalendarSlotTasks @lookDetail="lookDetail" @handleItem="showCurTips(2, $event)" :data="data" :list="calendarItems" v-model:tasksVisible="tasksVisible" />
    <HandlePerson @submit="onSubmit" v-model:visible="personVisible" :item="curInfo.abeyancenEditItem" />
  </div>
</template>

<script lang="ts">
import { computed, defineProps, nextTick, PropType, reactive, ref, watch, defineEmits } from "vue";
import dayjs from "dayjs";
import { WORK_TYPE } from "@/utils/index";
import HandleWaitDialog from "./handle-wait-dialog.vue";
import CalendarSlotTips from "./calendar-slot-dialog.vue";
import CalendarSlotTasks from "./calendar-slot-tasks.vue";
import HandlePerson from "@/components/handle-person/handle-person.vue";
import { CalendarInter } from "@/composables/useDashboard";
import useDashboard from "@/composables/useDashboard";
import type { BackLogItemInter, BugItemInter, CalendarItemInter, IterationItemInter, TaskItemInter } from "@/composables/useDashboard";

export default {
  name: "CalendarSlot",
  components: {
    CalendarSlotTips,
    CalendarSlotTasks,
    HandleWaitDialog,
    HandlePerson
  }
};
</script>

<script lang="ts" setup>
const emit = defineEmits(["updateData", "lookDetail"]);
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  calendarList: {
    type: Array as PropType<CalendarInter[]>,
    default: () => []
  },
  calHeight: {
    type: Number,
    default: 0
  }
});
const visible = ref(false);
const tipsVisible = ref(false);
const tempDayText = "新建待办";
const showTempDayText = ref(false);
const tasksVisible = ref(false);
const personVisible = ref(false);
const tipsItem = ref<IterationItemInter | BackLogItemInter | BugItemInter | TaskItemInter>();
const curInfo = reactive({
  department: [],
  team_worker: [],
  selectPerson: [],
  day: props.data,
  type: 0,
  fromType: "", // 哪里点击进来的
  abeyancenEditItem: {} // 待办编辑item
});
const calendarItems = ref();
const calItemHeight = ref(0);
const calLen = ref(2);

const { useGetIterationDetail, useGetBackLogDetail, useGetBugDetail, useGetTaskDetail } = useDashboard();

watch(
  () => visible.value,
  (newVal) => {
    showTempDayText.value = newVal;
  }
);

watch(
  () => props.calHeight,
  (newVal) => {
    getHeight();
  }
);

watch(
  () => props.calendarList,
  (newVal) => {
    if (newVal) nextTick(() => getCalendarItems());
    if (newVal) {
      curInfo.day = props.data;
    }
  },
  {
    deep: true,
    immediate: true
  }
);

const getHeight = () => {
  calItemHeight.value = (props.calHeight - 70) / 5;
  calItemHeight.value = calItemHeight.value < 80 ? 80 : calItemHeight.value;
  // 这里的50 是其他固定位置的高度，18是每个item的高度，因此可以得出最多显示几个item
  calLen.value = Math.floor((calItemHeight.value - 50) / 18);
};

// 当前日期
const curDay = computed(() => {
  const { day } = props.data;
  return dayjs(day).format("D");
});

const reminList = computed(() => {
  // 长度小于等于1的时候，不需要再展示剩下多少项了
  if (calendarItems.value?.length <= calLen.value + 1) return [];
  return calendarItems.value?.slice(calLen.value, calendarItems.value?.length);
});

const onShow = (show: boolean) => {
  personVisible.value = show;
};

const onSubmit = (info: { department: number[]; team_worker: string[]; selectPerson: string[] }) => {
  const { department, team_worker, selectPerson } = info;
  curInfo.department = department as any;
  curInfo.team_worker = team_worker as any;
  curInfo.selectPerson = selectPerson as any;
};

// const showDialog = () => {
//   curInfo.fromType = "calendar";
//   visible.value = !visible.value;
//   showTempDayText.value = !showTempDayText.value;
// };

const lookDetail = (item: CalendarItemInter) => {
  emit("lookDetail", item);
};

const showCurTips = async (index: number, item?: CalendarItemInter) => {
  if (index === 1) {
    tasksVisible.value = true;
  } else {
    if (!item) return;
    emit("lookDetail", item);
  }
};

const statusType = (status: number, type: number) => {
  const list: Record<string, any> | undefined = WORK_TYPE.find((v: { value: number; label: string }) => v.value === status);
  if (type) {
    return { background: list?.color };
  } else {
    return list?.label;
  }
};

// 获取详情
const getDetail = async (index: number, id: number) => {
  const arr = [useGetIterationDetail, useGetTaskDetail, useGetBugDetail];
  if (index === 3) {
    return await useGetBackLogDetail({ id, month: props.data?.day });
  }
  return await arr[index](id);
};

const getCalendarItems = () => {
  const { day } = props.data;
  if (!Array.isArray(props.calendarList)) return [];
  calendarItems.value = props.calendarList.find((i) => new Date(i.date).getTime() === new Date(day).getTime())?.list;
};

// 处理待办
const handleItem = async (item: CalendarItemInter) => {
  const data = await getDetail(item.type - 1, item.target_id);
  visible.value = true;
  if (data) {
    curInfo.abeyancenEditItem = data;
  }
};

const onUpdateData = () => {
  emit("updateData");
  tipsVisible.value = false;
  tasksVisible.value = false;
  curInfo.abeyancenEditItem = {};
};
</script>

<style lang="less" scoped>
.type-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.work-calendar {
  height: 100%;
  // padding: 3px 6px 6px;
  box-sizing: border-box;
  pointer-events: auto;

  &__day {
    padding: 4px 0px 0px 6px;
    box-sizing: border-box;
  }

  &__list {
    &-cal {
      font-size: 13px;
      margin-top: 4px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      padding: 0px 6px 0px 6px;
      box-sizing: border-box;
      &:hover {
        background-color: #f2f5f9;
      }
    }

    &-span {
      font-size: 12px;
      position: relative;
      padding: 1px 6px 1px 6px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      pointer-events: auto;
      color: #333;
      box-sizing: border-box;
      &:hover {
        background-color: #f2f5f9;
      }
      // &::before {
      //   position: absolute;
      //   content: "";
      //   left: 0;
      //   top: 50%;
      //   width: 6px;
      //   height: 6px;
      //   background-color: #1989fa;
      //   transform: translateY(-50%);
      //   border-radius: 50%;
      // }
    }

    &-pass {
      color: #999;
    }
  }
}
</style>
