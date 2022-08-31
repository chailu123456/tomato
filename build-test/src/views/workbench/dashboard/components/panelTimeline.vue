<template>
  <div class="project-dynamics">
    <div class="timeline-groups" v-loading="loading">
      <!-- 已延期列表 -->
      <div class="timeline-group" v-if="dashData?.delay">
        <div class="timeline-title" @click="changefoldStatus(0)">
          <el-icon
            ><template v-if="foldStatus.delay"><CaretBottom /></template><template v-else><CaretTop /></template
          ></el-icon>
          已延期
        </div>
        <div class="timeline-list" v-if="!foldStatus.delay">
          <div class="timeline-item" v-for="(item, index) in dashData.delay" :key="`delay${index}`">
            <div class="timeline-item-left">
              <span class="type-status-tag" :style="statusType(item.type, 1)">{{ statusType(item.type, 0) }}</span>
              <span class="item-status">
                <selectOption
                  :valueKey="['value', 'label']"
                  keyVal="status"
                  currentType="status"
                  :currentVal="item.status"
                  :type="1"
                  :optionsData="getStatusList(item.type)"
                ></selectOption>
              </span>
              <span class="item-name" @click="handleDetail(item)">{{ item.name }}</span>
            </div>
            <div class="timeline-item-right">
              <span class="item-time time-postpone">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 今天列表 -->
      <div class="timeline-group" v-if="dashData?.today">
        <div class="timeline-title" @click="changefoldStatus(1)">
          <el-icon
            ><template v-if="foldStatus.today"><CaretBottom /></template><template v-else><CaretTop /></template></el-icon
          >今天
        </div>
        <div class="timeline-list" v-if="!foldStatus.today">
          <div class="timeline-item" v-for="(item, index) in dashData.today" :key="`delay${index}`">
            <div class="timeline-item-left">
              <span class="type-status-tag" :style="statusType(item.type, 1)">{{ statusType(item.type, 0) }}</span>
              <span class="item-status">
                <selectOption
                  :valueKey="['value', 'label']"
                  keyVal="status"
                  currentType="status"
                  :currentVal="item.status"
                  :type="1"
                  :optionsData="getStatusList(item.type)"
                ></selectOption>
              </span>
              <span class="item-name">{{ item.name }}</span>
            </div>
            <div class="timeline-item-right">
              <span class="item-time">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 明天列表 -->
      <div class="timeline-group" v-if="dashData?.tomorrow">
        <div class="timeline-title" @click="changefoldStatus(2)">
          <el-icon
            ><template v-if="foldStatus.tomorrow"><CaretBottom /></template><template v-else><CaretTop /></template></el-icon
          >明天
        </div>
        <div class="timeline-list" v-if="!foldStatus.tomorrow">
          <div class="timeline-item" v-for="(item, index) in dashData.tomorrow" :key="`delay${index}`">
            <div class="timeline-item-left">
              <span class="type-status-tag" :style="statusType(item.type, 1)">{{ statusType(item.type, 0) }}</span>
              <span class="item-status">
                <selectOption
                  :valueKey="['value', 'label']"
                  keyVal="status"
                  currentType="status"
                  :currentVal="item.status"
                  :type="1"
                  :optionsData="getStatusList(item.type)"
                ></selectOption>
              </span>
              <span class="item-name">{{ item.name }}</span>
            </div>
            <div class="timeline-item-right">
              <span class="item-time">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 本周列表 -->
      <div class="timeline-group" v-if="dashData?.this_week">
        <div class="timeline-title" @click="changefoldStatus(3)">
          <el-icon
            ><template v-if="foldStatus.this_week"><CaretBottom /></template><template v-else><CaretTop /></template></el-icon
          >本周
        </div>
        <div class="timeline-list" v-if="!foldStatus.this_week">
          <div class="timeline-item" v-for="(item, index) in dashData.this_week" :key="`delay${index}`">
            <div class="timeline-item-left">
              <span class="type-status-tag" :style="statusType(item.type, 1)">{{ statusType(item.type, 0) }}</span>
              <span class="item-status">
                <selectOption
                  :valueKey="['value', 'label']"
                  keyVal="status"
                  currentType="status"
                  :currentVal="item.status"
                  :type="1"
                  :optionsData="getStatusList(item.type)"
                ></selectOption>
              </span>
              <span class="item-name">{{ item.name }}</span>
            </div>
            <div class="timeline-item-right">
              <span class="item-time">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 本月列表 -->
      <div class="timeline-group" v-if="dashData?.this_month">
        <div class="timeline-title" @click="changefoldStatus(4)">
          <el-icon
            ><template v-if="foldStatus.this_month"><CaretBottom /></template><template v-else><CaretTop /></template></el-icon
          >本月
        </div>
        <div class="timeline-list" v-if="!foldStatus.this_month">
          <div class="timeline-item" v-for="(item, index) in dashData.this_month" :key="`delay${index}`">
            <div class="timeline-item-left">
              <span class="type-status-tag" :style="statusType(item.type, 1)">{{ statusType(item.type, 0) }}</span>
              <span class="item-status">
                <selectOption
                  :valueKey="['value', 'label']"
                  keyVal="status"
                  currentType="status"
                  :currentVal="item.status"
                  :type="1"
                  :optionsData="getStatusList(item.type)"
                ></selectOption>
              </span>
              <span class="item-name">{{ item.name }}</span>
            </div>
            <div class="timeline-item-right">
              <span class="item-time">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 其他列表 -->
      <div class="timeline-group" v-if="dashData?.other">
        <div class="timeline-title" @click="changefoldStatus(5)">
          <el-icon
            ><template v-if="foldStatus.other"><CaretBottom /></template><template v-else><CaretTop /></template></el-icon
          >其他
        </div>
        <div class="timeline-list" v-if="!foldStatus.other">
          <div class="timeline-item" v-for="(item, index) in dashData.other" :key="`delay${index}`">
            <div class="timeline-item-left">
              <span class="type-status-tag" :style="statusType(item.type, 1)">{{ statusType(item.type, 0) }}</span>
              <span class="item-status">
                <selectOption
                  :valueKey="['value', 'label']"
                  keyVal="status"
                  currentType="status"
                  :currentVal="item.status"
                  :type="1"
                  :optionsData="getStatusList(item.type)"
                ></selectOption>
              </span>
              <span class="item-name">{{ item.name }}</span>
            </div>
            <div class="timeline-item-right">
              <span class="item-time">{{ item.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { onMounted, ref, defineEmits } from "vue";
import { WORK_TYPE, TASK_TYPE, BUG_STATUS } from "@/utils/index";
import selectOption from "@/businessComponents/selectOption/index.vue";
import { getTimeline } from "@/api/request-modules/workbench";
import type { ResponseDataSuccess } from "@/types/interface";
import { CaretBottom, CaretTop } from "@element-plus/icons";
import { DEMAND_STATUS } from "@/utils/contantOptions";
import VueEvent from "@/utils/mitt";

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
const getDashboardData = async () => {
  loading.value = true;
  const res: ResponseDataSuccess = await getTimeline();
  if (res.code === 200 && res.data) {
    dashData.value = res.data as TimelineList;
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
    return DEMAND_STATUS;
  } else if (list?.value === 2) {
    return TASK_TYPE;
  } else if (list?.value === 3) {
    return BUG_STATUS;
  }
};

const handleDetail = (val: Record<string, any>) => {
  emit("lookDetail", val);
};

// 监听抽屉组件状态 val 抽屉状态true：开 false: 关
VueEvent.on("drawStatus", (val) => {
  console.log(val);
  console.log(val);
  console.log(val);
});

onMounted(() => {
  getDashboardData();
});
</script>

<style lang="less" scoped>
.project-dynamics {
  height: 100%;
  padding: 0px 10px;
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
  }
  .timeline-item {
    position: relative;
    margin: 0px 10px 0px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    box-sizing: border-box;
    .timeline-item-left {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: calc(100% - 80px);
    }
    .timeline-item-right {
      width: 80px;
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
      background-color: #ff4b4b;
    }
    .type-status-tag {
      display: inline-block;
      padding: 0 7px;
      font-size: 12px;
      line-height: 18px;
      white-space: nowrap;
      border-radius: 10px;
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
        text-decoration: underline;
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
      border-radius: 10px;
      background-color: #f0f9ea;
    }
    .time-postpone {
      background-color: #ffedec !important;
    }
  }
}
</style>
