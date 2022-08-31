<template>
  <div v-if="hasDiedai" class="reports">
    <div class="reports-left reports-side">
      <p class="reports-title">周报历史</p>

      <div class="reports-left__body">
        <WeekItems v-for="n in weeks" :item="n" :key="n.iteration_id" />
      </div>
    </div>
    <div class="reports-right reports-side">
      <p class="reports-title">新增周报</p>
      <div class="reports-content" ref="content">
        <p>
          <el-date-picker
            :disabled-date="disabledTime"
            type="week"
            @change="onChange"
            v-model="curWeek"
            format="第 w 周"
            value-format="YYYY-MM-DD"
            placeholder="请选择周"
          ></el-date-picker>
          <span class="reports-week">本周总结</span>
          {{ curWeekVal }}
        </p>
        <textarea class="textarea" placeholder="请输入本周总结" v-model="summary" :style="{ height: inputHgt + 'px' }"></textarea>
        <p>
          <el-date-picker disabled v-model="nextWeek" type="week" format="第 w 周" value-format="YYYY-MM-DD" placeholder="请选择周"></el-date-picker>
          <span class="reports-week">下周计划</span>
          {{ nextWeekVal }}
        </p>
        <textarea class="textarea" placeholder="请输入下周计划" v-model="plan" :style="{ height: inputHgt + 'px' }"></textarea>
        <p class="reports-btn">
          <el-button type="primary" @click="save">保存</el-button>
        </p>
      </div>
    </div>
  </div>
  <el-empty v-else description="暂无数据"></el-empty>
</template>

<script lang="ts">
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { computed, onMounted, ref, watch } from "vue";
import WeekItems from "./components/week-items.vue";
import useIteration from "@/composables/useIteration";
import type { SaveWeekReportInter, WeekReportItemInter } from "@/composables/useIteration";
import useMixin from "../useMixin";
import useMessageTip from "@/composables/useMessageTip";
import { ElMessage } from "element-plus";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekday from "dayjs/plugin/weekday";
import { store } from "@/store";
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.locale("zh-cn");
export default {
  name: "reports"
};
</script>

<script lang="ts" setup>
const content = ref(); // content dom
const inputHgt = ref(120); // textarea 的高度
const summary = ref(""); // 本周总结
const plan = ref(""); // 规划
const curWeek = ref(""); // 本周时间
const nextWeek = ref(""); // 下周时间
const weeks = ref<WeekReportItemInter[] | null>(null);
let hasRequest = false;
const iterateId = computed(() => store.getters.iterateId);

const { useSaveWeekReports, getWeekReportsList, getWeekReportsByWeek } = useIteration();
const { result } = useMixin(true);
const { tipMessage } = useMessageTip();

// 本周val
const curWeekVal = computed(() => {
  if (!curWeek.value) return "";
  return `(${dayjs(curWeek.value).weekday(0).format("YYYY-MM-DD")}-${dayjs(curWeek.value).weekday(6).format("YYYY-MM-DD")})`;
});
// 下周val
const nextWeekVal = computed(() => {
  if (!nextWeek.value) return "";
  return `(${dayjs(nextWeek.value).weekday(0).format("YYYY-MM-DD")}-${dayjs(nextWeek.value).weekday(6).format("YYYY-MM-DD")})`;
});

const hasDiedai = computed(() => {
  return iterateId.value;
});
const disabledTime = computed(function () {
  return function (time: Date) {
    return new Date(time).getTime() > new Date().getTime();
  };
});

// 获取报告list
const getList = async () => {
  if (!iterateId.value) return;
  const data = await getWeekReportsList(iterateId.value);
  if (data) {
    weeks.value = data;
  }
};

onMounted(async () => {
  curWeek.value = dayjs(new Date()).format("YYYY-MM-DD");
  // 获取textarea的高度
  if (iterateId.value && !hasRequest) {
    hasRequest = true;
    await getList();
    handleInputHeight();
    onChange();
  }
});

