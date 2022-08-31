<template>
  <div class="calendar__wrapper">
    <section class="calendar__wrapper__day" ref="calendarWrapper">
      <el-form :inline="true" :model="searchParams" class="demo-form-inline">
        <el-form-item label="迭代名称/版本号">
          <el-input @keyup.enter="handleConditionSearch" v-model="searchParams.name" placeholder="请输入迭代名称/版本号"></el-input>
        </el-form-item>
        <el-form-item label="迭代">
          <el-select
            value-key="id"
            clearable
            v-model="searchParams.iteration_id"
            filterable
            placeholder="请选择"
            multiple
            collapse-tags
            @visible-change="handleConditionSearch"
            @remove-tag="handleConditionSearch"
          >
            <el-option v-for="item in iterateList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="节点">
          <el-select @visible-change="handleConditionSearch" value-key="value" v-model="searchParams.stage" filterable placeholder="请选择">
            <el-option v-for="item in OVERVIEW_CALENDAR_STATUS" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="float: right; margin-right: 15px">
          <div class="calendar__datepicker">
            <el-date-picker v-model="currentDate" type="month" :clearable="false"> </el-date-picker>
          </div>
        </el-form-item>
      </el-form>
      <el-scrollbar class="scrollbar">
        <rp-calendar :todoDay="lists" v-model="currentDate" @pick="pickDay">
          <template #dateCell="{ data }">
            <p class="calendar__datepicker__dayText">{{ data.day.split("-")[2] }}</p>
            <ul v-for="(days, index) in data.list" :key="index" class="calendar__datepicker__descText">
              <li v-if="index <= 3">
                <el-tag :type="stageMap[days.stage].type">{{ stageMap[days.stage].name }}</el-tag>
                <span>{{ days.name }}</span>
              </li>
              <li v-else-if="index === 4">......</li>
            </ul>
          </template>
        </rp-calendar>
      </el-scrollbar>
    </section>

    <section class="calendar__wrapper__detail">
      <h4>
        迭代详情<span v-if="currentSelectDate">({{ currentSelectDate }})</span>
      </h4>
      <div v-if="!iterationLists">
        <el-empty description="暂无数据"></el-empty>
      </div>
      <el-scrollbar v-else height="calc(100% - 72px)">
        <!-- :style="{ top: -20 * (index + 1) + 'px' }" -->
        <el-card v-for="item in iterationLists" :key="item.uniqueId" class="detail__card">
          <div class="flex-layout">
            <h5>迭代名称：</h5>
            <span>{{ item.name }}</span>
          </div>
          <div class="flex-layout">
            <h5>所属项目：</h5>
            <span>{{ item.product_name }}</span>
          </div>
          <div class="flex-layout">
            <h5>当前节点：</h5>
            <!-- {{ item.stageText }} -->
            <el-button type="text" :style="{ color: item.color }"> {{ item.stageText }}</el-button>
          </div>
          <!-- <progress-bar :status="progressData.status" :dataTime="progressData.dataTime"></progress-bar> -->
          <progress-bar
            :key="item.uniqueId"
            :status="item.real_stage"
            :dataTime="item.dataTime"
            width="420px"
            class="calendar__wrapper__detail__progress"
            :isShowStart="false"
          ></progress-bar>
        </el-card>
      </el-scrollbar>
    </section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, Ref, watch } from "vue";
import dayjs, { Dayjs } from "dayjs";
import { getCalendarLists } from "@/api/request-modules/iteration";
import { ResponseParams } from "@/types/response";
import useMixin from "@/views/iteration/useMixin";
import { OVERVIEW_CALENDAR_STATUS } from "@/utils/contantOptions";
import useWatchChangeProduct from "@/composables/useWatchChangeProduct";
import { store } from "@/store";

