<template>
  <el-calendar v-loading="loading" ref="calendar" class="work-calendar work-calendar-liner" id="work-calendar" v-model="calendarVal">
    <template #dateCell="{ data }">
      <CalendarSlot :calendarList="list" :calHeight="calHeight" @updateData="getList" :data="data" />
    </template>
  </el-calendar>
</template>

<script lang="ts">
import useDashboard from "@/composables/useDashboard";
import { computed, defineExpose, onMounted, defineProps, watch, nextTick, ref } from "vue";
import CalendarSlot from "./calendar-slot.vue";
import { useStore } from "@/store/index";
import { MutationType } from "@/store/mutation-types";
import dayjs from "dayjs";
import { throttle } from "lodash";

export default {
  name: "work",
  components: {
    CalendarSlot
  }
};
</script>
<script lang="ts" setup>
const props = defineProps({
  formParams: {
    type: Object,
    default: () => ({})
  }
});

type Dir = "prev-month" | "next-month";
const { calendar, calendarList, useGetCarlenderInfo } = useDashboard();
const calHeight = ref();
const calendarVal = ref("");
const store = useStore();
const markTime = ref("");
const loading = ref(false);

watch(
  () => props.formParams,
  (newVal) => {
    if (newVal) nextTick(() => getList());
  },
  {
    deep: true,
    immediate: true
  }
);

const changeMonth = (dir: Dir) => {
  calendar.value.selectDate(dir);
  store.commit(MutationType.updateCalendarDay, calendar.value.selectedDay.format("YYYY-MM"));
};

const list = computed(() => {
  return calendarList.value;
});

watch(
  () => calendarVal.value,
  (newVal, oldVal) => {
    const _newVal = new Date(dayjs(newVal).format("YYYY-MM")).getTime();
    const _oldVal = new Date(dayjs(oldVal).format("YYYY-MM")).getTime();
    const curVal = new Date(dayjs(markTime.value).format("YYYY-MM")).getTime();
    if (curVal === _newVal || _newVal === _oldVal) return;
    nextTick(async () => {
      await getList();
      store.commit(MutationType.updateCalendarDay, calendar.value.selectedDay.format("YYYY-MM"));
      markTime.value = calendar.value.selectedDay.format("YYYY-MM");
    });
  }
);

const getList = async () => {
  if (!calendar.value) return;
  loading.value = true;
  const { name, status, type } = props.formParams;
  const selectedDay = calendar.value.selectedDay;
  if (selectedDay) {
    await useGetCarlenderInfo({ month: selectedDay.format("YYYY-MM"), name, status, type });
    loading.value = false;
  }
};

defineExpose({
  changeMonth,
  curDate: () => calendar.value.selectedDay.format("YYYY-MM")
});

const removeLastDom = () => {
  const dom = document.getElementById("work-calendar");
  const domList = dom!.querySelectorAll(".el-calendar-table__row");
  if (domList.length === 6) {
    domList[5].remove();
  }
};
onMounted(() => {
  // 删除最后一行dom
  removeLastDom();
  getList();
  calendarVal.value = dayjs().format("YYYY-MM");
  calHeight.value = calendar.value?.$el.getBoundingClientRect().height;
  store.commit(MutationType.updateCalendarDay, calendarVal.value);
  markTime.value = calendarVal.value;
  window.addEventListener(
    "resize",
    throttle(() => {
      calHeight.value = calendar.value?.$el.getBoundingClientRect().height;
    }, 500),
    false
  );
});
</script>

<style lang="less">
.work-calendar {
  position: relative;
  height: 96%;

  &-liner {
    margin-top: 10px;
    border-top: 1px solid #ebeef5;
  }

  .el-calendar-day {
    padding: 0 !important;
    height: 100% !important;
  }

  .el-calendar__body {
    padding: 0;
    height: 100%;

    .el-calendar-table {
      height: 100%;
    }
  }

  .el-calendar__header {
    display: none;
  }

  .el-calendar-table:not(.is-range) td.next,
  .el-calendar-table:not(.is-range) td.prev {
    pointer-events: none;
  }
}
</style>
