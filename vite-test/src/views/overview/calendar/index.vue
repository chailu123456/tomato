<template>
  <div class="container calendar__wrapper">
    <section class="calendar__wrapper__day">
      <div class="calendar__datepicker">
        <el-date-picker v-model="currentDate" type="month" :clearable="false"> </el-date-picker>
      </div>
      <rp-calendar :todoDay="lists" v-model="currentDate" @pick="pickDay">
        <template #dateCell="{ data }">
          <p class="calendar__datepicker__dayText">{{ data.day }}</p>
          <ul v-for="(days, index) in data.list" :key="index">
            <li v-if="index <= 4">
              <span class="calendar__datepicker__symbol">●</span>
              <span>{{ days.name }}</span>
            </li>
            <li v-else-if="index === 5">......</li>
          </ul>
        </template>
      </rp-calendar>
    </section>
    <teleport to=".layout-container" v-if="isReady">
      <div :class="[isShowSide ? 'calendar__wrapper__detail--active' : 'calendar__wrapper__detail']">
        <div style="height: 100%">
          <div class="teleport__wrapper__sideHeader">{{ currentSelectDate }}</div>
          <div class="calendar__wrapper__sideBody">
            <i class="el-icon-arrow-right" @click="closeSide"></i>
            <h3 class="title">今日所有项目迭代</h3>
            <div v-for="item in iterationLists" :key="item.id" class="calendar__wrapper__sideBody__iterationLists">
              <div class="calendar__wrapper__sideBody__imgWrapper">
                <!-- <img :src="item.imgSrc" alt="" /> -->
              </div>
              <p>{{ item.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, Ref, watch } from "vue";
import { Dayjs } from "dayjs";
import { getCalendarLists } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";

export default defineComponent({
  name: "overviewCalendar",
  setup() {
    const currentDate = ref<Date>(new Date());
    const lists = ref([]);
    const formate = (date: Date): string => {
      return `${new Date(date).getFullYear()}-${String(new Date(date).getMonth() + 1).padStart(2, "0")}`;
    };
    const searchParams = reactive({
      month: formate(currentDate.value),
      iteration_id: undefined
    });
    let isShowSide = ref<boolean>(false);
    let currentSelectDate: Ref<string> = ref("");
    const iterationLists = ref<Array<unknown>>([]);
    const pickDay = (day: Dayjs, list: Array<unknown>): void => {
      iterationLists.value = list;
      isShowSide.value = true;
      const year = day.get("year");
      const month = day.get("month") + 1;
      const date = day.get("date");
      currentSelectDate.value = `${year}.${month}.${date}`;
    };
    const closeSide = () => {
      isShowSide.value = false;
    };
    const getData = (params: typeof searchParams) => {
      getCalendarLists<ResponseParams.ResponseDataSuccess>(params).then((res) => {
        lists.value = res.data;
      });
    };
    getData(searchParams);

    watch(currentDate, (newVal, oldVal) => {
      const newValMonth = new Date(newVal).getMonth() + 1;
      const oldValMonth = new Date(oldVal).getMonth() + 1;
      if (newValMonth !== oldValMonth) {
        getData({
          month: formate(currentDate.value),
          iteration_id: undefined
        });
      }
    });
    const isReady = ref(false);
    onMounted(() => {
      isReady.value = true;
    });
    return {
      isReady,
      lists,
      currentDate,
      closeSide,
      pickDay,
      isShowSide,
      currentSelectDate,
      iterationLists,
      getData
    };
  }
});
</script>

<style scoped lang="less">
.calendar__wrapper {
  .calendar__wrapper__day {
    overflow: auto;
    width: auto;
  }
  .calendar__wrapper__detail__common {
    position: relative;
    transition: all 0.5s;
    height: 100%;
    width: 0;
  }
  ::v-global(.calendar__wrapper__detail--active) {
    .calendar__wrapper__detail__common;
    flex: 0 0 400px;
  }
  ::v-global(.calendar__wrapper__detail) {
    .calendar__wrapper__detail__common;
    flex: 0;
  }
  ::v-global(.calendar__wrapper__sideBody) {
    height: 100%;
    padding-left: 45px;
    box-sizing: border-box;
    background: url("~@/assets/openCalendarSide.png") no-repeat center;
    background-position: 0 35%;
  }
  ::v-global(.calendar__wrapper__sideBody i) {
    cursor: pointer;
    color: rgba(32, 159, 133, 1);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 10px;
    font-size: 26px;
  }
  ::v-global(.calendar__wrapper__sideBody i:hover) {
    opacity: 0.5;
  }
  ::v-global(.calendar__wrapper__sideBody h3) {
    font-size: 16px;
    font-weight: normal;
  }
  ::v-global(.calendar__wrapper__sideBody__iterationLists) {
    margin-top: 10px;
    display: flex;
    align-items: center;
  }
  :global(.calendar__wrapper__sideBody__imgWrapper) {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    overflow: hidden;
  }
  :global(.calendar__wrapper__sideBody__imgWrapper + p) {
    margin-left: 12px;
    font-size: 14px;
    color: rgba(87, 87, 87, 1);
  }
  :global(.calendar__wrapper__sideBody__imgWrapper img) {
    width: 100%;
    height: 100%;
  }
  .calendar__datepicker {
    margin-bottom: 20px;
    text-align: right;
  }
  .calendar__datepicker__dayText {
    text-align: center;
    color: #999;
  }
  .calendar__datepicker__symbol {
    font-size: 16px;
    margin-right: 10px;
    color: #999;
  }
  .calendar__datepicker__symbol + span {
    color: rgba(87, 87, 87, 1);
  }
}
</style>