export default defineComponent({
  name: "overviewCalendar",
  setup() {
    const currentDate = ref<Date>(new Date());
    const lists = ref([]);
    const formate = (date: Date): string => {
      return `${new Date(date).getFullYear()}-${String(new Date(date).getMonth() + 1).padStart(2, "0")}`;
    };
    const searchParams = reactive({
      month: formate(currentDate.value as Date),
      name: "",
      stage: -1,
      iteration_id: [],
      product_id: null as number | null
    });
    const calendarWrapper = ref();
    const stageMap: Record<number, Record<string, any>> = {
      0: {
        name: "未开始",
        type: "info",
        color: "#999999"
      },
      1: {
        name: "开发",
        type: "success",
        color: "rgb(73, 181, 19)"
      },
      2: {
        name: "联调",
        type: "success",
        color: "rgb(73, 181, 19)"
      },
      3: {
        name: "测试",
        type: "",
        color: "rgb(31, 159, 133)"
      },
      4: {
        name: "发布",
        type: "warning",
        color: "rgb(230, 162, 60)"
      }
    };
    let currentDay = new Date().toLocaleDateString();
    let currentSelectDate: Ref<string> = ref(currentDay.replace(/\//g, "."));
    const iterateList = computed(() => store.getters.iterateList);
    const { handleGetIterationList, iterateListData } = useMixin();
    handleGetIterationList();
    const iterationLists = ref<Array<unknown>>([]);
    const transformList = (list: Array<Record<string, any>>) => {
      list?.forEach((_) => {
        _.uniqueId = Math.random().toString(36).slice(-8);
        _.stageText = stageMap[_.stage].name;
        _.color = stageMap[_.stage].color;
        _.dataTime = [
          {
            time: "",
            realTime: ""
          },
          {
            time: _.dev_time,
            realTime: _.real_dev_time
          },
          {
            time: _.union_time,
            realTime: _.real_union_time
          },
          {
            time: _.test_time,
            realTime: _.real_test_time
          },
          {
            time: _.release_time,
            realTime: _.real_release_time
          }
        ];
      });
      return list;
    };
    const pickDay = (day: Dayjs, list: Array<Record<string, any>>): void => {
      iterationLists.value = transformList(list);
      const year = day.get("year");
      const month = day.get("month") + 1;
      const date = day.get("date");
      currentSelectDate.value = `${year}.${month}.${date}`;
    };
    const getData = (params: typeof searchParams, cb?: (...args: Array<unknown>) => void) => {
      if (!params.product_id) return;
      getCalendarLists<ResponseParams.ResponseDataSuccess>(params).then((res) => {
        console.log(res.data, "res.data");
        lists.value = res.data;
        cb && cb(res.data);
      });
    };
    getData(searchParams, (data) => {
      (data as Array<Record<string, any>>).forEach((item: Record<string, any>) => {
        const date = item.date.replace(/-/g, "/");
        if (new Date(date).getTime() === new Date(currentDay).getTime()) {
          iterationLists.value = transformList(item.list);
        }
      });
    });

    watch(currentDate, (newVal, oldVal) => {
      const newValMonth = new Date(newVal as Date).getMonth() + 1;
      const oldValMonth = new Date(oldVal as Date).getMonth() + 1;
      if (newValMonth !== oldValMonth) {
        let currentClickTime = new Date(dayjs(newVal as Date).format("YYYY-MM-DD")).getTime();
        (searchParams.month = formate(currentDate.value as Date)),
          getData(searchParams, (data) => {
            (data as Array<Record<string, any>>).forEach((item: Record<string, any>) => {
              if (new Date(item.date).getTime() === currentClickTime) {
                iterationLists.value = transformList(item.list);
                calendarWrapper.value.scrollTop = 0;
              }
            });
          });
      }
    });
    // const { productLists } = replaceProductId();

    const handleConditionSearch = () => {
      getData(searchParams);
      iterationLists.value = [];
    };
    useWatchChangeProduct(handleConditionSearch, (newValue) => {
      searchParams.product_id = newValue as number;
      searchParams.iteration_id = [];
      handleConditionSearch();
    });
    //#endregion
    return {
      iterateList,
      iterateListData,
      OVERVIEW_CALENDAR_STATUS,
      calendarWrapper,
      lists,
      currentDate,
      // closeSide,
      pickDay,
      // isShowSide,
      currentSelectDate,
      iterationLists,
      getData,
      searchParams,
      // productLists,
      handleConditionSearch,
      stageMap
    };
  }
});
</script>

<style scoped lang="less">
.calendar__wrapper {
  overflow: hidden;
  // margin: 0;
  padding: 20px;
  box-sizing: border-box;
  background: #fff;
  display: flex;
  justify-content: space-between;
  width: 100%;
  .calendar__wrapper__day {
    // background: #fff;
    // overflow: auto;
    // width: 109%;
  }
  .calendar__wrapper__detail__common {
    position: relative;
    transition: all 0.5s;
    height: 100%;
    width: 0;
  }
  .calendar__wrapper__sideBody__imgWrapper {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    overflow: hidden;
  }
  .calendar__wrapper__sideBody__imgWrapper + p {
    margin-left: 12px;
    font-size: 14px;
    color: rgba(87, 87, 87, 1);
  }
  .calendar__wrapper__sideBody__imgWrapper img {
    width: 100%;
    height: 100%;
  }
  .calendar__datepicker__descText {
    // word-break: break-all;
    font-size: 14px;
    li {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .calendar__datepicker {
    margin-bottom: 20px;
    text-align: right;
  }
  .calendar__datepicker__dayText {
    line-height: 0;
    font-size: 14px;
    text-align: left;
    color: #999;
  }
  // .calendar__datepicker__symbol {
  //   font-size: 10px;
  //   color: #999;
  // }
  .calendar__datepicker__symbol + span {
    color: rgba(87, 87, 87, 1);
  }
  .calendar__wrapper__detail {
    font-size: 12px;
    box-sizing: border-box;
    padding: 10px;
    padding-top: 0px;
    min-width: 310px;
    height: 100%;
    background: #fff;
    margin: 0 auto;
    // border: 1px solid red;
    h4 {
      font-size: 16px;
      line-height: 0;
    }
  }
  :deep(.el-card) {
    border-radius: 15px;
  }
  .detail__card {
    position: relative;
  }
  .detail__card:last-child {
    margin-bottom: 40px;
  }
  .calendar__wrapper__detail__progress {
    position: relative;
    left: -30%;
    transform: scale(0.6);
  }
  :deep(.time-text__real) {
    bottom: 25px;
    p {
      font-size: 18px;
    }
  }
  :deep(.time-text__plan) {
    bottom: -64px;
    p {
      font-size: 18px;
    }
  }
  :deep(.rp-progressBar) {
    min-height: 50px;
  }
  .flex-layout {
    line-height: 0;
    height: 30px;
    display: flex;
    align-items: center;
  }
  :deep(.el-main) {
    padding: 10px;
  }
  :deep(.el-tag) {
    transform: scale(0.8);
  }
  :deep(.el-calendar__body) {
    padding-bottom: 50px;
    padding-top: 0;
  }
  .scrollbar {
    // padding-bottom: 200px;
    // margin-bottom: 200px;
    width: 100%;
  }
  :deep(.time-text__real) {
    p {
      line-height: 6px;
    }
  }
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}
</style>
