<template>
  <div class="project-dynamics">
    <div class="timeline-groups" v-loading="loading" v-if="!dashIsEmpty">
      <div class="timeline-group" v-for="(key, ii) in dashKeys" :key="key">
        <div class="timeline-group" v-if="dashData[key as keyof typeof dashData]">
          <div class="timeline-title" @click="changefoldStatus(ii)">
            <el-icon
              ><template v-if="foldStatus[key as keyof typeof foldStatus]"> <CaretRight /></template><template v-else><CaretBottom /> </template></el-icon
            >{{ ["已延期", "今天", "明天", "本周", "本月", "其他"][ii] }}
          </div>
          <div class="timeline-list" v-if="!foldStatus[key as keyof typeof foldStatus]">
            <div
              :class="[curId === item.id ? 'isActive' : '', 'timeline-item']"
              v-for="item in dashData[key as keyof typeof dashData]"
              :key="`timeline${item.id}`"
            >
              <div class="timeline-item-left">
                <span class="type-status-tag" :style="statusType(item.type, 1)">{{ statusType(item.type, 0) }}</span>
                <span class="item-status">
                  <selectOption
                    :valueKey="['value', 'label']"
                    keyVal="status"
                    currentType="status"
                    :currentVal="item.status"
                    :type="1"
                    :item="item"
                    :optionsData="getStatusList(item.type)"
                    @onChangeSelect="onChangeSelect"
                  ></selectOption>
                </span>
                <span class="item-name" @click.stop="handleDetail(item)">{{ item.name }}</span>
              </div>
              <div class="timeline-item-right">
                <span :class="`item-time ${ii == 0 ? 'time-postpone' : ''}`">{{ item.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="timeline-empty">
      <el-empty class="todo-empty-img" style="padding: 0; margin-top: 0px" description="暂无数据" />
    </div>
  </div>
</template>
<script lang="ts">
import { ResponseParams } from "@/types/response";
import { onMounted, ref, defineEmits, defineProps, watch } from "vue";
import { WORK_TYPE, TASK_TYPE, BUG_STATUS } from "@/utils/index";
import selectOption from "@/businessComponents/selectOption/index.vue";
import { getTimeline } from "@/api/request-modules/workbench";
import type { ResponseDataSuccess } from "@/types/interface";
import { CaretRight, CaretBottom } from "@element-plus/icons";
import { DEMAND_STATUS } from "@/utils/contantOptions";
import { updateBug } from "@/api/request-modules/test";
import { updateBasicTask } from "@/api/request-modules/iteration";
import { editDemand } from "@/api/request-modules/product";
import useMessageTip from "@/composables/useMessageTip";
import VueEvent from "@/utils/mitt";
import { useRoute } from "vue-router";

export default {
  name: "panelTimeline"
};
</script>
<script lang="ts" setup>
interface TimelineItem {
  date: string;
  id: number;
  name: string;
  status: number;
  target_id: number;
  type: number;
}

interface TimelineList {
  delay?: null | TimelineItem[];
  today?: null | TimelineItem[];
  tomorrow?: null | TimelineItem[];
  this_week?: null | TimelineItem[];
  this_month?: null | TimelineItem[];
  other?: null | TimelineItem[];
}

interface FoldStatus {
  delay?: boolean;
  today?: boolean;
  tomorrow?: boolean;
  this_week?: boolean;
  this_month?: boolean;
  other?: boolean;
}

const props = defineProps({
  update: {
    type: Number,
    default: () => {
      return 0;
    }
  }
});

watch(
  () => props.update,
  (newVal, oldVal) => {
    if (newVal && newVal != oldVal) {
      getDashboardData();
    }
  }
);
const curId = ref(0);
const { tipMessage } = useMessageTip();

const emit = defineEmits(["lookDetail"]);
const loading = ref(false);
const dashData = ref<TimelineList>({});
const foldStatus = ref<FoldStatus>({
  delay: false,
  today: false,
  tomorrow: false,
  this_week: false,
  this_month: false,
  other: false
});

const dashIsEmpty = ref(false);
const dashKeys = ref<string[]>([]);
const getDashboardData = async () => {
  loading.value = true;
  const res: ResponseDataSuccess = await getTimeline();
  if (res.code === 200 && res.data) {
    dashKeys.value = Object.keys(res.data);
    dashData.value = res.data as TimelineList;
    // 是否为空条件判断
    const { delay, today, tomorrow, this_week, this_month, other } = res.data;
    if (
      (!delay || !delay.length) &&
      (!today || !today.length) &&
      (!tomorrow || !tomorrow.length) &&
      (!this_week || !this_week.length) &&
      (!this_month || !this_month.length) &&
      (!other || !other.length)
    ) {
      dashIsEmpty.value = true;
    } else {
      dashIsEmpty.value = false;
    }
  }
  loading.value = false;
};

const changefoldStatus = (index: number) => {
  if (index === 0) {
    const oldValue = foldStatus.value?.delay;
    foldStatus.value.delay = !oldValue;
  } else if (index === 1) {
    const oldValue = foldStatus.value?.today;
    foldStatus.value.today = !oldValue;
  } else if (index === 2) {
    const oldValue = foldStatus.value?.tomorrow;
    foldStatus.value.tomorrow = !oldValue;
  } else if (index === 3) {
    const oldValue = foldStatus.value?.this_week;
    foldStatus.value.this_week = !oldValue;
  } else if (index === 4) {
    const oldValue = foldStatus.value?.this_month;
    foldStatus.value.this_month = !oldValue;
  } else if (index === 5) {
    const oldValue = foldStatus.value?.other;
    foldStatus.value.other = !oldValue;
  }
};

const onChangeSelect = (val: string | number, item: Record<string, any>, key?: string) => {
  const status = item.type;
  const list: Record<string, any> | undefined = WORK_TYPE.find((v: { value: number; label: string }) => v.value === status);
  if (list?.value === 5) {
    const params: Record<string, any> = {
      id: [item.target_id],
      field: "demand_status"
    };
    if (key === "status") params.demand_status = val;
    editDemand<ResponseParams.ResponseDataSuccess>(params).then(() => {
      getDashboardData();
      tipMessage(200, "成功");
    });
  } else if (list?.value === 2) {
    const params: Record<string, any> = {
      ids: [item.target_id],
      field: key
    };
    if (key === "status") params.status = val;
    updateBasicTask<ResponseParams.ResponseDataSuccess>(params).then((res) => {
      if (res.code === 200) {
        getDashboardData();
        tipMessage(200, "成功");
      }
    });
  } else if (list?.value === 3) {
    const params: Record<string, any> = {
      id: [item.target_id],
      field: key
    };
    if (key === "status") params.status = val;
    updateBug<ResponseParams.ResponseDataSuccess>(params as any).then((res) => {
      if (res.code === 200) {
        getDashboardData();
        tipMessage(200, "成功");
      }
    });
  }
  VueEvent.emit("drawStatus", false);
};
const route = useRoute();
// 监听抽屉组件状态 val 抽屉状态true：开 false: 关
VueEvent.on("drawStatus", (val) => {
  if (route.path === "/workbench/dashboard") {
    if (!val) {
      curId.value = 0;
    }
  }
});

const statusType = (status: number, type: number) => {
  const list: Record<string, any> | undefined = WORK_TYPE.find((v: { value: number; label: string }) => v.value === status);
  if (type) {
    return { background: list?.color };
  } else {
    return list?.label;
  }
};

const getStatusList = (status: number | string) => {
  const list: Record<string, any> | undefined = WORK_TYPE.find((v: { value: number; label: string }) => v.value === status);
  if (list?.value === 5) {
    // 需求
    return DEMAND_STATUS;
  } else if (list?.value === 2) {
    // 任务
    return TASK_TYPE;
  } else if (list?.value === 3) {
    // BUG
    return BUG_STATUS.slice().splice(1, BUG_STATUS.length);
  }
};

const handleDetail = (val: Record<string, any>) => {
  curId.value = val.id;
  emit("lookDetail", val);
};

onMounted(() => {
  getDashboardData();
});
</script>

<style lang="less" scoped>
.project-dynamics {
  height: calc(100% - 20px);
  padding: 0px 10px;
}

.timeline-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.timeline-groups {
  .timeline-group {
    margin-bottom: 10px;
  }
  .timeline-title {
    line-height: 40px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 14px;
    color: #5f6f8d;
    cursor: pointer;

    .el-icon {
      color: #b1dfd0;
      margin-right: 4px;
      font-size: 20px;
    }
    &:hover {
      .el-icon {
        color: #2e9563;
      }
    }
  }
  .timeline-list {
    position: relative;
    transition: all 500ms ease;
  }
  .timeline-item {
    position: relative;
    padding: 0px 10px 0px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    box-sizing: border-box;
    &:hover {
      background-color: #f2f5f9;
    }
    .timeline-item-left {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: calc(100% - 110px);
    }
    .timeline-item-right {
      width: 110px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
    .item-type-1 {
      background-color: #9e63fc;
    }
    .item-type-2 {
      background-color: #7fad0a;
    }
    .item-type-3 {
      background-color: #ff777e;
    }

    .type-status-tag {
      display: inline-block;
      padding: 0 7px;
      font-size: 10px;
      line-height: 18px;
      white-space: nowrap;
      border-radius: 3px;
      line-height: 18px;
      color: #fff;
    }
    .item-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      color: #333;
      &:hover {
        cursor: pointer;
      }
    }
    .item-status {
      font-size: 12px;
      width: 96px;
      min-width: 96px;
      display: inline-block;
      text-align: center;
      margin: 0px 10px;
    }
    .item-time {
      font-size: 10px;
      color: #666;
      padding: 0px 7px;
      height: 20px;
      line-height: 20px;
      border-radius: 3px;
      background-color: #f0f9ea;
    }
    .time-postpone {
      background-color: #ffedec !important;
    }
  }
  .isActive {
    background-color: #ebf5f3;
  }
}
</style>