watch(
  () => iterateId.value,
  async () => {
    await getList();
    onChange();
    if (inputHgt.value === 120) {
      handleInputHeight();
    }
  }
);
watch(
  () => result.value,
  () => {
    summary.value = "";
    plan.value = "";
    curWeek.value = dayjs(new Date()).format("YYYY-MM-DD");
    onChange();
    getList();
  },
  {
    deep: true
  }
);

// 调整高度
const handleInputHeight = () => {
  let { height } = content.value?.getBoundingClientRect();
  if (height) {
    height = Math.floor(height) - 180;
    inputHgt.value = height / 2;
  }
};

// 校验填写
const checkVal = () => {
  if (!summary.value.trim()) {
    ElMessage.warning("请填写本周总结");
    return false;
  } else if (!plan.value.trim()) {
    ElMessage.warning("请填写下周计划");
    return false;
  } else if (!curWeek.value) {
    ElMessage.warning("请选择周报时间");
    return false;
  }
  return true;
};

// 获取当前周报、上周计划安排
const getItems = async () => {
  if (!curWeek.value || !iterateId.value) return;
  let week = (dayjs(curWeek.value) as any).week();
  week = dayjs().format("YYYY") + (week > 9 ? week : `0${week}`);

  const data = await getWeekReportsByWeek(iterateId.value, week);
  if (data) {
    summary.value = data!.summary;
    plan.value = data!.next_week_plan;
  } else {
    summary.value = "";
    plan.value = "";
  }
};

// 保存
const save = async () => {
  // 文本过滤
  const text1 = summary.value.trim().replace(/\n+/g, "\n");
  const text2 = plan.value.trim().replace(/\n+/g, "\n");
  // 校验
  if (!checkVal()) return;
  // 得出当前周数
  let week = (dayjs(curWeek.value) as any).week();
  week = dayjs(curWeek.value).format("YYYY") + (week > 9 ? week : `0${week}`);
  const params: SaveWeekReportInter = {
    plan: text2,
    summary: text1,
    week: parseInt(week),
    iteration_id: iterateId.value
  };
  // 是否保存成功
  const isTrue = await useSaveWeekReports(params);
  if (isTrue) {
    summary.value = plan.value = nextWeek.value = curWeek.value = "";
  }
  tipMessage(isTrue ? 200 : 0, isTrue ? "保存成功" : "保存失败");
  // 更新列表
  isTrue && getList();
};

const onChange = () => {
  if (!curWeek.value) {
    nextWeek.value = "";
    return;
  }
  const t = 7 * 24 * 60 * 60 * 1000;
  nextWeek.value = dayjs(new Date(curWeek.value).getTime() + t).format("YYYY-MM-DD");
  getItems();
};
</script>

<style lang="less" scoped>
.reports {
  background-color: #fff;
  display: flex;
  padding: 20px;
  font-size: 14px;

  &-side {
    width: 50%;
    height: 96%;
    border-right: 1px solid #ddd;
    &:last-child {
      border: none;
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      overflow-y: scroll;
    }
  }

  &-left {
    &__body {
      overflow-y: scroll;
      padding-right: 20px;
      overflow-y: scroll;
      height: 95%;
    }
  }

  &-title {
    margin: 0;
    padding-bottom: 10px;
  }

  &-week {
    font-weight: bold;
    padding-left: 10px;
  }

  &-content {
    flex: 1;

    :deep(.el-textarea__inner) {
      height: inherit;
      min-height: inherit;
    }
  }
  &-btn {
    text-align: center;
  }
}

.textarea {
  font-size: 12px !important;
  display: block;
  resize: vertical;
  padding: 5px 15px;
  line-height: 1.5;
  box-sizing: border-box;
  width: 100%;
  font-size: inherit;
  color: #606266;
  background-color: #fff;
  background-image: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

  &:focus {
    outline: 0;
    border-color: #1f9f85;
  }
}

.content {
  background-color: #fff;
}
</style>
